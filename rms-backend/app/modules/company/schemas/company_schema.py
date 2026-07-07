from uuid import UUID

from pydantic import BaseModel


class CompanyCreate(BaseModel):
    code: str
    name: str
    contact_person: str
    mobile: str | None = None
    email: str
    website: str | None = None
    country: str
    city: str | None = None
    logo: str | None = None


class CompanyUpdate(BaseModel):
    code: str
    name: str
    contact_person: str
    mobile: str | None = None
    email: str
    website: str | None = None
    country: str
    city: str | None = None
    logo: str | None = None
    is_active: bool = True


class CompanyResponse(BaseModel):
    id: UUID
    code: str
    name: str
    contact_person: str
    mobile: str | None
    email: str
    website: str | None
    country: str
    city: str | None
    logo: str | None
    is_active: bool

    class Config:
        from_attributes = True