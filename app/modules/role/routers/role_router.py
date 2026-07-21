from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.auth.dependencies import require_permission

from app.modules.role.repositories.role_repository import (
    RoleRepository,
)

from app.modules.role.services.role_service import (
    RoleService,
)

from app.modules.role.schemas.role_schema import (
    RoleCreate,
    RoleUpdate,
    AssignPermissionRequest,
)

router = APIRouter(
    prefix="/roles",
    tags=["Role Management"],
)


@router.get("")

async def get_roles(
    db: AsyncSession = Depends(get_db),
):
    repo = RoleRepository(db)
    service = RoleService(repo)

    return await service.get_roles()


@router.post("")
async def create_role(
    payload: RoleCreate,
    db: AsyncSession = Depends(get_db),
):
    repo = RoleRepository(db)
    service = RoleService(repo)

    return await service.create_role(payload)

@router.put(
    "/{role_id}",
)
async def update_role(
    role_id: str,
    payload: RoleUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = RoleRepository(db)
    service = RoleService(repo)

    return await service.update_role(
        role_id,
        payload,
    )

@router.delete(
    "/{role_id}",
)
async def delete_role(
    role_id: str,
    db: AsyncSession = Depends(get_db),
):
    repo = RoleRepository(db)
    service = RoleService(repo)

    return await service.delete_role(
        role_id,
    )

@router.put(
    "/{role_id}/permissions"
)
async def replace_permissions(
    role_id: str,
    payload: AssignPermissionRequest,
    db: AsyncSession = Depends(get_db),
):
    repo = RoleRepository(db)
    service = RoleService(repo)

    return await service.replace_permissions(
        role_id,
        payload.permission_ids,
    )

@router.post(
    "/{role_id}/permissions"
)
async def assign_permissions(
    role_id: str,
    payload: AssignPermissionRequest,
    db: AsyncSession = Depends(get_db),
):
    repo = RoleRepository(db)
    service = RoleService(repo)

    return await service.assign_permissions(
        role_id,
        payload.permission_ids,
    )    