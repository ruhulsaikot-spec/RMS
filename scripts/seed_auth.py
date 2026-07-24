"""
RMS Backend - Auth Module Seed Data

Initializes the database with default roles, permissions, and
an admin user. Run this script after the initial migration.

Usage:
    python -m scripts.seed_auth

Environment variables must be configured in .env before running.
"""

from __future__ import annotations

import asyncio
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.auth.models.auth import Permission, Role, User, role_permissions, user_roles
from app.auth.password_utils import hash_password
from app.auth.permissions import ROLE_PERMISSIONS, Permissions, Roles
from app.core.config import settings
from app.core.database import async_session_factory
from app.core.logging import get_logger, setup_logging

logger = get_logger(__name__)


# ── Default Admin Configuration ───────────────────────────────
DEFAULT_ADMIN_EMAIL = "admin@rms-enterprise.com"
DEFAULT_ADMIN_PASSWORD = "Admin@2024!"  # Must be changed on first login
DEFAULT_ADMIN_NAME = "System Administrator"


async def seed_roles(db) -> dict[str, Role]:
    """
    Create the four system roles: admin, employee, approver, finance.

    Args:
        db: Async database session.

    Returns:
        Dictionary mapping role name to Role model instance.
    """
    from sqlalchemy import select

    role_configs = [
        {
            "name": Roles.ADMIN,
            "display_name": "Administrator",
            "description": "Full system access with all permissions. Can manage users, roles, configurations, and all modules.",
            "is_system_role": True,
            "priority": 100,
        },
        {
            "name": Roles.EMPLOYEE,
            "display_name": "Employee",
            "description": "Standard employee access for creating and managing own reimbursements, viewing department info, and receiving notifications.",
            "is_system_role": True,
            "priority": 10,
        },
        {
            "name": Roles.APPROVER,
            "display_name": "Approver",
            "description": "Approval authority with access to review, approve, or reject reimbursement requests. Includes all employee permissions plus approval delegation.",
            "is_system_role": True,
            "priority": 50,
        },
        {
            "name": Roles.FINANCE,
            "display_name": "Finance Officer",
            "description": "Financial processing access for payment creation, processing, and approval. Includes report export and financial audit capabilities.",
            "is_system_role": True,
            "priority": 70,
        },
    ]

    roles: dict[str, Role] = {}

    for config in role_configs:
        stmt = select(Role).where(Role.name == config["name"])
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            logger.info("role_exists", name=config["name"])
            roles[config["name"]] = existing
        else:
            role = Role(**config)
            db.add(role)
            roles[config["name"]] = role
            logger.info("role_created", name=config["name"])

    await db.flush()
    return roles


async def seed_permissions(db) -> dict[str, Permission]:
    """
    Create all permissions defined in the Permissions class.

    Args:
        db: Async database session.

    Returns:
        Dictionary mapping permission code to Permission model instance.
    """
    from sqlalchemy import select

    # Extract all permission constants from the Permissions class
    perm_attrs = [
        attr for attr in dir(Permissions)
        if attr.isupper() and not attr.startswith("_")
    ]

    permissions: dict[str, Permission] = {}

    for attr_name in perm_attrs:
        code = getattr(Permissions, attr_name)
        if not isinstance(code, str) or ":" not in code:
            continue

        resource, action = code.split(":", 1)

        stmt = select(Permission).where(Permission.code == code)
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            permissions[code] = existing
        else:
            perm = Permission(
                code=code,
                name=attr_name.replace("_", " ").title(),
                description=f"Permission to {action} {resource} resources",
                resource=resource,
                action=action,
                is_active=True,
            )
            db.add(perm)
            permissions[code] = perm
            logger.info("permission_created", code=code)

    await db.flush()
    return permissions


