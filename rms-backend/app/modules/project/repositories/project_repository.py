from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.project.models.project import (
    Project,
)

from app.modules.project.schemas.project_schema import (
    ProjectCreate,
)


class ProjectRepository:

    @staticmethod
    async def get_by_code(
        db: AsyncSession,
        code: str,
    ):

        result = await db.execute(
            select(Project).where(
                Project.code == code
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_name(
        db: AsyncSession,
        name: str,
    ):

        result = await db.execute(
            select(Project).where(
                Project.name == name
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def create(
        db: AsyncSession,
        payload: ProjectCreate,
    ):

        project = Project(
            code=payload.code,
            name=payload.name,
        )

        db.add(project)

        await db.commit()
        await db.refresh(project)

        return project

    @staticmethod
    async def list(
        db: AsyncSession,
    ):

        result = await db.execute(
            select(Project)
        )

        return result.scalars().all()

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        project_id: str,
    ):

        result = await db.execute(
            select(Project).where(
                Project.id == project_id
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def update(
        db: AsyncSession,
        project: Project,
        payload,
    ):

        project.code = payload.code
        project.name = payload.name
        project.is_active = payload.is_active

        await db.commit()
        await db.refresh(project)

        return project

    @staticmethod
    async def delete(
        db: AsyncSession,
        project: Project,
    ):

        await db.delete(project)
        await db.commit()