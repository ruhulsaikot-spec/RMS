from fastapi import HTTPException
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.cost_center.repositories.cost_center_repository import (
    CostCenterRepository,
)

from app.modules.cost_center.schemas.cost_center_schema import (
    CostCenterCreate,
    CostCenterUpdate,
)


class CostCenterService:

    @staticmethod
    async def create_cost_center(
        db: AsyncSession,
        payload: CostCenterCreate,
    ):

        existing_code = (
            await CostCenterRepository.get_by_code(
                db,
                payload.code,
            )
        )

        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cost Center code already exists",
            )

        existing_name = (
            await CostCenterRepository.get_by_name(
                db,
                payload.name,
            )
        )

        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cost Center name already exists",
            )

        return await CostCenterRepository.create(
            db,
            payload,
        )

    @staticmethod
    async def list_cost_centers(
        db: AsyncSession,
    ):

        return await CostCenterRepository.list(
            db
        )

    @staticmethod
    async def update_cost_center(
        db: AsyncSession,
        cost_center_id: str,
        payload: CostCenterUpdate,
    ):

        cost_center = (
            await CostCenterRepository.get_by_id(
                db,
                cost_center_id,
            )
        )

        if not cost_center:
            raise HTTPException(
                status_code=404,
                detail="Cost Center not found",
            )

        return await CostCenterRepository.update(
            db,
            cost_center,
            payload,
        )

    @staticmethod
    async def delete_cost_center(
        db: AsyncSession,
        cost_center_id: str,
    ):

        cost_center = (
            await CostCenterRepository.get_by_id(
                db,
                cost_center_id,
            )
        )

        if not cost_center:
            raise HTTPException(
                status_code=404,
                detail="Cost Center not found",
            )

        await CostCenterRepository.delete(
            db,
            cost_center,
        )

        return {
            "message":
            "Cost Center deleted successfully"
        }