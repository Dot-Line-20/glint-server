import express, { Request, NextFunction } from 'express'
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import errorHandler from 'middleware/error'
import controllers from './routers'
import { join } from 'path/posix'
import { middleware as jsendMiddleware } from 'jsend'
import { PORT, FIRESTORE_URL } from './lib/config'

// App
export default class {
  public app: express.Application

  constructor() {
    this.app = express()

    this.initializeMiddlewares()
    this.initializeRouter()
    this.initializeErrorHandler()
    this.connectFireStore()
  }

  private initializeRouter(): void {
    for (const { root, routers } of controllers()) {
      for (const {
        path,
        method,
        middleware = [],
        handler,
        config,
      } of routers) {
        this.app[method](
          join(root, path),
          [
            (request: Request, response: unknown, next: NextFunction): void => {
              request.config = config
              next()
            },
            ...middleware,
          ],
          handler
        )
      }
    }
  }

  private connectFireStore(): void {
    initializeApp({
      credential: applicationDefault(),
      databaseURL: FIRESTORE_URL,
    })
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json())
    this.app.use(jsendMiddleware)
  }

  private initializeErrorHandler(): void {
    this.app.use(errorHandler)
  }

  public listen(): void {
    this.app.listen(PORT, (): void => {
      console.log('listening on port ' + PORT)
    })
  }
}
