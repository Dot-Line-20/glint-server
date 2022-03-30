import express, {Request, NextFunction} from 'express'
import {initializeApp, applicationDefault} from 'firebase-admin/app'
import Controller from './interface/controllers'
import ErrorHandler from './middleware/error'
import {IRouters} from './types'
import URLPathJoin from './lib/URLPathJoin'
import controllers from './routers'

export default class App {
  public app: express.Application

  constructor() {
    this.app = express()

    this.initializeMiddlewares()
    this.initializeRouter()
    this.initializeErrorHandler()
    this.connectFireStore()
  }

  private initializeRouter(): void {
    controllers.forEach(({root, routers}: IRouters) => {
      routers.forEach(({path, method, middleware = [], handler, config}) => {
        this.app[method](
          URLPathJoin(root, path),
          [
            ...middleware,
            (req:Request, _: any, next: NextFunction) => {
              req.config = config
              next()
            },
          ],
          handler
        )
      })
    })
  }

  private connectFireStore(): void {
    initializeApp({
      credential: applicationDefault(),
      databaseURL: process.env.FIRESTORE_URL,
    })
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json())
  }

  private initializeErrorHandler(): void {
    this.app.use(ErrorHandler)
  }

  public listen(): void {
    const PORT: string | number = process.env.PORT || 3000

    this.app.listen(PORT, () => {
      console.log('listening on port ' + PORT)
    })
  }
}