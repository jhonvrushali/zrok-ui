// src/utils/logger.ts
import winston from 'winston';

const logLevel = process.env.LOG_LEVEL ?? 'info';
const logFilePath = process.env.LOG_FILE_PATH ?? './logs/app.log';

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: logFilePath }),
  ],
});
