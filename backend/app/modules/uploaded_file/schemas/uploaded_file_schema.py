from pydantic import BaseModel


class UploadedFileResponse(BaseModel):

    id: str

    original_name: str

    stored_name: str

    file_extension: str

    mime_type: str

    file_size: int

    storage_path: str