from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.dependencies import require_permission

from app.core.database import get_db
from fastapi import Query
from app.core.schemas.api_response import ApiResponse
from app.modules.user.schemas.user_schema import (
    AssignRoleRequest,
)

from app.modules.user.schemas.user_schema import (
    UserCreate,
    UserResponse,
    UserDetailResponse,
    UserUpdate,
    UserListResponse,
    ResetPasswordRequest,
)

from app.modules.user.services.user_service import (
    UserService,
)

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post(
    "/",
    response_model=UserDetailResponse,
)
async def create_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "user:create"
        )
    ),
):
    return await UserService.create_user(
    db,
    payload,
    current_user["id"],
)


@router.get(
    "/{user_id}",
    response_model=UserDetailResponse,
)
async def get_user_by_id(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "user:read"
        )
    ),
):
    user = await UserService.get_user_by_id(
        db,
        user_id,
    )

    return UserDetailResponse.model_validate(
        user
    )    

@router.put(
    "/{user_id}",
    response_model=UserDetailResponse,
)
async def update_user(
    user_id: str,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "user:update"
        )
    ),
):
    return await UserService.update_user(
        db,
        user_id,
        payload,
        current_user["id"],
    )

@router.get("/")
async def get_users(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "user:list"
        )
    ),
):
    result = await UserService.get_users(
        db,
        page,
        size,
        search,
        is_active,
        sort_by,
        sort_order,
    )

    return ApiResponse(
        message="Users fetched successfully",
        data=[
            UserResponse.model_validate(user)
            for user in result["items"]
        ],
        meta={
            "total": result["total"],
            "page": result["page"],
            "size": result["size"],
        },
    )
@router.delete(
    "/{user_id}",
)
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "user:delete"
        )
    ),
):
    return await UserService.delete_user(
    db,
    user_id,
    current_user["id"],
    )

@router.post(
    "/{user_id}/roles",
)
async def assign_roles(
    user_id: str,
    payload: AssignRoleRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "user:manage_roles"
        )
    ),
):
    return await UserService.assign_roles(
        db,
        user_id,
        payload.role_ids,
    )


@router.post(
    "/{user_id}/reset-password",
)
async def reset_password(
    user_id: str,
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(
        require_permission(
            "user:update"
        )
    ),
):
    return await UserService.reset_password(
        db,
        user_id,
        payload.password,
        current_user["id"],
    )