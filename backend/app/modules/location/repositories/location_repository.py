from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.location.models.location import Location
from app.modules.location.schemas.location_schema import (
    LocationCreate,
)


class LocationRepository:

    @staticmethod
    async def get_by_code(
        db: AsyncSession,
        code: str,
    ):

        result = await db.execute(
            select(Location).where(
                Location.code == code
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def create(
        db: AsyncSession,
        payload: LocationCreate,
    ):

        location = Location(
            name=payload.name,
            code=payload.code,
        )

        db.add(location)

        await db.commit()
        await db.refresh(location)

        return location

    @staticmethod
    async def list(
        db: AsyncSession,
    ):

        result = await db.execute(
            select(Location)
        )

        return result.scalars().all()

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        location_id: str,
    ):

        result = await db.execute(
            select(Location).where(
                Location.id == location_id
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def update(
        db: AsyncSession,
        location: Location,
        payload,
    ):

        location.name = payload.name
        location.code = payload.code
        location.is_active = payload.is_active

        await db.commit()
        await db.refresh(location)

        return location

    @staticmethod
    async def delete(
        db: AsyncSession,
        location: Location,
    ):

        await db.delete(location)
        await db.commit()