import { Server } from 'http';
import app from './app.js';
import { env } from './config/env.config';
import { logger } from './utils/logger';
import { prisma } from './config/prisma.config';

let server: Server;

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('🐘 Database connection established successfully');

    server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`Health check available at http://localhost:${env.PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:');
    logger.error(error instanceof Error ? error.stack : String(error));
    process.exit(1);
  }
};

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: Error) => {
  logger.error('🔥 Unexpected error detected:');
  logger.error(error.stack || error.message);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', (reason: any) => {
  logger.error('🔥 Unhandled rejection detected:');
  if (reason instanceof Error) {
    logger.error(reason.stack || reason.message);
  } else {
    logger.error(String(reason));
  }
  exitHandler();
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

startServer();
