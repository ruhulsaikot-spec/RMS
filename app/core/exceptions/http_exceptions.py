from fastapi import HTTPException
from starlette.status import HTTP_404_NOT_FOUND


class NotFoundException(HTTPException):

    def __init__(
        self,
        detail: str = "Resource not found",
    ):
        super().__init__(
            status_code=HTTP_404_NOT_FOUND,
            detail=detail,
        )