from fastapi import HTTPException
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.expense_type.repositories.expense_type_repository import (
    ExpenseTypeRepository,
)

from app.modules.expense_type.schemas.expense_type_schema import (
    ExpenseTypeCreate,
    ExpenseTypeUpdate,
)


class ExpenseTypeService:

    @staticmethod
    async def create_expense_type(
        db: AsyncSession,
        payload: ExpenseTypeCreate,
    ):

        existing_code = (
            await ExpenseTypeRepository.get_by_code(
                db,
                payload.code,
            )
        )

        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Expense Type code already exists",
            )

        existing_name = (
            await ExpenseTypeRepository.get_by_name(
                db,
                payload.name,
            )
        )

        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Expense Type name already exists",
            )

        return await ExpenseTypeRepository.create(
            db,
            payload,
        )

    @staticmethod
    async def list_expense_types(
        db: AsyncSession,
    ):

        return await ExpenseTypeRepository.list(
            db
        )

    @staticmethod
    async def update_expense_type(
        db: AsyncSession,
        expense_type_id: str,
        payload: ExpenseTypeUpdate,
    ):

        expense_type = (
            await ExpenseTypeRepository.get_by_id(
                db,
                expense_type_id,
            )
        )

        if not expense_type:
            raise HTTPException(
                status_code=404,
                detail="Expense Type not found",
            )

        return await ExpenseTypeRepository.update(
            db,
            expense_type,
            payload,
        )

    @staticmethod
    async def delete_expense_type(
        db: AsyncSession,
        expense_type_id: str,
    ):

        expense_type = (
            await ExpenseTypeRepository.get_by_id(
                db,
                expense_type_id,
            )
        )

        if not expense_type:
            raise HTTPException(
                status_code=404,
                detail="Expense Type not found",
            )

        # Check if expense type is used in any expense item
        from sqlalchemy import text as _text_et
        linked = await db.execute(
            _text_et("SELECT COUNT(*) FROM reimbursement_expense_items WHERE claim_type = :et_id"),
            {"et_id": expense_type_id}
        )
        if linked.scalar() > 0:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete expense type. It is linked to existing expense items.",
            )

        # Check if expense type is used in workflow
        wf_linked = await db.execute(
            _text_et("SELECT COUNT(*) FROM workflow_definition_expense_types WHERE expense_type_id = :et_id"),
            {"et_id": expense_type_id}
        )
        if wf_linked.scalar() > 0:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete expense type. It is assigned to existing workflows.",
            )

        await ExpenseTypeRepository.delete(
            db,
            expense_type,
        )

        return {
            "message":
            "Expense Type deleted successfully"
        }