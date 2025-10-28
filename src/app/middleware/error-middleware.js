import { NotFoundError, ConflictError,UnauthorizedError, UnauthenticatedError, ServerError, ValidationError, TooManyRequestError, BadRequestError } from "../../lib/error-definitions.js";

export default function (err, req, res, next)
{
    if (err instanceof NotFoundError || err instanceof BadRequestError || err instanceof ConflictError || err instanceof UnauthenticatedError || err instanceof ServerError || err instanceof ValidationError || err instanceof TooManyRequestError || err instanceof UnauthorizedError)
    {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    if (err instanceof ValidationError)
    {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
        });
    }
    return res.status(500).json({
        success: false,
        message: err.message
    })
}