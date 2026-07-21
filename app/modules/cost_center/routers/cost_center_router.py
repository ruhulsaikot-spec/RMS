from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

from app.modules.cost_center.schemas.cost_center_schema import (
    CostCenterCreate,
    CostCenterUpdate,
    CostCenterResponse,
)

from app.modules.cost_center.services.cost_center_service import (
    CostCenterService,
)

router = APIRouter(
    prefix="/cost-centers",
    tags=["Cost Centers"],
)


@router.post(
    "/",
    response_model=CostCenterResponse,
)
async def create_cost_center(
    payload: CostCenterCreate,
    db: AsyncSession = Depends(get_db),
):

    return await CostCenterService.create_cost_center(
        db,
        payload,
    )


@router.get(
    "/",
    response_model=list[CostCenterResponse],
)
async def list_cost_centers(
    db: AsyncSession = Depends(get_db),
):

    return await CostCenterService.list_cost_centers(
        db
    )


@router.put(
    "/{cost_center_id}",
    response_model=CostCenterResponse,
)
async def update_cost_center(
    cost_center_id: str,
    payload: CostCenterUpdate,
    db: AsyncSession = Depends(get_db),
):

    return await CostCenterService.update_cost_center(
        db,
        cost_center_id,
        payload,
    )


@router.delete(
    "/{cost_center_id}",
)
async def delete_cost_center(
    cost_center_id: str,
    db: AsyncSession = Depends(get_db),
):

    return await CostCenterService.delete_cost_center(
        db,
        cost_center_id,
    )