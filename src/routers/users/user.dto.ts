import {
  IsDateString,
  IsEmail,
  IsHash,
  IsString,
  Length,
  Matches,
} from 'class-validator'

// UserDto
export default class {
  @IsEmail()
  public email!: string

  @IsString()
  @Length(1, 20)
  public name!: string

  @Matches(/^[0-9A-z_]{4,15}$/, {
    message: 'id must contain only letters and numbers with underscore',
  })
  @Length(4, 15)
  public id!: string

  @IsHash('sha256')
  public password!: string

  @IsDateString()
  public birth!: string
}

export class TempUserDto {
  @IsEmail()
  public email!: string
}
