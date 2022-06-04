import type { NextFunction, Response } from 'express'
import type HttpException from 'exceptions/http'

// errorHandler
export default function (
  error: HttpException,
  request: unknown,
  response: Response,
  next: NextFunction
): void {
  const more: unknown = error?.more

  if (typeof more !== 'undefined') {
    console.log(more)
  }

  response
    .status(error.status || 500)
    .jsend[response.statusCode < 500 ? 'fail' : 'error'](
      Object.assign({ message: error.message || 'something went wrong' }, more)
    )

  next()

  return
}
