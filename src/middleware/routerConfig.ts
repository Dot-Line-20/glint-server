import type { Response, NextFunction } from 'express'

// routerConfigHandler
export default function (
  response: Response & { config: unknown },
  next: NextFunction,
  config: object
): void {
  response.config = config

  return next()
}
