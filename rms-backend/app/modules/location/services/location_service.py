from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.location.repositories.location_repository import (
    LocationRepository,
)

from app.modules.location.schemas.location_schema import (
    LocationCreate,
    LocationUpdate,
)


class LocationService:

    @staticmethod
    async def create_location(
        db: AsyncSession,
        payload: LocationCreate,
    ):

        existing_location = (
            await LocationRepository.get_by_code(
                db,
                payload.code,
            )
        )

        if existing_location:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Location code already exists",
            )

        return await LocationRepository.create(
            db,
            payload,
        )

    @staticmethod
    async def list_locations(
        db: AsyncSession,
    ):
        return await LocationRepository.list(db)

    @staticmethod
    async def update_location(
        db: AsyncSession,
        location_id: str,
        payload: LocationUpdate,
    ):

        location = await (
            LocationRepository.get_by_id(
                db,
                location_id,
            )
        )

        if not location:
            raise HTTPException(
                status_code=404,
                detail="Location not found",
            )

        return await LocationRepository.update(
            db,
            location,
            payload,
        )

    @staticmethod
    async def delete_location(
        db: AsyncSession,
        location_id: str,
    ):

        location = await (
            LocationRepository.get_by_id(
                db,
                location_id,
            )
        )

        if not location:
            raise HTTPException(
                status_code=404,
                detail="Location not found",
            )

        await LocationRepository.delete(
            db,
            location,
        )

        return {
            "message":
            "Location deleted successfully"
        }