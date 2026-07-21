from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.expense_type.models.expense_type import (
    ExpenseType,
)

from app.modules.expense_type.schemas.expense_type_schema import (
    ExpenseTypeCreate,
)


class ExpenseTypeRepository:

    @staticmethod
    async def get_by_code(
        db: AsyncSession,
        code: str,
    ):

        result = await db.execute(
            select(ExpenseType).where(
                ExpenseType.code == code
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_name(
        db: AsyncSession,
        name: str,
    ):

        result = await db.execute(
            select(ExpenseType).where(
                ExpenseType.name == name
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def create(
        db: AsyncSession,
        payload: ExpenseTypeCreate,
    ):

        expense_type = ExpenseType(
            code=payload.code,
            name=payload.name,
        )

        db.add(expense_type)

        await db.commit()
        await db.refresh(expense_type)

        return expense_type

    @staticmethod
    async def list(
        db: AsyncSession,
    ):

        result = await db.execute(
            select(ExpenseType)
        )

        return result.scalars().all()

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        expense_type_id: str,
    ):

        result = await db.execute(
            select(ExpenseType).where(
                ExpenseType.id == expense_type_id
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def update(
        db: AsyncSession,
        expense_type: ExpenseType,
        payload,
    ):

        expense_type.code = payload.code
        expense_type.name = payload.name
        expense_type.is_active = payload.is_active

        await db.commit()
        await db.refresh(expense_type)

        return expense_type

    @staticmethod
    async def delete(
        db: AsyncSession,
        expense_type: ExpenseType,
    ):

        await db.delete(expense_type)
        await db.commit()