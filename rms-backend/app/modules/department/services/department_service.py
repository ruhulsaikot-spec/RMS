from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.department.repositories.department_repository import (
    DepartmentRepository,
)

from app.modules.department.schemas.department_schema import (
    DepartmentCreate,
    DepartmentUpdate,
)


class DepartmentService:

    @staticmethod
    async def create_department(
        db: AsyncSession,
        payload: DepartmentCreate,
    ):

        existing_department = await DepartmentRepository.get_by_code(
            db,
            payload.code,
        )

        if existing_department:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department code already exists",
            )

        return await DepartmentRepository.create(
            db,
            payload,
        )

    @staticmethod
    async def list_departments(
        db: AsyncSession,
    ):
        return await DepartmentRepository.list(db)

    @staticmethod
    async def update_department(
        db: AsyncSession,
        department_id: str,
        payload: DepartmentUpdate,
    ):

        department = await DepartmentRepository.get_by_id(
            db,
            department_id,
        )

        if not department:
            raise HTTPException(
                status_code=404,
                detail="Department not found",
            )

        return await DepartmentRepository.update(
            db,
            department,
            payload,
        )

    @staticmethod
    async def delete_department(
        db: AsyncSession,
        department_id: str,
    ):

        department = await DepartmentRepository.get_by_id(
            db,
            department_id,
        )

        if not department:
            raise HTTPException(
                status_code=404,
                detail="Department not found",
            )

        await DepartmentRepository.delete(
            db,
            department,
        )

        return {
            "message": "Department deleted successfully",
        }