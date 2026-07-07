from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.designation.repositories.designation_repository import (
    DesignationRepository,
)

from app.modules.designation.schemas.designation_schema import (
    DesignationCreate,
    DesignationUpdate,
)


class DesignationService:

    @staticmethod
    async def create_designation(
        db: AsyncSession,
        payload: DesignationCreate,
    ):

        existing_designation = await DesignationRepository.get_by_code(
            db,
            payload.code,
        )

        if existing_designation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Designation code already exists",
            )

        return await DesignationRepository.create(
            db,
            payload,
        )

    @staticmethod
    async def list_designations(
        db: AsyncSession,
    ):
        return await DesignationRepository.list(db)

    @staticmethod
    async def update_designation(
        db: AsyncSession,
        designation_id: str,
        payload: DesignationUpdate,
    ):

        designation = await DesignationRepository.get_by_id(
            db,
            designation_id,
        )

        if not designation:
            raise HTTPException(
                status_code=404,
                detail="Designation not found",
            )

        return await DesignationRepository.update(
            db,
            designation,
            payload,
        )

    @staticmethod
    async def delete_designation(
        db: AsyncSession,
        designation_id: str,
    ):

        designation = await DesignationRepository.get_by_id(
            db,
            designation_id,
        )

        if not designation:
            raise HTTPException(
                status_code=404,
                detail="Designation not found",
            )

        await DesignationRepository.delete(
            db,
            designation,
        )

        return {
            "message": "Designation deleted successfully",
        }