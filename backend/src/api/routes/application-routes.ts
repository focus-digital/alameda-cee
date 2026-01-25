import type { FastifyInstance } from 'fastify';

import { ApplicationStatus, LeaveType } from '@/domain/enums.js';
import type { ApplicationService } from '@/service/applicationService.js';
import { ForbiddenError, NotFoundError } from '@/service/applicationService.js';
import { applicationSchema } from '../docs/application-schemas.js';
import { errorSchema } from '../docs/shared-schemas.js';

export interface ApplicationRoutesDependencies {
  applicationService: ApplicationService;
}

export function applicationRoutes(
  fastify: FastifyInstance,
  options: { dependencies: ApplicationRoutesDependencies },
): void {
  const { applicationService } = options.dependencies;

  fastify.post<{
    Body: { leaveType: LeaveType; startDate: string; endDate?: string };
  }>(
    '/applications',
    {
      schema: {
        tags: ['applications'],
        summary: 'Submit a new application',
        body: {
          type: 'object',
          properties: {
            leaveType: { type: 'string', enum: Object.values(LeaveType) },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
          },
          required: ['leaveType', 'startDate'],
          additionalProperties: false,
        },
        response: {
          201: applicationSchema,
          401: errorSchema,
          403: errorSchema,
        },
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const user = request.user;
      if (!user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      if (user.role !== 'USER') {
        return reply.code(403).send({ error: 'Only users can submit applications' });
      }

      try {
        const application = await applicationService.submit(user, {
          leaveType: request.body.leaveType,
          startDate: new Date(request.body.startDate),
          endDate: request.body.endDate ? new Date(request.body.endDate) : undefined,
        });

        return reply.code(201).send(application);
      } catch (error) {
        if (error instanceof ForbiddenError) {
          return reply.code(403).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  fastify.get(
    '/applications',
    {
      schema: {
        tags: ['applications'],
        summary: 'List applications',
        response: {
          200: {
            type: 'array',
            items: applicationSchema,
          },
          401: errorSchema,
        },
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const user = request.user;
      if (!user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const applications = await applicationService.getApplications(user);
      return reply.send(applications);
    },
  );

  fastify.post<{
    Params: { id: string };
  }>(
    '/applications/:id/withdraw',
    {
      schema: {
        tags: ['applications'],
        summary: 'Withdraw an application',
        params: {
          type: 'object',
          properties: { id: { type: 'string', format: 'uuid' } },
          required: ['id'],
        },
        response: {
          200: applicationSchema,
          401: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const user = request.user;
      if (!user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      if (user.role !== 'USER') {
        return reply.code(403).send({ error: 'Only users can withdraw applications' });
      }

      try {
        const updated = await applicationService.withdraw(user, request.params.id);
        return reply.send(updated);
      } catch (error) {
        if (error instanceof ForbiddenError) {
          return reply.code(403).send({ error: error.message });
        }
        if (error instanceof NotFoundError) {
          return reply.code(404).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  fastify.post<{
    Params: { id: string };
    Body: { status: ApplicationStatus };
  }>(
    '/applications/:id/adjudicate',
    {
      schema: {
        tags: ['applications'],
        summary: 'Adjudicate an application (admin only)',
        params: {
          type: 'object',
          properties: { id: { type: 'string', format: 'uuid' } },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: Object.values(ApplicationStatus) },
          },
          required: ['status'],
          additionalProperties: false,
        },
        response: {
          200: applicationSchema,
          401: errorSchema,
          403: errorSchema,
          404: errorSchema,
        },
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const user = request.user;
      if (!user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      if (user.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'Admins only' });
      }

      try {
        const updated = await applicationService.adjudicate(
          user,
          request.params.id,
          request.body.status,
        );
        return reply.send(updated);
      } catch (error) {
        if (error instanceof ForbiddenError) {
          return reply.code(403).send({ error: error.message });
        }
        if (error instanceof NotFoundError) {
          return reply.code(404).send({ error: error.message });
        }
        throw error;
      }
    },
  );
}
