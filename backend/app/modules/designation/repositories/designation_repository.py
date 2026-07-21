from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.designation.models.designation import Designation
from app.modules.designation.schemas.designation_schema import (
    DesignationCreate,
)


class DesignationRepository:

    @staticmethod
    async def get_by_code(
        db: AsyncSession,
        code: str,
    ):

        result = await db.execute(
            select(Designation).where(
                Designation.code == code
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def create(
        db: AsyncSession,
        payload: DesignationCreate,
    ):

        designation = Designation(
            name=payload.name,
            code=payload.code,
            description=payload.description,
        )

        db.add(designation)

        await db.commit()
        await db.refresh(designation)

        return designation

    @staticmethod
    async def list(
        db: AsyncSession,
    ):

        result = await db.execute(
            select(Designation)
        )

        return result.scalars().all()

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        designation_id: str,
    ):

        result = await db.execute(
            select(Designation).where(
                Designation.id == designation_id
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def update(
        db: AsyncSession,
        designation: Designation,
        payload,
    ):

        designation.name = payload.name
        designation.code = payload.code
        designation.description = payload.description
        designation.is_active = payload.is_active

        await db.commit()
        await db.refresh(designation)

        return designation

    @staticmethod
    async def delete(
        db: AsyncSession,
        designation: Designation,
    ):

        await db.delete(designation)

        await db.commit()