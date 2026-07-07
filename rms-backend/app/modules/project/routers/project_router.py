from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

from app.modules.project.schemas.project_schema import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
)

from app.modules.project.services.project_service import (
    ProjectService,
)

router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)


@router.post(
    "/",
    response_model=ProjectResponse,
)
async def create_project(
    payload: ProjectCreate,
    db: AsyncSession = Depends(get_db),
):

    return await ProjectService.create_project(
        db,
        payload,
    )


@router.get(
    "/",
    response_model=list[ProjectResponse],
)
async def list_projects(
    db: AsyncSession = Depends(get_db),
):

    return await ProjectService.list_projects(
        db
    )


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
)
async def update_project(
    project_id: str,
    payload: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
):

    return await ProjectService.update_project(
        db,
        project_id,
        payload,
    )


@router.delete(
    "/{project_id}",
)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):

    return await ProjectService.delete_project(
        db,
        project_id,
    )