from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.payment_method.models.payment_method import (
    PaymentMethod,
)

from app.modules.payment_method.repositories.payment_method_repository import (
    PaymentMethodRepository,
)

from app.modules.payment_method.schemas.payment_method_schema import (
    PaymentMethodCreate,
)


class PaymentMethodService:

    @staticmethod
    async def create_payment_method(
        db: AsyncSession,
        payload: PaymentMethodCreate,
    ):
        payment_method = PaymentMethod(
            name=payload.name,
            code=payload.code,
            description=payload.description,
        )

        return await PaymentMethodRepository.create(
            db,
            payment_method,
        )

    @staticmethod
    async def list_payment_methods(
        db: AsyncSession,
    ):
        return await PaymentMethodRepository.get_all(
            db,
        )