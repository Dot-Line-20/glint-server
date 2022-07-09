import { join } from 'path'
import * as winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const { combine, timestamp, printf } = winston.format

const fileFormat = printf(
  ({ level, message, timestamp }) => `${timestamp} [${level}] ${message}`
)

const dailyRoateFileTransport: DailyRotateFile = new DailyRotateFile({
  filename: '%DATE%.log',
  dirname: join(__dirname, '../../logs'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'warn',
  format: combine(timestamp({ format: 'HH:mm:ss' }), fileFormat),
})

export default winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    dailyRoateFileTransport,
  ],
})
