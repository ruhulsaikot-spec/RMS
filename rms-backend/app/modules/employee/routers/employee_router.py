from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

from app.modules.employee.schemas.employee_schema import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
)

from app.modules.employee.services.employee_service import (
    EmployeeService,
)

router = APIRouter(
    prefix="/employees",
    tags=["Employees"],
)


@router.post(
    "/",
    response_model=EmployeeResponse,
)
async def create_employee(
    payload: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
):

    return await EmployeeService.create_employee(
        db,
        payload,
    )


@router.get(
    "/",
    response_model=list[EmployeeResponse],
)
async def list_employees(
    db: AsyncSession = Depends(get_db),
):

    return await EmployeeService.list_employees(
        db
    )


@router.put(
    "/{employee_id}",
    
)
async def update_employee(
    employee_id: str,
    payload: EmployeeUpdate,
    db: AsyncSession = Depends(get_db),
):

    return await EmployeeService.update_employee(
        db,
        employee_id,
        payload,
    )


@router.delete(
    "/{employee_id}",
)
async def delete_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
):

    return await EmployeeService.delete_employee(
        db,
        employee_id,
    )