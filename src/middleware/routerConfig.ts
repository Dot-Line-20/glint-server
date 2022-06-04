import type { Response, NextFunction } from 'express'

// routerConfigHandler
export default function (
  request: unknown,
  response: Response & { config: unknown },
  next: NextFunction,
  config: object
): void {
  response.config = config

  next()

  return
}
