from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.payment_method.models.payment_method import (
    PaymentMethod,
)


class PaymentMethodRepository:

    @staticmethod
    async def create(
        db: AsyncSession,
        payment_method: PaymentMethod,
    ):
        db.add(payment_method)

        await db.commit()

        await db.refresh(payment_method)

        return payment_method

    @staticmethod
    async def get_all(
        db: AsyncSession,
    ):
        result = await db.execute(
            select(PaymentMethod)
            .where(
                PaymentMethod.is_active == True
            )
            .order_by(
                PaymentMethod.name
            )
        )

        return result.scalars().all()

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        payment_method_id: str,
    ):
        result = await db.execute(
            select(PaymentMethod).where(
                PaymentMethod.id == payment_method_id,
                PaymentMethod.is_active == True,
            )
        )

        return result.scalar_one_or_none()