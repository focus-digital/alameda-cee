import type { FastifyInstance } from 'fastify';

import {
  InvalidCredentialsError,
  SESSION_TTL_MS,
  type AuthService,
} from '@/service/authService.js';
import type { User } from '@/domain/types.js';
import { SESSION_COOKIE_NAME } from '@/api/plugins/userAuth.js';
import type { UserService } from '@/service/userService.js';
import { userSchema } from '../docs/user-schemas.js';
import { errorSchema, okStatusSchema } from '../docs/shared-schemas.js';

export interface AuthRoutesDependencies {
  authService: AuthService;
  userService: UserService;
}

export function authRoutes(
  fastify: FastifyInstance,
  options: { dependencies: AuthRoutesDependencies },
): void {
  const { authService } = options.dependencies;

  fastify.post<{
    Body: { email: string; password: string };
    Reply: { error: string } | User;
  }>(
    '/login',
    {
      schema: {
        tags: ['auth'],
        summary: 'Login and receive a session cookie',
        body: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 1 },
          },
          required: ['email', 'password'],
          additionalProperties: false,
        },
        response: {
          200: userSchema,
          400: errorSchema,
          401: errorSchema,
        },
      },
      attachValidation: true,
    },
    async (request, reply) => {
      if (request.validationError) {
        return reply.code(400).send({ error: 'Email and password are required' });
      }

      const { email, password } = request.body;

      try {
        const { token, user } = await authService.login(email, password);
        const maxAgeSeconds = Math.floor(SESSION_TTL_MS / 1000);

        const isProduction = process.env.NODE_ENV === 'production';

        reply.setCookie(SESSION_COOKIE_NAME, token, {
          path: '/',
          httpOnly: true,       
          sameSite: isProduction ? 'none' : 'lax',
          secure: isProduction, 
          maxAge: maxAgeSeconds,          
        });

        return user;
      } catch (error) {
        if (error instanceof InvalidCredentialsError) {
          return reply.code(401).send({ error: error.message });
        }

        request.log.error({ err: error }, 'user login failed');
        throw error;
      }
    },
  );

  fastify.post(
    '/logout',
    {
      schema: {
        tags: ['auth'],
        summary: 'Clear the session cookie and logout the user',
        response: {
          200: okStatusSchema,
        },
      },
    },
    async (request, reply) => {
      const token = request.cookies[SESSION_COOKIE_NAME];

      if (token) {
        await authService.logout(token);
      }

      // Clear cookie
      reply
        .clearCookie(SESSION_COOKIE_NAME, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
        .status(200)
        .send({ status: 'ok' });
    },
  );
}
