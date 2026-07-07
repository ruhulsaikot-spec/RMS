from pydantic import BaseModel


class UploadedFileResponse(BaseModel):

    id: str

    original_name: str

    storage_path: str

    file_size: int