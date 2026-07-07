from uuid import UUID

from pydantic import BaseModel


class LocationCreate(BaseModel):
    name: str
    code: str


class LocationUpdate(BaseModel):
    name: str
    code: str
    is_active: bool = True


class LocationResponse(BaseModel):
    id: UUID
    name: str
    code: str
    is_active: bool

    class Config:
        from_attributes = True