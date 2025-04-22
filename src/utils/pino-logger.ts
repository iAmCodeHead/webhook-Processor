import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { LOG_DIR } from '@config';
import pino from 'pino';


// logs directory
const logDir: string = join(__dirname, LOG_DIR!);

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

export const logger = pino({
  level: 'info',
  transport: {
    targets: [
      {
        target: 'pino/file',
        options: { destination: `${logDir}/server.log` },
      },
      {
        target: 'pino-pretty',
      },
    ],
    options: {
      colorize: true
    },
  }
});
