export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      PORT: string
      FIRESTORE_URL: string
      GOOGLE_APPLICATION_CREDENTIALS: string
      PBKDF2_LOOP: string
      ACCESS_TOKEN_KEY: string
    }
  }
}
