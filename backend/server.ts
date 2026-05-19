import 'dotenv/config';
import { app } from './src/app';
import { env } from './src/config/env';
import { prisma } from './src/prisma';
import { logger } from './src/utils/logger';

async function bootstrap() {
  await prisma.$connect();
  logger.info('Database connected');

  app.listen(env.PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
    logger.info(`📚 Swagger docs at http://localhost:${env.PORT}/api-docs`);
  });
}

bootstrap().catch((err) => {
  logger.error(err, 'Bootstrap failed');
  process.exit(1);
});
