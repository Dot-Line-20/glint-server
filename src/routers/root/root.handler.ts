import type { Request, Response } from 'express'

export function rootHandler(request: Request, response: Response): void {
  response.jsend.success(Object.assign({}, request.config))

  return
}
