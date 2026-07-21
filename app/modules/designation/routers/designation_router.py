from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

from app.modules.designation.schemas.designation_schema import (
    DesignationCreate,
    DesignationUpdate,
    DesignationResponse,
)

from app.modules.designation.services.designation_service import (
    DesignationService,
)

router = APIRouter(
    prefix="/designations",
    tags=["Designations"],
)


@router.post(
    "/",
    response_model=DesignationResponse,
)
async def create_designation(
    payload: DesignationCreate,
    db: AsyncSession = Depends(get_db),
):

    return await DesignationService.create_designation(
        db,
        payload,
    )


@router.get(
    "/",
    response_model=list[DesignationResponse],
)
async def list_designations(
    db: AsyncSession = Depends(get_db),
):

    return await DesignationService.list_designations(db)

@router.put(
    "/{designation_id}",
    response_model=DesignationResponse,
)
async def update_designation(
    designation_id: str,
    payload: DesignationUpdate,
    db: AsyncSession = Depends(get_db),
):

    return await DesignationService.update_designation(
        db,
        designation_id,
        payload,
    )


@router.delete(
    "/{designation_id}",
)
async def delete_designation(
    designation_id: str,
    db: AsyncSession = Depends(get_db),
):

    return await DesignationService.delete_designation(
        db,
        designation_id,
    )