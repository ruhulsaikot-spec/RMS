from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

from app.modules.company.schemas.company_schema import (
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse,
)

from app.modules.company.services.company_service import (
    CompanyService,
)

router = APIRouter(
    prefix="/companies",
    tags=["Companies"],
)


@router.post(
    "/",
    response_model=CompanyResponse,
)
async def create_company(
    payload: CompanyCreate,
    db: AsyncSession = Depends(get_db),
):

    return await CompanyService.create_company(
        db,
        payload,
    )


@router.get(
    "/",
    response_model=list[CompanyResponse],
)
async def list_companies(
    db: AsyncSession = Depends(get_db),
):

    return await CompanyService.list_companies(
        db
    )


@router.put(
    "/{company_id}",
    response_model=CompanyResponse,
)
async def update_company(
    company_id: str,
    payload: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
):

    return await CompanyService.update_company(
        db,
        company_id,
        payload,
    )


@router.delete(
    "/{company_id}",
)
async def delete_company(
    company_id: str,
    db: AsyncSession = Depends(get_db),
):

    return await CompanyService.delete_company(
        db,
        company_id,
    )