from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

from app.auth.repositories.auth_repository import (
    PermissionRepository,
)

from app.auth.schemas.permission_schema import (
    PermissionCreate,
    PermissionResponse,
)

router = APIRouter(
    prefix="/permissions",
    tags=["Permission Management"],
)


@router.get(
    "",
    response_model=list[PermissionResponse],
)
async def list_permissions(
    db: AsyncSession = Depends(get_db),
):
    repo = PermissionRepository(db)

    return await repo.list_all()


@router.post(
    "",
    response_model=PermissionResponse,
)
async def create_permission(
    payload: PermissionCreate,
    db: AsyncSession = Depends(get_db),
):
    repo = PermissionRepository(db)

    return await repo.create(
        payload.model_dump(),
    )