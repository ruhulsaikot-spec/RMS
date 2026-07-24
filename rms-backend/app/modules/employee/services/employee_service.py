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
from sqlalchemy import select, text
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

    @staticmethod
    async def bulk_create_employee(
        db: AsyncSession,
        employee_id: str,
        full_name: str,
        email: str,
        mobile: str = None,
        company_code: str = None,
        department_name: str = None,
        designation_name: str = None,
        location_name: str = None,
        line_manager_emp_id: str = None,
        joining_date: str = None,
        is_active: bool = True,
    ):
        # Lookup company by code
        company_result = await db.execute(
            text("SELECT id FROM companies WHERE LOWER(code) = LOWER(:code) LIMIT 1"),
            {"code": company_code}
        )
        company_row = company_result.fetchone()
        company_id = company_row[0] if company_row else None

        # Lookup department by name
        dept_result = await db.execute(
            text("SELECT id FROM departments WHERE LOWER(name) = LOWER(:name) LIMIT 1"),
            {"name": department_name}
        )
        dept_row = dept_result.fetchone()
        department_id = dept_row[0] if dept_row else None

        # Lookup designation by name
        desig_result = await db.execute(
            text("SELECT id FROM designations WHERE LOWER(name) = LOWER(:name) LIMIT 1"),
            {"name": designation_name}
        )
        desig_row = desig_result.fetchone()
        designation_id = desig_row[0] if desig_row else None

        # Lookup location by name
        location_id = None
        if location_name:
            loc_result = await db.execute(
                text("SELECT id FROM locations WHERE LOWER(name) = LOWER(:name) LIMIT 1"),
                {"name": location_name}
            )
            loc_row = loc_result.fetchone()
            location_id = loc_row[0] if loc_row else None

        # Lookup line manager
        line_manager_id = None
        if line_manager_emp_id:
            lm_result = await db.execute(
                text("SELECT id FROM employees WHERE employee_id = :emp_id LIMIT 1"),
                {"emp_id": line_manager_emp_id}
            )
            lm_row = lm_result.fetchone()
            line_manager_id = lm_row[0] if lm_row else None

        # Parse joining date
        from datetime import date
        parsed_date = None
        if joining_date:
            try:
                parsed_date = date.fromisoformat(joining_date)
            except Exception:
                parsed_date = None

        # Check if employee already exists
        existing = await EmployeeRepository.get_by_employee_id(db, employee_id)
        if existing:
            raise ValueError(f"Employee ID {employee_id} already exists")

        # Create employee
        from datetime import date as date_type
        payload = EmployeeCreate(
            employee_id=employee_id,
            name=full_name,
            email=email,
            mobile=mobile,
            company_id=company_id,
            department_id=department_id,
            designation_id=designation_id,
            location_id=location_id,
            line_manager_id=line_manager_id,
            joining_date=parsed_date or date_type.today(),
            is_active=is_active,
        )
        return await EmployeeRepository.create(db, payload)