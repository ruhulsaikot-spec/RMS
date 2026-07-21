from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.file.models.file import (
    UploadedFile,
)


class FileRepository:

    @staticmethod
    async def create(
        db: AsyncSession,
        file: UploadedFile,
    ):
        db.add(file)

        await db.commit()

        await db.refresh(file)

        return file