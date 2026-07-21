import os
import uuid

from fastapi import UploadFile

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.uploaded_file.models.uploaded_file import (
    UploadedFile,
)

from app.modules.uploaded_file.repositories.uploaded_file_repository import (
    UploadedFileRepository,
)


class UploadedFileService:

    @staticmethod
    async def upload_file(
        db: AsyncSession,
        file: UploadFile,
        user_id: str,
    ):

        extension = os.path.splitext(
            file.filename
        )[1]

        stored_name = (
            f"{uuid.uuid4()}{extension}"
        )

        upload_dir = "uploads"

        os.makedirs(
            upload_dir,
            exist_ok=True,
        )

        storage_path = os.path.join(
            upload_dir,
            stored_name,
        )

        content = await file.read()

        with open(
            storage_path,
            "wb",
        ) as f:

            f.write(content)

        entity = UploadedFile(

            original_name=file.filename,

            stored_name=stored_name,

            file_extension=extension,

            mime_type=file.content_type,

            file_size=len(content),

            storage_path=storage_path,

            uploaded_by=user_id,
        )

        return await UploadedFileRepository.create(
            db,
            entity,
        )