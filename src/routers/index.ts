import { readdirSync } from 'fs'
import type { IRouters } from 'types/index'

export default (): IRouters[] =>
  readdirSync(__dirname, { withFileTypes: true })
    .filter((route) => !route.isFile())
    .map((route) => require(`./${route.name}`))
    .map((route) => route.default)
