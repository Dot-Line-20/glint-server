import { IsEmail, IsHash } from 'class-validator'

// UserDto
export default class {
  @IsEmail()
  public email: string

  @IsHash('sha256')
  public password: string
}
