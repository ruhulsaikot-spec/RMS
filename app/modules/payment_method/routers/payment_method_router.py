from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

from app.modules.payment_method.schemas.payment_method_schema import (
    PaymentMethodCreate,
    PaymentMethodResponse,
)

from app.modules.payment_method.services.payment_method_service import (
    PaymentMethodService,
)

router = APIRouter(
    prefix="/payment-methods",
    tags=["Payment Methods"],
)


@router.post(
    "",
    response_model=PaymentMethodResponse,
)
async def create_payment_method(
    payload: PaymentMethodCreate,
    db: AsyncSession = Depends(get_db),
):
    return await PaymentMethodService.create_payment_method(
        db,
        payload,
    )


@router.get(
    "",
    response_model=list[PaymentMethodResponse],
)
async def get_payment_methods(
    db: AsyncSession = Depends(get_db),
):
    return await PaymentMethodService.list_payment_methods(
        db,
    )