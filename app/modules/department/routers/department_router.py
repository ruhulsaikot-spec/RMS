from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory

from app.modules.department.schemas.department_schema import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
)

from app.modules.department.services.department_service import (
    DepartmentService,
)

router = APIRouter(
    prefix="/departments",
    tags=["Departments"],
)


async def get_db():
    async with async_session_factory() as session:
        yield session


@router.post(
    "/",
    response_model=DepartmentResponse,
)
async def create_department(
    payload: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
):
    return await DepartmentService.create_department(
        db,
        payload,
    )


@router.get(
    "/",
    response_model=list[DepartmentResponse],
)
async def list_departments(
    db: AsyncSession = Depends(get_db),
):
    return await DepartmentService.list_departments(db)


@router.put(
    "/{department_id}",
    response_model=DepartmentResponse,
)
async def update_department(
    department_id: str,
    payload: DepartmentUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await DepartmentService.update_department(
        db,
        department_id,
        payload,
    )

@router.delete(
    "/{department_id}",
)
async def delete_department(
    department_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await DepartmentService.delete_department(
        db,
        department_id,
    )