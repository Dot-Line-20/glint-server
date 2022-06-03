import { Request, Response, NextFunction } from 'express'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import HttpException from '@exceptions/http'
import UserDto from './user.dto'
import { createHash, randomBytes } from 'crypto'

interface User extends Pick<UserDto, 'email'> {
  verificationKey: string
  isEmailVerified: boolean
  createdAt: Timestamp
}

// addUser
export default async function (
  request: Request<unknown, unknown, Pick<UserDto, 'email'>>,
  response: Response,
  next: NextFunction
): Promise<void> {
  const body: User = {
    email: request.body.email,
    verificationKey: '',
    createdAt: new Timestamp(Math.trunc(Date.now() / 1000), 0),
    isEmailVerified: false,
  }

  try {
    const id: string = createHash('sha256')
      .update(body.email)
      .digest()
      .toString('hex')

    const user: User & { password: string } = (await (
      await getFirestore().collection('users').doc(id).get()
    ).data()) as User & { password: string }

    if (typeof user !== 'undefined' && typeof user.password === 'string') {
      throw new HttpException(400, 'existing email')
    }

    body.verificationKey = randomBytes(64).toString('hex')

    // TODO: logic to send verifying url to user with email

    await getFirestore().collection('users').doc(id).set(body)

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
