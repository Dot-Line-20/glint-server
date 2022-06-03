import type { Request, NextFunction, RequestHandler } from 'express'
import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import HttpException from 'exceptions/http'

// bodyValidateHandler
export default function (type: ClassConstructor<any>): RequestHandler {
  return (request: Request, _, next: NextFunction): void => {
    const body = request.body

    if (typeof body === 'undefined') {
      next(new HttpException(400, 'no passed data'))

      return
    }

    validate(plainToInstance(type, body)).then(
      (errors: ValidationError[]): void => {
        if (errors.length === 0) {
          next()

          return
        }

        const exceptions: string[] = []

        for (const { constraints = {} } of errors) {
          exceptions.push(Object.values(constraints).join(', '))
        }

        next(
          new HttpException(400, 'missing or invalid data', {
            errors: exceptions,
          })
        )

        return
      }
    )
  }
}
