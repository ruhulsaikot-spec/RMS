import os
import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings

from app.modules.file.models.file import (
    UploadedFile,
)

from app.modules.file.repositories.file_repository import (
    FileRepository,
)


class FileService:

    @staticmethod
    async def upload_file(
        db: AsyncSession,
        file: UploadFile,
        user_id: str,
    ):

        extension = (
            Path(file.filename)
            .suffix
            .lower()
        )

        if (
            extension
            not in settings.upload.extensions_list
        ):
            raise ValueError(
                f"File type {extension} not allowed"
            )

        content = await file.read()

        if (
            len(content)
            > settings.upload.max_size_bytes
        ):
            raise ValueError(
                "File exceeds maximum size"
            )

        year_folder = "2026"
        month_folder = "06"

        storage_dir = os.path.join(
            settings.upload.storage_path,
            year_folder,
            month_folder,
        )

        os.makedirs(
            storage_dir,
            exist_ok=True,
        )

        stored_name = (
            f"{uuid.uuid4()}{extension}"
        )

        full_path = os.path.join(
            storage_dir,
            stored_name,
        )

        with open(
            full_path,
            "wb",
        ) as buffer:
            buffer.write(content)

        uploaded_file = UploadedFile(
            original_name=file.filename,
            stored_name=stored_name,
            file_extension=extension,
            mime_type=file.content_type,
            file_size=len(content),
            storage_path=full_path,
            uploaded_by=user_id,
        )

        return await FileRepository.create(
            db,
            uploaded_file,
        )