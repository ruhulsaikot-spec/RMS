from fastapi import HTTPException
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.employee.repositories.employee_repository import (
    EmployeeRepository,
)

from app.modules.employee.schemas.employee_schema import (
    EmployeeCreate,
    EmployeeUpdate,
)

from sqlalchemy import select

from app.modules.user.models.user import User
from app.modules.employee.models.employee import Employee


class EmployeeService:

    @staticmethod
    async def create_employee(
        db: AsyncSession,
        payload: EmployeeCreate,
    ):

        existing_employee = (
            await EmployeeRepository.get_by_employee_id(
                db,
                payload.employee_id,
            )
        )

        if existing_employee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee ID already exists",
            )

        existing_email = (
            await EmployeeRepository.get_by_email(
                db,
                payload.email,
            )
        )

        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee email already exists",
            )

        return await EmployeeRepository.create(
            db,
            payload,
        )

    @staticmethod
    async def list_employees(
        db: AsyncSession,
    ):

        return await EmployeeRepository.list(
            db
        )

    @staticmethod
    async def update_employee(
        db: AsyncSession,
        employee_id: str,
        payload: EmployeeUpdate,
    ):

        employee = (
            await EmployeeRepository.get_by_id(
                db,
                employee_id,
            )
        )

        if not employee:
            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

        updated_employee = (
            await EmployeeRepository.update(
                db,
                employee,
                payload,
            )
        )

        user_result = await db.execute(
            select(User).where(
                User.employee_id
                == updated_employee.employee_id
            )
        )

        user = user_result.scalars().first()

        if user:

            manager_user_id = None

            if updated_employee.line_manager_id:

                manager_employee_result = (
                    await db.execute(
                        select(Employee).where(
                            Employee.id
                            == updated_employee.line_manager_id
                        )
                    )
                )

                manager_employee = (
                    manager_employee_result
                    .scalars()
                    .first()
                )

                if manager_employee:

                    manager_user_result = (
                        await db.execute(
                            select(User).where(
                                User.employee_id
                                == manager_employee.employee_id
                            )
                        )
                    )

                    manager_user = (
                        manager_user_result
                        .scalars()
                        .first()
                    )

                    if manager_user:
                        manager_user_id = (
                            manager_user.id
                        )

            user.manager_id = manager_user_id
            
            await db.commit()
        await db.refresh(updated_employee)
        return updated_employee

    @staticmethod
    async def delete_employee(
        db: AsyncSession,
        employee_id: str,
    ):

        employee = (
            await EmployeeRepository.get_by_id(
                db,
                employee_id,
            )
        )

        if not employee:
            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

        # Check if employee has linked user account
        from sqlalchemy import text as _text_emp
        user_linked = await db.execute(
            _text_emp("SELECT COUNT(*) FROM users WHERE employee_id = :emp_id"),
            {"emp_id": employee.employee_id}
        )
        if user_linked.scalar() > 0:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete employee. A user account is linked to this employee.",
            )

        # Check if employee has claim applications
        claim_linked = await db.execute(
            _text_emp("""
                SELECT COUNT(*) FROM reimbursement_applications ra
                JOIN users u ON u.id = ra.employee_id
                WHERE u.employee_id = :emp_id AND ra.is_deleted = false
            """),
            {"emp_id": employee.employee_id}
        )
        if claim_linked.scalar() > 0:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete employee. This employee has existing claim applications.",
            )

        await EmployeeRepository.delete(
            db,
            employee,
        )

        return {
            "message":
            "Employee deleted successfully"
        }