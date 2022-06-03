import bodyValidator from '@middleware/validator'
import { IRouters } from '@Ctypes/index'
import addUserHandler from './add.controller'
import UserDto, { TempUserDto } from './user.dto'
import addTempController from './addTemp.controller'

// Register
export default {
  root: '/users',
  routers: [
    {
      path: 'temp',
      method: 'post',
      handler: addTempController,
      middleware: [bodyValidator(TempUserDto)],
    },
    {
      path: '',
      method: 'post',
      handler: addUserHandler,
      middleware: [bodyValidator(UserDto)],
    },
  ],
} as IRouters
