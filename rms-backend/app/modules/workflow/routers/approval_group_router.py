from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

from app.modules.workflow.services.approval_group_service import (
    ApprovalGroupService,
)

from app.modules.workflow.schemas.approval_group_schema import (
    ApprovalGroupCreate,
    ApprovalGroupUpdate,
    ApprovalGroupMemberCreate,
)

router = APIRouter(
    prefix="/approval-groups",
    tags=["Approval Groups"],
)


@router.post("")
async def create_approval_group(
    payload: ApprovalGroupCreate,
    db: AsyncSession = Depends(get_db),
):
    return await ApprovalGroupService.create_approval_group(
        db,
        payload,
    )


@router.get("")
async def get_approval_groups(
    db: AsyncSession = Depends(get_db),
):
    return await ApprovalGroupService.get_approval_groups(
        db,
    )


@router.get("/{approval_group_id}")
async def get_approval_group(
    approval_group_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await ApprovalGroupService.get_approval_group(
        db,
        approval_group_id,
    )


@router.put("/{approval_group_id}")
async def update_approval_group(
    approval_group_id: str,
    payload: ApprovalGroupUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await ApprovalGroupService.update_approval_group(
        db,
        approval_group_id,
        payload,
    )


@router.delete("/{approval_group_id}")
async def delete_approval_group(
    approval_group_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await ApprovalGroupService.delete_approval_group(
        db,
        approval_group_id,
    )


@router.post("/members")
async def create_member(
    payload: ApprovalGroupMemberCreate,
    db: AsyncSession = Depends(get_db),
):
    return await ApprovalGroupService.create_member(
        db,
        payload,
    )


@router.get("/{approval_group_id}/members")
async def get_members(
    approval_group_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await ApprovalGroupService.get_members_by_group(
        db,
        approval_group_id,
    )


@router.delete("/members/{member_id}")
async def delete_member(
    member_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await ApprovalGroupService.delete_member(
        db,
        member_id,
    )