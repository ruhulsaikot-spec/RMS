"""create_employees_table

Revision ID: d3ae2579794e
Revises: fa359b1fdd6e
Create Date: 2026-06-15 09:29:24.053012+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d3ae2579794e"
down_revision: Union[str, None] = "fa359b1fdd6e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.create_table(
        "employees",

        sa.Column(
            "id",
            sa.String(length=36),
            nullable=False,
        ),

        sa.Column(
            "employee_id",
            sa.String(length=50),
            nullable=False,
        ),

        sa.Column(
            "name",
            sa.String(length=255),
            nullable=False,
        ),

        sa.Column(
            "email",
            sa.String(length=255),
            nullable=False,
        ),

        sa.Column(
            "mobile",
            sa.String(length=30),
            nullable=True,
        ),

        sa.Column(
            "company_id",
            sa.String(length=36),
            nullable=False,
        ),

        sa.Column(
            "department_id",
            sa.String(length=36),
            nullable=False,
        ),

        sa.Column(
            "designation_id",
            sa.String(length=36),
            nullable=False,
        ),

        sa.Column(
            "location_id",
            sa.String(length=36),
            nullable=False,
        ),

        sa.Column(
            "line_manager_id",
            sa.String(length=36),
            nullable=True,
        ),

        sa.Column(
            "joining_date",
            sa.Date(),
            nullable=False,
        ),

        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),

        sa.Column(
            "created_by",
            sa.String(length=36),
            nullable=True,
        ),

        sa.Column(
            "updated_by",
            sa.String(length=36),
            nullable=True,
        ),

        sa.Column(
            "is_deleted",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),

        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),

        sa.Column(
            "deleted_by",
            sa.String(length=36),
            nullable=True,
        ),

        sa.PrimaryKeyConstraint("id"),

        sa.UniqueConstraint("employee_id"),
        sa.UniqueConstraint("email"),

        sa.ForeignKeyConstraint(
            ["company_id"],
            ["companies.id"],
        ),

        sa.ForeignKeyConstraint(
            ["department_id"],
            ["departments.id"],
        ),

        sa.ForeignKeyConstraint(
            ["designation_id"],
            ["designations.id"],
        ),

        sa.ForeignKeyConstraint(
            ["location_id"],
            ["locations.id"],
        ),

        sa.ForeignKeyConstraint(
            ["line_manager_id"],
            ["employees.id"],
        ),
    )


def downgrade() -> None:

    op.drop_table("employees")