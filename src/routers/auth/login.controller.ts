import { Request, Response, NextFunction } from 'express'
import { getFirestore } from 'firebase-admin/firestore'
import { isExistingEmail } from '@lib/exist'
import HttpException from '@exceptions/http'
import LoginDto from './login.dto'
import { randomBytes } from 'crypto'
import UserDto from '../users/user.dto'
import { sign } from 'jsonwebtoken'
import { getDocumentId, getEncryptedPassword } from '@lib/encryption'

interface User extends UserDto {
  salt: string
  tokenKey: string
}

// login
export default async function (
  request: Request<unknown, unknown, LoginDto>,
  response: Response,
  next: NextFunction
): Promise<void> {
  const body: LoginDto = {
    email: request.body.email,
    password: request.body.password,
  }

  const id: string = getDocumentId(body.email)

  try {
    if (!(await isExistingEmail(id))) {
      throw new HttpException(400, 'non-existing email')
    }

    const user: User = (
      await getFirestore().collection('users').doc(id).get()
    ).data() as User

    if (typeof user.password !== 'string') {
      throw new HttpException(400, 'temporary user')
    }

    if (user.password !== getEncryptedPassword(body.password, user.salt)) {
      throw new HttpException(400, 'non-matching password')
    }

    if (typeof user.tokenKey !== 'string') {
      user.tokenKey = randomBytes(32).toString('base64')

      while (user.tokenKey.charAt(user.tokenKey.length - 1) === '=') {
        user.tokenKey = user.tokenKey.slice(0, -1)
      }

      await getFirestore()
        .collection('users')
        .doc(id)
        .update('tokenKey', user.tokenKey)
    }

    response.jsend.success({
      refreshToken: sign(
        {
          id: user['id'],
        },
        user.tokenKey,
        {
          expiresIn: '90d',
        }
      ),
      accessToken: sign(
        {
          id: user['id'],
        },
        process.env.ACCESS_TOKEN_KEY,
        {
          expiresIn: '1h',
        }
      ),
    })
  } catch (error: any) {
    console.log(error.message)

    next(
      error instanceof HttpException
        ? error
        : new HttpException(500, 'server error')
    )
  }

  return
}
