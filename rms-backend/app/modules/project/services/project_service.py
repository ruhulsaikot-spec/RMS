from fastapi import HTTPException
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.project.repositories.project_repository import (
    ProjectRepository,
)

from app.modules.project.schemas.project_schema import (
    ProjectCreate,
    ProjectUpdate,
)


class ProjectService:

    @staticmethod
    async def create_project(
        db: AsyncSession,
        payload: ProjectCreate,
    ):

        existing_code = (
            await ProjectRepository.get_by_code(
                db,
                payload.code,
            )
        )

        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Project code already exists",
            )

        existing_name = (
            await ProjectRepository.get_by_name(
                db,
                payload.name,
            )
        )

        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Project name already exists",
            )

        return await ProjectRepository.create(
            db,
            payload,
        )

    @staticmethod
    async def list_projects(
        db: AsyncSession,
    ):

        return await ProjectRepository.list(
            db
        )

    @staticmethod
    async def update_project(
        db: AsyncSession,
        project_id: str,
        payload: ProjectUpdate,
    ):

        project = (
            await ProjectRepository.get_by_id(
                db,
                project_id,
            )
        )

        if not project:
            raise HTTPException(
                status_code=404,
                detail="Project not found",
            )

        return await ProjectRepository.update(
            db,
            project,
            payload,
        )

    @staticmethod
    async def delete_project(
        db: AsyncSession,
        project_id: str,
    ):

        project = (
            await ProjectRepository.get_by_id(
                db,
                project_id,
            )
        )

        if not project:
            raise HTTPException(
                status_code=404,
                detail="Project not found",
            )

        await ProjectRepository.delete(
            db,
            project,
        )

        return {
            "message":
            "Project deleted successfully"
        }