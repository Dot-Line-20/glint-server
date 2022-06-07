import { getFirestore } from 'firebase-admin/firestore'
import { isExistingId, isExistingEmail } from 'lib/exist'
import { randomBytes } from 'crypto'
import { getDocumentId, getEncryptedPassword } from 'lib/encryption'
import createError from 'http-errors'

import type { Request, Response, NextFunction } from 'express'
import type UserDto from './user.dto'

// addUser
export default async function (
  request: Request<unknown, unknown, UserDto>,
  response: Response,
  next: NextFunction
): Promise<void> {
  const body: UserDto & { salt: string } = {
    email: request.body.email,
    name: request.body.name,
    id: request.body.id,
    password: request.body.password,
    birth: request.body.birth,
    salt: '',
  }

  try {
    if (new Date(body.birth).getTime() >= Date.now()) {
      return next(createError(400, 'invalid birth'))
    }

    const id: string = getDocumentId(body.email)

    if (await isExistingEmail(id)) {
      return next(createError(400, 'existing email'))
    }

    if (await isExistingId(body.id)) {
      return next(createError(400, 'existing id'))
    }

    body.salt = randomBytes(128).toString('base64')

    while (body.salt.charAt(body.salt.length - 1) === '=') {
      body.salt = body.salt.slice(0, -1)
    }

    body.password = getEncryptedPassword(body.password, body.salt)

    await getFirestore().collection('users').doc(id).set(body)

    response.jsend.success({ message: 'sucess' })
  } catch (error) {
    return next(
      createError(500, 'server error', {
        detail: {
          expose: false,
          message: error,
        },
      })
    )
  }
}
