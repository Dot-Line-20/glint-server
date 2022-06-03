import type { IRouters } from 'types/index'
import { rootHandler } from './root.handler'

// Root
export default {
  root: '/',
  routers: [
    {
      path: '/',
      method: 'get',
      handler: rootHandler,
      config: {
        needAuth: true,
      },
    },
    {
      path: '/a',
      method: 'get',
      handler: rootHandler,
      config: {
        foo: 'bar',
      },
    },
    {
      path: '/b',
      method: 'get',
      handler: rootHandler,
    },
  ],
} as IRouters
// exports are always constant(= readonly)
