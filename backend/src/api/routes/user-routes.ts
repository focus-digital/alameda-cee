import type { FastifyInstance } from 'fastify';

import type { UserService } from '@/service/userService.js';
import { type User } from '@/domain/types.js';
import { userSchema } from '../docs/user-schemas.js';
import { errorSchema } from '../docs/shared-schemas.js';

export interface UserRoutesDependencies {
  userService: UserService;
}

export function userRoutes(
  fastify: FastifyInstance,
  options: { dependencies: UserRoutesDependencies },
): void {
  const { userService } = options.dependencies;

  fastify.get<{ Reply: User | { error: string } }>(
    '/users/me',
    {
      schema: {
        tags: ['users'],
        summary: 'Return the authenticated user',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        response: {
          200: userSchema,
          401: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const user = request.user;

      if (!user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      return user;
    },
  );
}
