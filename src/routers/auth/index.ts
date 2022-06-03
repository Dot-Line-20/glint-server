import bodyValidator from '@middleware/validator'
import { IRouters } from '@Ctypes/index'
import login from './login.controller'
import verify from './verify.controller'
import loginDto from './login.dto'

// Register
export default {
  root: '/auth',
  routers: [
    {
      path: '/login',
      method: 'post',
      handler: login,
      middleware: [bodyValidator(loginDto)],
    },
    {
      path: '/verify',
      method: 'get',
      handler: verify,
    },
  ],
} as IRouters
