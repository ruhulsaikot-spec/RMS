from pydantic import BaseModel


class PaymentMethodCreate(BaseModel):

    name: str

    code: str

    description: str | None = None


class PaymentMethodResponse(BaseModel):

    id: str

    name: str

    code: str

    description: str | None = None

    is_active: bool

    model_config = {
        "from_attributes": True
    }