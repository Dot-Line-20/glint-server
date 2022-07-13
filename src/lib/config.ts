import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({
  path: join(__dirname, '..', '..', process.env.ENV_FILE || '.env'),
})

function check(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing environment variable ${key}`)
  }
  return value
}

const PORT = process.env.PORT || '3000'
const NODE_ENV = process.env.NODE_ENV || 'development'
const PBKDF2_LOOP = process.env.PBKDF2_LOOP || '100000'

const FIRESTORE_URL = check('FIRESTORE_URL')
const ACCESS_TOKEN_KEY = check('ACCESS_TOKEN_KEY')

export { PORT, FIRESTORE_URL, PBKDF2_LOOP, ACCESS_TOKEN_KEY, NODE_ENV }
