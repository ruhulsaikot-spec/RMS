from uuid import UUID

from pydantic import BaseModel


class DesignationCreate(BaseModel):
    name: str
    code: str
    description: str | None = None

class DesignationUpdate(BaseModel):
    name: str
    code: str
    description: str | None = None
    is_active: bool = True


class DesignationResponse(BaseModel):
    id: UUID
    name: str
    code: str
    description: str | None
    is_active: bool

    class Config:
        from_attributes = True