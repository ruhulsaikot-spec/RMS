from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.company.models.company import Company
from app.modules.company.schemas.company_schema import (
    CompanyCreate,
)


class CompanyRepository:

    @staticmethod
    async def get_by_code(
        db: AsyncSession,
        code: str,
    ):

        result = await db.execute(
            select(Company).where(
                Company.code == code
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def create(
        db: AsyncSession,
        payload: CompanyCreate,
    ):

        company = Company(
            code=payload.code,
            name=payload.name,
            contact_person=payload.contact_person,
            mobile=payload.mobile,
            email=payload.email,
            website=payload.website,
            country=payload.country,
            city=payload.city,
            logo=payload.logo,
        )

        db.add(company)

        await db.commit()
        await db.refresh(company)

        return company

    @staticmethod
    async def list(
        db: AsyncSession,
    ):

        result = await db.execute(
            select(Company)
        )

        return result.scalars().all()

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        company_id: str,
    ):

        result = await db.execute(
            select(Company).where(
                Company.id == company_id
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def update(
        db: AsyncSession,
        company: Company,
        payload,
    ):

        company.code = payload.code
        company.name = payload.name
        company.contact_person = payload.contact_person
        company.mobile = payload.mobile
        company.email = payload.email
        company.website = payload.website
        company.country = payload.country
        company.city = payload.city
        company.logo = payload.logo
        company.is_active = payload.is_active

        await db.commit()
        await db.refresh(company)

        return company

    @staticmethod
    async def delete(
        db: AsyncSession,
        company: Company,
    ):

        await db.delete(company)
        await db.commit()