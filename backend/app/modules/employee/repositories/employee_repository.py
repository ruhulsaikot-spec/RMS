from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.employee.models.employee import Employee
from app.modules.employee.schemas.employee_schema import (
    EmployeeCreate,
)


class EmployeeRepository:

    @staticmethod
    async def get_by_employee_id(
        db: AsyncSession,
        employee_id: str,
    ):

        result = await db.execute(
            select(Employee).where(
                Employee.employee_id == employee_id
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_email(
        db: AsyncSession,
        email: str,
    ):

        result = await db.execute(
            select(Employee).where(
                Employee.email == email
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def create(
        db: AsyncSession,
        payload: EmployeeCreate,
    ):

        employee = Employee(
            employee_id=payload.employee_id,
            name=payload.name,
            email=payload.email,
            mobile=payload.mobile,
            company_id=payload.company_id,
            department_id=payload.department_id,
            designation_id=payload.designation_id,
            location_id=payload.location_id,
            line_manager_id=payload.line_manager_id,
            joining_date=payload.joining_date,
        )

        db.add(employee)

        await db.commit()
        await db.refresh(employee)

        return employee

    @staticmethod
    async def list(
        db: AsyncSession,
    ):

        result = await db.execute(
            select(Employee).options(
                selectinload(Employee.department),
                selectinload(Employee.designation),
            )
        )

        return result.scalars().all()

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        employee_id: str,
    ):

        result = await db.execute(
            select(Employee).where(
                Employee.id == employee_id
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def update(
        db: AsyncSession,
        employee: Employee,
        payload,
    ):

        employee.employee_id = payload.employee_id
        employee.name = payload.name
        employee.email = payload.email
        employee.mobile = payload.mobile

        employee.company_id = payload.company_id
        employee.department_id = payload.department_id
        employee.designation_id = payload.designation_id
        employee.location_id = payload.location_id

        employee.line_manager_id = payload.line_manager_id
        employee.joining_date = payload.joining_date
        employee.is_active = payload.is_active

        await db.commit()
        await db.refresh(employee)

        return employee

    @staticmethod
    async def delete(
        db: AsyncSession,
        employee: Employee,
    ):

        await db.delete(employee)
        await db.commit()