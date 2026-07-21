from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.core.exceptions.http_exceptions import (
    NotFoundException,
)

from app.modules.workflow.models.approval_group import (
    ApprovalGroup,
    ApprovalGroupMember,
)

from app.modules.workflow.schemas.approval_group_schema import (
    ApprovalGroupCreate,
    ApprovalGroupUpdate,
    ApprovalGroupMemberCreate,
)

from sqlalchemy import delete, select
from sqlalchemy.orm import selectinload

from app.modules.user.models.user import User
from app.modules.employee.models.employee import Employee

from app.modules.workflow.repositories.approval_group_repository import (
    ApprovalGroupRepository,
)


class ApprovalGroupService:

    @staticmethod
    async def create_approval_group(
        db: AsyncSession,
        payload: ApprovalGroupCreate,
    ):
        approval_group = ApprovalGroup(
            group_code=payload.group_code,
            group_name=payload.group_name,
            approval_method=payload.approval_method,
            description=payload.description,
            is_active=payload.is_active,
        )

        return await ApprovalGroupRepository.create_approval_group(
            db,
            approval_group,
        )

    @staticmethod
    async def get_approval_groups(
        db: AsyncSession,
    ):
        groups = await ApprovalGroupRepository.get_approval_groups(
            db,
        )

        result = []

        for group in groups:

            members = []

            for member in group.members:

                user = member.user

                employee_result = await db.execute(
                    select(Employee)
                    .options(
                        selectinload(Employee.department),
                        selectinload(Employee.designation),
                    )
                    .where(
                        Employee.employee_id == user.employee_id
                    )
                )

                employee = employee_result.scalars().first()

                members.append(
                    {
                        "id": member.id,
                        "employee_id": employee.id if employee else None,
                        "employee_name": employee.name if employee else "",
                        "department_name": employee.department.name if employee else "",
                        "designation_name": employee.designation.name if employee else "",
                        "is_primary": member.is_primary,
                    }
                )

            result.append(
                {
                    "id": group.id,
                    "group_code": group.group_code,
                    "group_name": group.group_name,
                    "approval_method": group.approval_method,
                    "description": group.description,
                    "is_active": group.is_active,
                    "created_at": group.created_at,
                    "updated_at": group.updated_at,
                    "members": members,
                    "member_count": len(members),
                }
            )

        return result

    @staticmethod
    async def get_approval_group(
        db: AsyncSession,
        approval_group_id: str,
    ):
        group = (
            await ApprovalGroupRepository.get_approval_group_by_id(
                db,
                approval_group_id,
            )
        )

        if not group:
            raise NotFoundException(
                "Approval Group not found"
            )

        members = []

        for member in group.members:

            user = member.user

            employee_result = await db.execute(
                select(Employee)
                .options(
                    selectinload(Employee.department),
                    selectinload(Employee.designation),
                )
                .where(
                    Employee.employee_id == user.employee_id
                )
            )

            employee = employee_result.scalars().first()

            members.append(
                {
                    "id": member.id,
                    "employee_id": employee.id if employee else None,
                    "employee_name": employee.name if employee else "",
                    "department_name": employee.department.name if employee else "",
                    "designation_name": employee.designation.name if employee else "",
                    "is_primary": member.is_primary,
                }
            )

        return {
            "id": group.id,
            "group_code": group.group_code,
            "group_name": group.group_name,
            "approval_method": group.approval_method,
            "description": group.description,
            "is_active": group.is_active,
            "created_at": group.created_at,
            "updated_at": group.updated_at,
            "members": members,
            "member_count": len(members),
        }

    @staticmethod
    async def update_approval_group(
        db: AsyncSession,
        approval_group_id: str,
        payload: ApprovalGroupUpdate,
    ):
        approval_group = (
            await ApprovalGroupRepository.get_approval_group_by_id(
                db,
                approval_group_id,
            )
        )

        if not approval_group:
            raise NotFoundException(
                "Approval Group not found"
            )

        update_data = payload.model_dump(
            exclude_unset=True,
            exclude={"members"},
        )

        for field, value in update_data.items():
            setattr(
                approval_group,
                field,
                value,
            )

        await ApprovalGroupRepository.update_approval_group(
            db,
            approval_group,
        )

        await db.execute(
            delete(ApprovalGroupMember).where(
                ApprovalGroupMember.approval_group_id == approval_group.id
            )
        )

        for member in payload.members:

            employee_result = await db.execute(
                select(Employee).where(
                    Employee.id == member.employee_id
                )
            )

            employee = employee_result.scalars().first()

            if not employee:
                continue

            user_result = await db.execute(
                select(User).where(
                    User.employee_id == employee.employee_id
                )
            )

            user = user_result.scalars().first()

            if not user:
                continue

            db.add(
                ApprovalGroupMember(
                    approval_group_id=approval_group.id,
                    user_id=user.id,
                    is_primary=member.is_primary,
                )
            )

        await db.commit()

        return await ApprovalGroupRepository.get_approval_group_by_id(
            db,
            approval_group.id,
        )

    @staticmethod
    async def delete_approval_group(
        db: AsyncSession,
        approval_group_id: str,
    ):
        approval_group = (
            await ApprovalGroupRepository.get_approval_group_by_id(
                db,
                approval_group_id,
            )
        )

        if not approval_group:
            raise NotFoundException(
                "Approval Group not found"
            )

        # Check if approval group is used in any workflow step
        from sqlalchemy import text as _text_ag
        linked = await db.execute(
            _text_ag("SELECT COUNT(*) FROM workflow_steps WHERE approval_group_id = :group_id"),
            {"group_id": approval_group_id}
        )
        if linked.scalar() > 0:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete approval group. It is assigned to existing workflow steps.",
            )

        return await ApprovalGroupRepository.delete_approval_group(
            db,
            approval_group,
        )

    @staticmethod
    async def create_member(
        db: AsyncSession,
        payload: ApprovalGroupMemberCreate,
    ):

        print("========== CREATE MEMBER ==========")
        print(payload)
        print("approval_group_id =", payload.approval_group_id)
        print("employee_id =", payload.employee_id)

        employee_result = await db.execute(
            select(Employee).where(
                Employee.id == payload.employee_id
            )
        )

        employee = employee_result.scalars().first()

        print("EMPLOYEE =>", employee)

        if not employee:
            raise NotFoundException(
                "Employee not found."
            )

        user_result = await db.execute(
            select(User).where(
                User.employee_id == employee.employee_id
            )
        )

        user = user_result.scalars().first()

        print("USER =>", user)

        if not user:
            raise NotFoundException(
                "User not found for employee."
            )

        backup_user_id = None

        if payload.backup_employee_id:

            backup_result = await db.execute(
                select(User).where(
                    User.employee_id
                    == payload.backup_employee_id
                )
            )

            backup_user = backup_result.scalars().first()

            if backup_user:
                backup_user_id = backup_user.id

        member = ApprovalGroupMember(
            approval_group_id=payload.approval_group_id,
            user_id=user.id,
            is_primary=payload.is_primary,
            backup_user_id=backup_user_id,
        )

        print("READY TO SAVE MEMBER")

        return await ApprovalGroupRepository.create_member(
            db,
            member,
        )

    @staticmethod
    async def get_members_by_group(
        db: AsyncSession,
        approval_group_id: str,
    ):
        return await ApprovalGroupRepository.get_members_by_group(
            db,
            approval_group_id,
        )

    @staticmethod
    async def delete_member(
        db: AsyncSession,
        member_id: str,
    ):
        member = (
            await ApprovalGroupRepository.get_member_by_id(
                db,
                member_id,
            )
        )

        if not member:
            raise NotFoundException(
                "Approval Group Member not found"
            )

        return await ApprovalGroupRepository.delete_member(
            db,
            member,
        )