from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.workflow.models.approval_group import (
    ApprovalGroup,
    ApprovalGroupMember,
)


class ApprovalGroupRepository:

    @staticmethod
    async def create_approval_group(
        db: AsyncSession,
        approval_group: ApprovalGroup,
    ):
        db.add(approval_group)

        await db.commit()

        await db.refresh(
            approval_group
        )

        return approval_group

    @staticmethod
    async def get_approval_groups(
        db: AsyncSession,
    ):
        result = await db.execute(
            select(ApprovalGroup)
            .options(
                selectinload(
                    ApprovalGroup.members
                ).selectinload(
                    ApprovalGroupMember.user
                )
            )
            .where(
                ApprovalGroup.is_deleted == False
            )
            .order_by(
                ApprovalGroup.group_name
            )
        )

        return result.scalars().unique().all()

    @staticmethod
    async def get_approval_group_by_id(
        db: AsyncSession,
        approval_group_id: str,
    ):
        result = await db.execute(
            select(ApprovalGroup)
            .options(
                selectinload(
                    ApprovalGroup.members
                ).selectinload(
                    ApprovalGroupMember.user
                )
            )
            .where(
                ApprovalGroup.id == approval_group_id,
                ApprovalGroup.is_deleted == False,
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def update_approval_group(
        db: AsyncSession,
        approval_group,
    ):
        await db.commit()

        await db.refresh(
            approval_group
        )

        return approval_group

    @staticmethod
    async def delete_approval_group(
        db: AsyncSession,
        approval_group,
    ):
        await db.delete(
            approval_group
        )

        await db.commit()

        return {
            "message": "Approval Group deleted successfully."
        }

    @staticmethod
    async def create_member(
        db: AsyncSession,
        member: ApprovalGroupMember,
    ):
        db.add(member)

        await db.commit()

        await db.refresh(
            member
        )

        return member

    @staticmethod
    async def get_members_by_group(
        db: AsyncSession,
        approval_group_id: str,
    ):
        result = await db.execute(
            select(ApprovalGroupMember)
            .where(
                ApprovalGroupMember.approval_group_id
                == approval_group_id,

                ApprovalGroupMember.is_deleted
                == False,
            )
        )

        return result.scalars().all()

    @staticmethod
    async def get_member_by_id(
        db: AsyncSession,
        member_id: str,
    ):
        result = await db.execute(
            select(ApprovalGroupMember)
            .where(
                ApprovalGroupMember.id == member_id,

                ApprovalGroupMember.is_deleted
                == False,
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def delete_member(
        db: AsyncSession,
        member,
    ):
        await db.delete(
            member
        )

        await db.commit()

        return {
            "message": "Member deleted successfully."
        }