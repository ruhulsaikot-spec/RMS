from fastapi import APIRouter
from fastapi import Depends
from fastapi import UploadFile
from fastapi import File

from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import (
    CurrentUser,
)

from app.core.database import get_db

from app.modules.file.services.file_service import (
    FileService,
)

from app.modules.file.schemas.file_schema import (
    UploadedFileResponse,
)

router = APIRouter(
    prefix="/files",
    tags=["Files"],
)


@router.post(
    "/upload",
    response_model=UploadedFileResponse,
)
async def upload_file(
    current_user: CurrentUser,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):

    return await FileService.upload_file(
        db=db,
        file=file,
        user_id=current_user["id"],
    )