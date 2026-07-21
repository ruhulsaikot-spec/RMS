from app.modules.department.models.department import Department
from app.modules.designation.models.designation import Designation
from app.modules.user.models.user import User
import asyncio

from sqlalchemy import select
from sqlalchemy import insert

from app.core.database import async_session_factory

from app.auth.models.auth import (
    Permission,
    Role,
    role_permissions,
)

PERMISSIONS = [

    ("user:create", "Create User"),
    ("user:read", "View User"),
    ("user:update", "Update User"),
    ("user:delete", "Delete User"),
    ("user:list", "List Users"),
    ("user:manage_roles", "Manage User Roles"),

    ("role:create", "Create Role"),
    ("role:read", "View Role"),
    ("role:update", "Update Role"),
    ("role:delete", "Delete Role"),
    ("role:manage_permissions", "Manage Role Permissions"),

    ("permission:create", "Create Permission"),
    ("permission:read", "View Permission"),

    ("department:create", "Create Department"),
    ("department:read", "View Department"),
    ("department:update", "Update Department"),
    ("department:delete", "Delete Department"),

    ("designation:create", "Create Designation"),
    ("designation:read", "View Designation"),
    ("designation:update", "Update Designation"),
    ("designation:delete", "Delete Designation"),

    ("company:create", "Create Company"),
    ("company:read", "View Company"),
    ("company:update", "Update Company"),
    ("company:delete", "Delete Company"),

    ("employee:create", "Create Employee"),
    ("employee:read", "View Employee"),
    ("employee:update", "Update Employee"),
    ("employee:delete", "Delete Employee"),

    ("location:create", "Create Location"),
    ("location:read", "View Location"),
    ("location:update", "Update Location"),
    ("location:delete", "Delete Location"),

    ("project:create", "Create Project"),
    ("project:read", "View Project"),
    ("project:update", "Update Project"),
    ("project:delete", "Delete Project"),

    ("cost_center:create", "Create Cost Center"),
    ("cost_center:read", "View Cost Center"),
    ("cost_center:update", "Update Cost Center"),
    ("cost_center:delete", "Delete Cost Center"),

    ("expense_type:create", "Create Expense Type"),
    ("expense_type:read", "View Expense Type"),
    ("expense_type:update", "Update Expense Type"),
    ("expense_type:delete", "Delete Expense Type"),

    ("approval_group:create", "Create Approval Group"),
    ("approval_group:read", "View Approval Group"),
    ("approval_group:update", "Update Approval Group"),
    ("approval_group:delete", "Delete Approval Group"),

    ("workflow:create", "Create Workflow"),
    ("workflow:read", "View Workflow"),
    ("workflow:update", "Update Workflow"),
    ("workflow:delete", "Delete Workflow"),
    ("workflow:approve", "Approve Workflow"),

    ("reimbursement:create", "Create Reimbursement"),
    ("reimbursement:read", "View Reimbursement"),
    ("reimbursement:update", "Update Reimbursement"),
    ("reimbursement:submit", "Submit Reimbursement"),
    ("reimbursement:approve", "Approve Reimbursement"),
    ("reimbursement:pay", "Pay Reimbursement"),
]


async def seed():

    async with async_session_factory() as db:

        for code, name in PERMISSIONS:

            existing = await db.execute(
                select(Permission).where(
                    Permission.code == code
                )
            )

            if existing.scalar_one_or_none():
                continue

            resource, action = code.split(":")

            permission = Permission(
                code=code,
                name=name,
                description=f"Can {action} {resource}",
                resource=resource,
                action=action,
                is_active=True,
            )

            db.add(permission)

        await db.commit()

        print("Permissions seeded")

        admin_role = await db.execute(
            select(Role).where(
                Role.name == "admin"
            )
        )

        admin = admin_role.scalar_one_or_none()

        if not admin:
            print("Admin role not found")
            return

        permissions = await db.execute(
            select(Permission)
        )

        permissions = permissions.scalars().all()

        assigned = 0
        skipped = 0

        for permission in permissions:

            existing = await db.execute(
                select(role_permissions).where(
                    role_permissions.c.role_id == admin.id,
                    role_permissions.c.permission_id == permission.id,
                )
            )

            if existing.first():
                skipped += 1
                continue

            await db.execute(
                insert(role_permissions).values(
                    role_id=admin.id,
                    permission_id=permission.id,
                )
            )

            assigned += 1

        await db.commit()

        print(
            f"Assigned={assigned}, Skipped={skipped}"
        )


if __name__ == "__main__":
    asyncio.run(seed())