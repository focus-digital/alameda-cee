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
import { AiService } from './service/aiService.js';
import { aiRoutes } from './api/routes/ai-routes.js';
import { ProviderService } from '@/service/providerService.js';
import { providerRoutes } from '@/api/routes/provider-routes.js';
import { InterestService } from '@/service/interestService.js';
import { interestRoutes } from '@/api/routes/interest-routes.js';

export interface ServerDependencies {
  prisma?: PrismaClient;
  userService?: UserService;
  authService?: AuthService;
  aiService?: AiService;
  providerService?: ProviderService;
  interestService?: InterestService;
}

// Public paths that don't require authentication
// Note: POST /interests is public but GET /interests requires admin auth (handled in route)
export const AUTH_EXEMPT_PATHS = ['/health', '/login', '/logout', '/demo', '/docs', '/providers', '/interests'];
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
  const aiService = dependencies.aiService ?? new AiService();
  const providerService =
    dependencies.providerService ?? new ProviderService(prisma);
  const interestService =
    dependencies.interestService ?? new InterestService(prisma);

  // Middleware
  setupUserAuth(fastify, { authService });

  // Register routes
  registerHealthApi(fastify);
  fastify.register(authRoutes, { dependencies: { authService, userService }});
  fastify.register(userRoutes, { dependencies: { userService }});
  fastify.register(demoRoutes, {dependencies: { userService, prisma }});
  fastify.register(aiRoutes, { dependencies: { aiService } });
  fastify.register(providerRoutes, { dependencies: { providerService }});
  fastify.register(interestRoutes, { dependencies: { interestService }});
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
        title: 'First 5 Alameda CEE API',
        description: 'Coordinated Eligibility & Enrollment API',
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
