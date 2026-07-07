from sqlalchemy import Boolean
from sqlalchemy import Date
from sqlalchemy import ForeignKey
from sqlalchemy import String

from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Employee(BaseModel):
    __tablename__ = "employees"

    employee_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    mobile: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    company_id: Mapped[str] = mapped_column(
        ForeignKey("companies.id"),
        nullable=False,
    )

    department_id: Mapped[str] = mapped_column(
        ForeignKey("departments.id"),
        nullable=False,
    )

    designation_id: Mapped[str] = mapped_column(
        ForeignKey("designations.id"),
        nullable=False,
    )

    location_id: Mapped[str] = mapped_column(
        ForeignKey("locations.id"),
        nullable=False,
    )

    line_manager_id: Mapped[str | None] = mapped_column(
        ForeignKey("employees.id"),
        nullable=True,
    )

    joining_date: Mapped[Date] = mapped_column(
        Date,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    company = relationship(
        "Company",
    )

    department = relationship(
        "Department",
    )

    designation = relationship(
        "Designation",
    )

    location = relationship(
        "Location",
    )

    line_manager = relationship(
        "Employee",
        remote_side="Employee.id",
        foreign_keys=[line_manager_id],
        back_populates="subordinates",
    )

    subordinates = relationship(
        "Employee",
        back_populates="line_manager",
    )