from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.uploaded_file.models.uploaded_file import (
    UploadedFile,
)


class UploadedFileRepository:

    @staticmethod
    async def create(
        db: AsyncSession,
        entity: UploadedFile,
    ):

        db.add(entity)

        await db.commit()

        await db.refresh(entity)

        return entity