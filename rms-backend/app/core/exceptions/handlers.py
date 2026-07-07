from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.exceptions.custom_exceptions import RMSBaseException


async def rms_exception_handler(
    request: Request,
    exc: RMSBaseException,
):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "type": exc.error_type,
                "title": exc.title,
                "detail": exc.message,
                "status": exc.status_code,
            },
        },
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "type": "validation_error",
                "title": "Validation Error",
                "detail": exc.errors(),
                "status": 422,
            },
        },
    )


async def generic_exception_handler(
    request: Request,
    exc: Exception,
):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "type": "internal_server_error",
                "title": "Internal Server Error",
                "detail": str(exc),
                "status": 500,
            },
        },
    )


def register_exception_handlers(app):
    app.add_exception_handler(
        RMSBaseException,
        rms_exception_handler,
    )

    app.add_exception_handler(
        RequestValidationError,
        validation_exception_handler,
    )

    app.add_exception_handler(
        Exception,
        generic_exception_handler,
    )