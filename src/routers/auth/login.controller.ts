import { getFirestore } from 'firebase-admin/firestore'
import { isExistingEmail } from 'lib/exist'
import createError from 'http-errors'
import { randomBytes } from 'crypto'
import { sign } from 'jsonwebtoken'
import { getDocumentId, getEncryptedPassword } from 'lib/encryption'
import { ACCESS_TOKEN_KEY } from 'lib/config'

import type { Request, Response, NextFunction } from 'express'
import type LoginDto from './login.dto'
import type UserDto from '../users/user.dto'

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
      return next(createError(400, 'non-existing email'))
    }

    const user: User = (
      await getFirestore().collection('users').doc(id).get()
    ).data() as User

    if (typeof user.password !== 'string') {
      return next(createError(400, 'temporary user'))
    }

    if (user.password !== getEncryptedPassword(body.password, user.salt)) {
      return next(createError(400, 'non-matching password'))
    }

    if (typeof user.tokenKey !== 'string') {
      user.tokenKey = randomBytes(32).toString('base64').slice(0, -1)

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
        ACCESS_TOKEN_KEY,
        {
          expiresIn: '1h',
        }
      ),
    })
  } catch (error) {
    return next(createError(500, 'server error'))
  }
}