async def assign_role_permissions(
    db, roles: dict[str, Role], permissions: dict[str, Permission]
) -> int:
    """
    Assign permissions to roles based on the ROLE_PERMISSIONS mapping.

    Args:
        db: Async database session.
        roles: Dictionary of role name to Role instance.
        permissions: Dictionary of permission code to Permission instance.

    Returns:
        Number of role-permission assignments created.
    """
    count = 0

    for role_name, perm_codes in ROLE_PERMISSIONS.items():
        role = roles.get(role_name)
        if not role:
            logger.warning("role_not_found", name=role_name)
            continue

        for perm_code in perm_codes:
            perm = permissions.get(perm_code)
            if not perm:
                logger.warning("permission_not_found", code=perm_code)
                continue

            # Check if already assigned
            from sqlalchemy import select

            stmt = select(role_permissions).where(
                role_permissions.c.role_id == role.id,
                role_permissions.c.permission_id == perm.id,
            )
            result = await db.execute(stmt)
            if result.first():
                continue

            await db.execute(
                role_permissions.insert().values(
                    role_id=role.id,
                    permission_id=perm.id,
                    granted_by="system",
                )
            )
            count += 1
            logger.info("permission_assigned", role=role_name, permission=perm_code)

    await db.flush()
    return count


async def seed_admin_user(db, roles: dict[str, Role]) -> User | None:
    """
    Create the default admin user with the admin role.

    The admin user is created with a temporary password that must
    be changed on first login (must_change_password=True).

    Args:
        db: Async database session.
        roles: Dictionary of role name to Role instance.

    Returns:
        The created admin User instance, or None if already exists.
    """
    from sqlalchemy import select

    stmt = select(User).where(User.email == DEFAULT_ADMIN_EMAIL)
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()

    if existing:
        logger.info("admin_user_exists", email=DEFAULT_ADMIN_EMAIL)
        return None

    admin_user = User(
        email=DEFAULT_ADMIN_EMAIL,
        password_hash=hash_password(DEFAULT_ADMIN_PASSWORD),
        full_name=DEFAULT_ADMIN_NAME,
        is_active=True,
        is_superuser=True,
        account_status="active",
        must_change_password=True,
        password_changed_at=datetime.now(timezone.utc),
    )
    db.add(admin_user)
    await db.flush()

    # Assign admin role
    admin_role = roles.get(Roles.ADMIN)
    if admin_role:
        await db.execute(
            user_roles.insert().values(
                user_id=admin_user.id,
                role_id=admin_role.id,
                assigned_by="system",
            )
        )

    logger.info(
        "admin_user_created",
        email=DEFAULT_ADMIN_EMAIL,
        user_id=admin_user.id,
        note="Default password must be changed on first login",
    )

    return admin_user


async def run_seed() -> None:
    """
    Execute the complete auth module seed process.

    Steps:
    1. Create system roles (admin, employee, approver, finance)
    2. Create all permissions
    3. Assign permissions to roles
    4. Create default admin user
    """
    setup_logging()
    logger.info("auth_seed_starting")

    async with async_session_factory() as db:
        try:
            # Step 1: Create roles
            logger.info("seeding_roles")
            roles = await seed_roles(db)

            # Step 2: Create permissions
            logger.info("seeding_permissions")
            permissions = await seed_permissions(db)

            # Step 3: Assign permissions to roles
            logger.info("assigning_role_permissions")
            assignment_count = await assign_role_permissions(db, roles, permissions)
            logger.info("permissions_assigned", count=assignment_count)

            # Step 4: Create admin user
            logger.info("seeding_admin_user")
            admin = await seed_admin_user(db, roles)

            # Commit all changes
            await db.commit()

            # Print summary
            print("\n" + "=" * 60)
            print("  Auth Module Seed Complete")
            print("=" * 60)
            print(f"  Roles created: {len(roles)}")
            print(f"    - {', '.join(roles.keys())}")
            print(f"  Permissions created: {len(permissions)}")
            print(f"  Role-permission assignments: {assignment_count}")
            if admin:
                print(f"\n  Default Admin User:")
                print(f"    Email:    {DEFAULT_ADMIN_EMAIL}")
                print(f"    Password: {DEFAULT_ADMIN_PASSWORD}")
                print(f"    ⚠️  Must change password on first login!")
            print("=" * 60 + "\n")

        except Exception as exc:
            await db.rollback()
            logger.error("auth_seed_failed", error=str(exc))
            raise


if __name__ == "__main__":
    asyncio.run(run_seed())
