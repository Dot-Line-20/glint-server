import { join } from 'path'
import * as winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { NODE_ENV } from 'lib/config'

const { combine, timestamp, printf, colorize } = winston.format

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

const consoleTransport = new winston.transports.Console({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    printf(({ level, message }) => `${level} ${message}`),
    colorize()
  ),
})

export default winston.createLogger({
  transports: [consoleTransport, dailyRoateFileTransport],
})
