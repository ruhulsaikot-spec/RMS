from uuid import UUID

from pydantic import BaseModel


class CostCenterCreate(BaseModel):
    code: str
    name: str


class CostCenterUpdate(BaseModel):
    code: str
    name: str
    is_active: bool = True


class CostCenterResponse(BaseModel):
    id: UUID
    code: str
    name: str
    is_active: bool

    class Config:
        from_attributes = True