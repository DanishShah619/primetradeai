import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PrimeTrade Task Manager API',
      version: '1.0.0',
      description: 'REST API with JWT auth, RBAC, and task management',
    },
    servers: [{ url: `http://localhost:${env.PORT}` }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterDto: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Jane Doe' },
            email: { type: 'string', format: 'email', example: 'jane@example.com' },
            password: { type: 'string', minLength: 8, example: 'secret123' },
          },
        },
        LoginDto: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        RefreshDto: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        CreateTaskDto: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', maxLength: 255 },
            description: { type: 'string', maxLength: 2000 },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
          },
        },
        UpdateTaskDto: {
          type: 'object',
          properties: {
            title: { type: 'string', maxLength: 255 },
            description: { type: 'string', maxLength: 2000 },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.router.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
