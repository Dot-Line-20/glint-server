import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import HttpException from 'exceptions/http'
import { createHash, randomBytes } from 'crypto'

import type { Request, Response, NextFunction } from 'express'
import type UserDto from '../users/user.dto'

interface User extends Pick<UserDto, 'email'> {
  verificationKey: string
  isEmailVerified: boolean
  createdAt: Timestamp
}

// addUser
export default async function (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user: User = (
      await getFirestore()
        .collection('users')
        .where('verificationKey', '==', request.query.verificationKey)
        .get()
    ).docs[0]?.data() as User

    if (
      typeof user === 'undefined' ||
      user.verificationKey !== request.query.verificationKey
    ) {
      throw new HttpException(400, 'invalid verificationKey')
    }

    if (user.createdAt.seconds * 1000 + 180000 < Date.now()) {
      throw new HttpException(400, 'expired verificationKey')
    }

    user.isEmailVerified = true
    user.createdAt = new Timestamp(Math.trunc(Date.now() / 1000), 0)
    user.verificationKey = randomBytes(64).toString('hex')

    await getFirestore()
      .collection('users')
      .doc(createHash('sha256').update(user.email).digest().toString('hex'))
      .set(user)

    response.jsend.success({ message: 'sucess' })
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
