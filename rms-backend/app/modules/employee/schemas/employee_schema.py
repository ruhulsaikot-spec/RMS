from uuid import UUID
from datetime import date

from pydantic import BaseModel


class DepartmentInfo(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True


class DesignationInfo(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True


class EmployeeCreate(BaseModel):
    employee_id: str
    name: str
    email: str
    mobile: str | None = None

    company_id: str
    department_id: str
    designation_id: str
    location_id: str

    line_manager_id: str | None = None

    joining_date: date


class EmployeeUpdate(BaseModel):
    employee_id: str
    name: str
    email: str
    mobile: str | None = None

    company_id: str
    department_id: str
    designation_id: str
    location_id: str

    line_manager_id: str | None = None

    joining_date: date

    is_active: bool = True


class EmployeeResponse(BaseModel):
    id: UUID

    employee_id: str
    name: str
    email: str
    mobile: str | None

    company_id: str
    department_id: str
    designation_id: str
    location_id: str

    department: DepartmentInfo | None = None
    designation: DesignationInfo | None = None

    line_manager_id: str | None

    joining_date: date

    is_active: bool

    class Config:
        from_attributes = True