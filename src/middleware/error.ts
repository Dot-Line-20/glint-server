import type { NextFunction, Response } from 'express'
import type { HttpError } from 'http-errors'

// errorHandler
export default function (
  error: HttpError,
  _request: unknown,
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const detail = error?.detail || { expose: true }

  response
    .status(error.status || 500)
    .jsend[response.statusCode < 500 ? 'fail' : 'error'](
      Object.assign(
        {
          message: error.message,
        },
        detail?.expose ? { detail: detail.message } : {}
      )
    )
}
