import type { FastifyInstance } from 'fastify';
import '@fastify/cookie';

import type { User } from '@/domain/types.js';
import { UserService } from '@/service/userService.js';
import type { AuthService } from '@/service/authService.js';
import { includes } from 'lodash-es';
import { AUTH_EXEMPT_PATHS } from '../../server.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}

export const SESSION_COOKIE_NAME = 'sessionToken'; // TODO env variable

export interface UserAuthOptions {
  authService: AuthService;
  exemptPaths?: string[];
}

export function setupUserAuth(fastify: FastifyInstance, options: UserAuthOptions): void {
  const { authService, exemptPaths = AUTH_EXEMPT_PATHS } = options;

  fastify.decorateRequest('user', undefined);

  fastify.addHook('onRequest', async (request, reply) => {
    const url = request.raw.url ?? '';
    const path = url.split('?')[0] ?? '';

    for (const exemptPath of exemptPaths) {
      if (path.includes(exemptPath)) {
        return;
      }
    }

    const authorization = request.headers.authorization;
    let token: string | undefined;

    if (authorization?.startsWith('Bearer ')) {
      token = authorization.slice('Bearer '.length).trim();
    } else {
      token = request.cookies?.[SESSION_COOKIE_NAME];
    }

    if (!token) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const user = authService.authenticate(token);

    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    request.user = user;
  });
}