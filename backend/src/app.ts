import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { authRouter } from './modules/auth/auth.router';
import { tasksRouter } from './modules/tasks/tasks.router';
import { errorHandler } from './middlewares/errorHandler';
import { env } from './config/env';

export const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes — versioned under /api/v1
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tasks', tasksRouter);

// Must be last
app.use(errorHandler);
