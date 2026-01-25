import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { fileURLToPath } from 'node:url';

import { PrismaClient } from '@prisma/client';

import { SESSION_COOKIE_NAME, setupUserAuth } from './api/plugins/userAuth.js';
import { UserService } from '@/service/userService.js';
import { AuthService } from '@/service/authService.js';
import { authRoutes } from '@/api/routes/auth-routes.js';
import { userRoutes } from '@/api/routes/user-routes.js';
import { demoRoutes } from '@/api/routes/demo-routes.js';
import { ApplicationService } from '@/service/applicationService.js';
import { applicationRoutes } from '@/api/routes/application-routes.js';
import { AiService } from './service/aiService.js';
import { aiRoutes } from './api/routes/ai-routes.js';

export interface ServerDependencies {
  prisma?: PrismaClient;
  userService?: UserService;
  authService?: AuthService;
  applicationService?: ApplicationService;
  aiService?: AiService;
}

export const AUTH_EXEMPT_PATHS = ['/health', '/login', '/logout', '/demo', '/docs'];
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
const allowedOrigins = ALLOWED_ORIGIN ? [ALLOWED_ORIGIN] : [];

export function buildServer(
  options: FastifyServerOptions = {},
  dependencies: ServerDependencies = {},
): FastifyInstance {

  // Logging
  const fastify = Fastify({
    logger: true,
    ...options,
  });

  // CORS
  fastify.register(cors, {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allowed methods
    credentials: true, // If you use cookies or auth headers
  });

  // Enable cookies
  fastify.register(fastifyCookie);
  
  // Swagger / OpenAPI docs
  setupSwaggerDocs(fastify);

  // Dependencies
  const prisma = dependencies.prisma ?? new PrismaClient();
  const userService =
    dependencies.userService ?? new UserService(prisma);
  const authService =
    dependencies.authService ?? new AuthService(prisma);
  const applicationService =
    dependencies.applicationService ?? new ApplicationService(prisma);
  const aiService = dependencies.aiService ?? new AiService();

  // Middleware
  setupUserAuth(fastify, { authService });

  // Register routes
  registerHealthApi(fastify);
  fastify.register(authRoutes, { dependencies: { authService, userService }});
  fastify.register(userRoutes, { dependencies: { userService }});
  fastify.register(applicationRoutes, { dependencies: { applicationService }});
  fastify.register(demoRoutes, {dependencies: { userService, prisma }});
  fastify.register(aiRoutes, { dependencies: { aiService } } );
  fastify.addHook('onClose', async () => {
    if (!dependencies.prisma) {
      await prisma.$disconnect();
    }
  });

  return fastify;
}

function registerHealthApi(fastify: FastifyInstance) {
  fastify.register((instance) => {
    instance.get(
      '/health',
      {
        schema: {
          tags: ['health'],
          summary: 'API healthcheck',
          response: {
            200: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['ok'] },
              },
              required: ['status'],
              additionalProperties: false,
            },
          },
        },
      },
      async () => ({ status: 'ok' }),
    );
  });
}

function setupSwaggerDocs(fastify: FastifyInstance) {
  fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Fullstack Template API',
        description: 'HTTP API documentation',
        version: '1.0.0',
      },
      servers: [{ url: '/' }],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: SESSION_COOKIE_NAME,
          },
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'UUID',
          },
        },
      },
    },
  });

  fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    staticCSP: true,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
}

//
// === Run ===
//
const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  const host = process.env.HOST ?? '0.0.0.0';

  const start = async () => {
    const server = buildServer();

    try {
      await server.listen({ port, host });
    } catch (error) {
      server.log.error(error, 'fastify failed to start');
      process.exit(1);
    }
  };

  start();
}
