import { Request, Response, NextFunction } from 'express'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { isExistingId } from '@lib/exist'
import HttpException from '@exceptions/http'
import UserDto from './user.dto'
import { createHash, pbkdf2Sync, randomBytes } from 'crypto'

interface User extends UserDto {
  salt: string
  createdAt: Timestamp
}

// addUser
export default async function (
  request: Request<unknown, unknown, Omit<User, 'salt'>>,
  response: Response,
  next: NextFunction
): Promise<void> {
  const body: Omit<User, 'createdAt'> = {
    email: request.body.email,
    name: request.body.name,
    id: request.body.id,
    password: request.body.password,
    birth: request.body.birth,
    salt: '',
  }

  try {
    const id: string = createHash('sha256')
      .update(body.email)
      .digest()
      .toString('hex')

    const user: User & { isEmailVerified: boolean; verificationKey: string } =
      (await (
        await getFirestore().collection('users').doc(id).get()
      ).data()) as User & { isEmailVerified: boolean; verificationKey: string }

    if (typeof user === 'undefined') {
      throw new HttpException(400, 'non-existing temporary user')
    }

    if (user.verificationKey !== request.query.verificationKey) {
      throw new HttpException(400, 'invalid verificationKey')
    }

    if (user.createdAt.seconds * 1000 + 180000 < Date.now()) {
      throw new HttpException(400, 'expired verificationKey')
    }

    if (!user.isEmailVerified) {
      throw new HttpException(400, 'unverified email')
    }

    if (await isExistingId(body.id)) {
      throw new HttpException(400, 'existing id')
    }

    if (new Date(body['birth']).getTime() >= Date.now()) {
      throw new HttpException(400, 'invalid birth')
    }

    body.salt = randomBytes(128).toString('base64')

    while (body.salt.charAt(body.salt.length - 1) === '=') {
      body.salt = body.salt.slice(0, -1)
    }

    body.password = pbkdf2Sync(
      body.password,
      body.salt,
      Number(process.env.PBKDF2_LOOP),
      32,
      'sha256'
    ).toString('hex')

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
