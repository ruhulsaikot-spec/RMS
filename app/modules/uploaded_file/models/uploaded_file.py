from sqlalchemy import String, BigInteger
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class UploadedFile(BaseModel):
    __tablename__ = "uploaded_files"

    original_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    stored_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    file_extension: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    mime_type: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    file_size: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    storage_path: Mapped[str] = mapped_column(
        String(1000),
        nullable=False,
    )

    uploaded_by: Mapped[str | None] = mapped_column(
        String(36),
        nullable=True,
    )