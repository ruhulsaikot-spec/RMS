from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.cost_center.models.cost_center import (
    CostCenter,
)

from app.modules.cost_center.schemas.cost_center_schema import (
    CostCenterCreate,
)


class CostCenterRepository:

    @staticmethod
    async def get_by_code(
        db: AsyncSession,
        code: str,
    ):

        result = await db.execute(
            select(CostCenter).where(
                CostCenter.code == code
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_name(
        db: AsyncSession,
        name: str,
    ):

        result = await db.execute(
            select(CostCenter).where(
                CostCenter.name == name
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def create(
        db: AsyncSession,
        payload: CostCenterCreate,
    ):

        cost_center = CostCenter(
            code=payload.code,
            name=payload.name,
        )

        db.add(cost_center)

        await db.commit()
        await db.refresh(cost_center)

        return cost_center

    @staticmethod
    async def list(
        db: AsyncSession,
    ):

        result = await db.execute(
            select(CostCenter)
        )

        return result.scalars().all()

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        cost_center_id: str,
    ):

        result = await db.execute(
            select(CostCenter).where(
                CostCenter.id == cost_center_id
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def update(
        db: AsyncSession,
        cost_center: CostCenter,
        payload,
    ):

        cost_center.code = payload.code
        cost_center.name = payload.name
        cost_center.is_active = payload.is_active

        await db.commit()
        await db.refresh(cost_center)

        return cost_center

    @staticmethod
    async def delete(
        db: AsyncSession,
        cost_center: CostCenter,
    ):

        await db.delete(cost_center)
        await db.commit()