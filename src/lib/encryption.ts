import { createHash, pbkdf2Sync } from 'crypto'

export function getDocumentId(email: string): string {
  return createHash('sha256').update(email).digest('hex')
}

export function getEncryptedPassword(password: string, salt: string): string {
  return pbkdf2Sync(
    password,
    salt,
    Number(process.env.PBKDF2_LOOP),
    32,
    'sha256'
  ).toString('hex')
}
