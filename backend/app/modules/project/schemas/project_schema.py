from uuid import UUID

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    code: str
    name: str


class ProjectUpdate(BaseModel):
    code: str
    name: str
    is_active: bool = True


class ProjectResponse(BaseModel):
    id: UUID
    code: str
    name: str
    is_active: bool

    class Config:
        from_attributes = True