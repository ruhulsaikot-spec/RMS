from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

from app.modules.expense_type.schemas.expense_type_schema import (
    ExpenseTypeCreate,
    ExpenseTypeUpdate,
    ExpenseTypeResponse,
)

from app.modules.expense_type.services.expense_type_service import (
    ExpenseTypeService,
)

router = APIRouter(
    prefix="/expense-types",
    tags=["Expense Types"],
)


@router.post(
    "/",
    response_model=ExpenseTypeResponse,
)
async def create_expense_type(
    payload: ExpenseTypeCreate,
    db: AsyncSession = Depends(get_db),
):

    return await ExpenseTypeService.create_expense_type(
        db,
        payload,
    )


@router.get(
    "/",
    response_model=list[ExpenseTypeResponse],
)
async def list_expense_types(
    db: AsyncSession = Depends(get_db),
):

    return await ExpenseTypeService.list_expense_types(
        db
    )


@router.put(
    "/{expense_type_id}",
    response_model=ExpenseTypeResponse,
)
async def update_expense_type(
    expense_type_id: str,
    payload: ExpenseTypeUpdate,
    db: AsyncSession = Depends(get_db),
):

    return await ExpenseTypeService.update_expense_type(
        db,
        expense_type_id,
        payload,
    )


@router.delete(
    "/{expense_type_id}",
)
async def delete_expense_type(
    expense_type_id: str,
    db: AsyncSession = Depends(get_db),
):

    return await ExpenseTypeService.delete_expense_type(
        db,
        expense_type_id,
    )