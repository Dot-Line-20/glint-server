import bodyValidator from '@middleware/validator'
import { IRouters } from '@Ctypes/index'
import addUserHandler from './add.controller'
import UserDto from './user.dto'

// Register
export default {
  root: '/users',
  routers: [
    {
      path: '',
      method: 'post',
      handler: addUserHandler,
      middleware: [bodyValidator(UserDto)],
    },
  ],
} as IRouters
