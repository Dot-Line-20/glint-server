import createError from 'http-errors'
import { plainToInstance } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'

import type { Request, NextFunction, RequestHandler } from 'express'

// bodyValidateHandler
export default function (type: any): RequestHandler {
  return (request: Request, _response: unknown, next: NextFunction): void => {
    const body = request.body

    if (typeof body === 'undefined') {
      return next(createError(400, 'no passed data'))
    }

    validate(plainToInstance(type, body)).then(
      (errors: ValidationError[]): void => {
        if (errors.length === 0) {
          next()

          return
        }

        const exceptions: string[] = []

        for (const { constraints = [] } of errors) {
          exceptions.push(Object.values(constraints).join(', '))
        }

        return next(
          createError(400, 'missing or invalid data', {
            detail: {
              expose: false,
              message: exceptions,
            },
          })
        )
      }
    )
  }
}
