from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

from app.modules.location.schemas.location_schema import (
    LocationCreate,
    LocationUpdate,
    LocationResponse,
)

from app.modules.location.services.location_service import (
    LocationService,
)

router = APIRouter(
    prefix="/locations",
    tags=["Locations"],
)


@router.post(
    "/",
    response_model=LocationResponse,
)
async def create_location(
    payload: LocationCreate,
    db: AsyncSession = Depends(get_db),
):

    return await LocationService.create_location(
        db,
        payload,
    )


@router.get(
    "/",
    response_model=list[LocationResponse],
)
async def list_locations(
    db: AsyncSession = Depends(get_db),
):

    return await LocationService.list_locations(
        db
    )


@router.put(
    "/{location_id}",
    response_model=LocationResponse,
)
async def update_location(
    location_id: str,
    payload: LocationUpdate,
    db: AsyncSession = Depends(get_db),
):

    return await LocationService.update_location(
        db,
        location_id,
        payload,
    )


@router.delete(
    "/{location_id}",
)
async def delete_location(
    location_id: str,
    db: AsyncSession = Depends(get_db),
):

    return await LocationService.delete_location(
        db,
        location_id,
    )