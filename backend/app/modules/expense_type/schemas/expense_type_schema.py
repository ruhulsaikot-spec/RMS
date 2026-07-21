from uuid import UUID

from pydantic import BaseModel


class ExpenseTypeCreate(BaseModel):
    code: str
    name: str


class ExpenseTypeUpdate(BaseModel):
    code: str
    name: str
    is_active: bool = True


class ExpenseTypeResponse(BaseModel):
    id: UUID
    code: str
    name: str
    is_active: bool

    class Config:
        from_attributes = True