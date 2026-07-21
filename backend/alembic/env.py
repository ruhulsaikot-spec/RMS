"""
RMS Backend - Alembic Migration Environment

Async-compatible Alembic configuration that reads database settings
from the application's Pydantic Settings configuration.
Supports both online (connected) and offline (DDL generation) migrations.
"""

from __future__ import annotations

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

# ── Alembic Config ───────────────────────────────────────────
config = context.config

# Set up logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ── Import Application Settings & Models ─────────────────────
# Must import the Base metadata and all models so Alembic
# can detect schema changes for auto-generation.

from app.core.config import settings  # noqa: E402
from app.core.database import Base  # noqa: E402

# Import all models to register them with Base.metadata
# This is CRITICAL for auto-generate to work correctly
# Import all models to register them with Base.metadata
import app.models  # noqa: F401

from app.modules.department.models.department import Department
from app.modules.designation.models.designation import Designation
from app.modules.location.models.location import Location
from app.modules.company.models.company import Company
from app.modules.cost_center.models.cost_center import CostCenter
from app.modules.project.models.project import Project
from app.modules.expense_type.models.expense_type import (
    ExpenseType,
)
from app.modules.employee.models.employee import Employee
from app.modules.user.models.user import User

from app.auth.models.auth import Role
from app.auth.models.auth import Permission
from app.auth.models.auth import AuthEvent
from app.modules.reimbursement.models.reimbursement import (
    ReimbursementApplication,
    ReimbursementApplicationData,
    ReimbursementExpenseItem,
    ReimbursementAttachment,
    ReimbursementApproval,
    ReimbursementPaymentLog,
)
from app.modules.workflow.models.workflow import (
    WorkflowDefinition,
    WorkflowStep,
)
from app.modules.workflow.models.approval_group import (
    ApprovalGroup,
    ApprovalGroupMember,
)
from app.modules.payment_method.models.payment_method import (
    PaymentMethod,
)
from app.modules.uploaded_file.models.uploaded_file import (
    UploadedFile,
)

# Override sqlalchemy.url with application settings
config.set_main_option("sqlalchemy.url", settings.db.dsn)

# Target metadata for autogenerate
target_metadata = Base.metadata


# ── Offline Migration ────────────────────────────────────────
def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    Generates SQL DDL scripts without connecting to the database.
    Useful for CI/CD pipelines and SQL review processes.

    The generated SQL is written to standard output and can be
    captured to a file for manual review and application.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=False,
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


# ── Online Migration ─────────────────────────────────────────
def do_run_migrations(connection: Connection) -> None:
    """
    Execute migrations using the provided database connection.

    Configures Alembic context with the application's metadata
    and enhanced comparison options for accurate change detection.
    """
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
        render_as_batch=False,
        # Include object naming conventions
        naming_convention={
            "ix": "ix_%(column_0_label)s",
            "uq": "uq_%(table_name)s_%(column_0_name)s",
            "ck": "ck_%(table_name)s_%(constraint_name)s",
            "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
            "pk": "pk_%(table_name)s",
        },
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """
    Run async migrations using asyncpg driver.

    Creates an async engine from the Alembic configuration,
    establishes a connection, and runs migrations within
    a transactional context.
    """
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.

    Uses an async event loop to execute migrations with
    the asyncpg driver for PostgreSQL. This is the default
    mode for development and deployment.
    """
    asyncio.run(run_async_migrations())


# ── Entry Point ──────────────────────────────────────────────
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
