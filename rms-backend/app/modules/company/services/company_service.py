from fastapi import HTTPException
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.company.repositories.company_repository import (
    CompanyRepository,
)

from app.modules.company.schemas.company_schema import (
    CompanyCreate,
    CompanyUpdate,
)


class CompanyService:

    @staticmethod
    async def create_company(
        db: AsyncSession,
        payload: CompanyCreate,
    ):

        existing_company = (
            await CompanyRepository.get_by_code(
                db,
                payload.code,
            )
        )

        if existing_company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company code already exists",
            )

        return await CompanyRepository.create(
            db,
            payload,
        )

    @staticmethod
    async def list_companies(
        db: AsyncSession,
    ):
        return await CompanyRepository.list(
            db
        )

    @staticmethod
    async def update_company(
        db: AsyncSession,
        company_id: str,
        payload: CompanyUpdate,
    ):

        company = (
            await CompanyRepository.get_by_id(
                db,
                company_id,
            )
        )

        if not company:
            raise HTTPException(
                status_code=404,
                detail="Company not found",
            )

        return await CompanyRepository.update(
            db,
            company,
            payload,
        )

    @staticmethod
    async def delete_company(
        db: AsyncSession,
        company_id: str,
    ):

        company = (
            await CompanyRepository.get_by_id(
                db,
                company_id,
            )
        )

        if not company:
            raise HTTPException(
                status_code=404,
                detail="Company not found",
            )

        # Check if company is linked to any employee
        from sqlalchemy import text as _text_comp
        emp_linked = await db.execute(
            _text_comp("SELECT COUNT(*) FROM employees WHERE company_id = :comp_id"),
            {"comp_id": company_id}
        )
        if emp_linked.scalar() > 0:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete company. It is assigned to existing employees.",
            )

        await CompanyRepository.delete(
            db,
            company,
        )

        return {
            "message":
            "Company deleted successfully"
        }