from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.department.models.department import Department
from app.modules.department.schemas.department_schema import DepartmentCreate


class DepartmentRepository:

    @staticmethod
    async def get_by_code(
        db: AsyncSession,
        code: str,
    ):

        result = await db.execute(
            select(Department).where(
                Department.code == code
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def create(
        db: AsyncSession,
        payload: DepartmentCreate,
    ) -> Department:

        department = Department(
            name=payload.name,
            code=payload.code,
            description=payload.description,
        )

        db.add(department)

        await db.commit()
        await db.refresh(department)

        return department

    @staticmethod
    async def list(
        db: AsyncSession,
    ) -> list[Department]:

        result = await db.execute(
            select(Department)
        )

        return result.scalars().all()

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        department_id: str,
    ):

        result = await db.execute(
            select(Department).where(
                Department.id == department_id
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def update(
        db: AsyncSession,
        department: Department,
        payload,
    ):

        department.name = payload.name
        department.code = payload.code
        department.description = payload.description
        department.is_active = payload.is_active

        await db.commit()
        await db.refresh(department)

        return department

    @staticmethod
    async def delete(
        db: AsyncSession,
        department: Department,
    ):

        await db.delete(department)

        await db.commit()