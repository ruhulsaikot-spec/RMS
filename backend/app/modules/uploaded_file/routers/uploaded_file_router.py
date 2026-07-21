from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
)

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

from app.auth.dependencies import (
    CurrentUser,
)

from app.modules.uploaded_file.services.uploaded_file_service import (
    UploadedFileService,
)

from app.modules.uploaded_file.schemas.uploaded_file_schema import (
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
    file: UploadFile = File(...),
    current_user: CurrentUser = None,
    db: AsyncSession = Depends(get_db),
):

    return await UploadedFileService.upload_file(
        db,
        file,
        current_user["id"],
    )