import type { FastifyInstance } from "fastify";

import {
  InterestStatus,
  ContactMethod,
  PreferredLanguage,
  AgeRange,
  CareType,
} from "@/domain/enums.js";
import type { InterestService } from "@/service/interestService.js";
import { NotFoundError, ForbiddenError } from "@/service/interestService.js";
import {
  interestSchema,
  interestListSchema,
  interestNoteSchema,
  interestCreateSchema,
  interestStatusUpdateSchema,
  interestNoteCreateSchema,
  interestStatusEnum,
} from "../docs/interest-schemas.js";
import { errorSchema } from "../docs/shared-schemas.js";

export interface InterestRoutesDependencies {
  interestService: InterestService;
}

export function interestRoutes(
  fastify: FastifyInstance,
  options: { dependencies: InterestRoutesDependencies }
): void {
  const { interestService } = options.dependencies;

  // POST /interests - Public submission (no auth required)
  fastify.post<{
    Body: {
      providerId: string;
      householdZipCode?: string;
      childAgeRange?: AgeRange;
      careTypePreference?: CareType;
      householdSize?: number;
      incomeRange?: string;
      desiredStartDate?: string;
      eligibilityIndicator?: string;
      contactMethod?: ContactMethod;
      contactPhone?: string;
      contactEmail?: string;
      preferredLanguage?: PreferredLanguage;
      notes?: string;
    };
  }>(
    "/interests",
    {
      schema: {
        tags: ["interests"],
        summary: "Submit interest in a provider (public, no auth required)",
        body: interestCreateSchema,
        response: {
          201: interestSchema,
          400: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const interest = await interestService.submitInterest({
        ...request.body,
        preferredLanguage: request.body.preferredLanguage ?? PreferredLanguage.ENGLISH,
        desiredStartDate: request.body.desiredStartDate
          ? new Date(request.body.desiredStartDate)
          : undefined,
      });
      return reply.code(201).send(interest);
    }
  );

  // GET /interests - Admin only
  fastify.get<{
    Querystring: { status?: InterestStatus };
  }>(
    "/interests",
    {
      schema: {
        tags: ["interests"],
        summary: "List all interest submissions (admin only)",
        querystring: {
          type: "object",
          properties: {
            status: { type: "string", enum: interestStatusEnum },
          },
          additionalProperties: false,
        },
        response: {
          200: interestListSchema,
          401: errorSchema,
          403: errorSchema,
        },
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const user = request.user;
      if (!user) {
        return reply.code(401).send({ error: "Unauthorized" });
      }
      try {
        let interests;
        if (request.query.status) {
          interests = await interestService.getInterestsByStatus(user, request.query.status);
        } else {
          interests = await interestService.getInterests(user);
        }
        return reply.send(interests);
      } catch (error) {
        if (error instanceof ForbiddenError) {
          return reply.code(403).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  // GET /interests/export - Admin only, returns CSV
  fastify.get(
    "/interests/export",
    {
      schema: {
        tags: ["interests"],
        summary: "Export interests as CSV (admin only)",
        response: {
          401: errorSchema,
          403: errorSchema,
        },
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const user = request.user;
      if (!user) {
        return reply.code(401).send({ error: "Unauthorized" });
      }
      try {
        const interests = await interestService.exportInterests(user);

        // Build CSV
        const headers = [
          "ID",
          "Provider",
          "Provider Type",
          "Status",
          "Complete",
          "ZIP",
          "Child Age",
          "Care Type",
          "Household Size",
          "Income Range",
          "Start Date",
          "Contact Method",
          "Phone",
          "Email",
          "Language",
          "Eligibility",
          "Notes",
          "Submitted",
        ];

        const rows = interests.map((i) =>
          [
            i.id,
            i.provider?.name ?? i.providerId,
            i.provider?.type ?? "",
            i.status,
            i.isComplete ? "Yes" : "No",
            i.householdZipCode ?? "",
            i.childAgeRange ?? "",
            i.careTypePreference ?? "",
            i.householdSize ?? "",
            i.incomeRange ?? "",
            i.desiredStartDate ? i.desiredStartDate.toISOString().split("T")[0] : "",
            i.contactMethod ?? "",
            i.contactPhone ?? "",
            i.contactEmail ?? "",
            i.preferredLanguage,
            i.eligibilityIndicator ?? "",
            i.notes ?? "",
            i.submittedAt.toISOString(),
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        );

        const csv = [headers.join(","), ...rows].join("\n");

        return reply
          .header("Content-Type", "text/csv")
          .header("Content-Disposition", 'attachment; filename="interests-export.csv"')
          .send(csv);
      } catch (error) {
        if (error instanceof ForbiddenError) {
          return reply.code(403).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  // GET /interests/:id - Admin only
  fastify.get<{ Params: { id: string } }>(
    "/interests/:id",
    {
      schema: {
        tags: ["interests"],
        summary: "Get interest detail (admin only)",
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        response: {
          200: interestSchema,
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
        return reply.code(401).send({ error: "Unauthorized" });
      }
      try {
        const interest = await interestService.getInterestById(user, request.params.id);
        return reply.send(interest);
      } catch (error) {
        if (error instanceof ForbiddenError) {
          return reply.code(403).send({ error: error.message });
        }
        if (error instanceof NotFoundError) {
          return reply.code(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  // POST /interests/:id/status - Admin only
  fastify.post<{
    Params: { id: string };
    Body: { status: InterestStatus };
  }>(
    "/interests/:id/status",
    {
      schema: {
        tags: ["interests"],
        summary: "Update interest status (admin only)",
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        body: interestStatusUpdateSchema,
        response: {
          200: interestSchema,
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
        return reply.code(401).send({ error: "Unauthorized" });
      }
      try {
        const interest = await interestService.updateStatus(
          user,
          request.params.id,
          request.body.status
        );
        return reply.send(interest);
      } catch (error) {
        if (error instanceof ForbiddenError) {
          return reply.code(403).send({ error: error.message });
        }
        if (error instanceof NotFoundError) {
          return reply.code(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  // POST /interests/:id/notes - Admin only
  fastify.post<{
    Params: { id: string };
    Body: { content: string };
  }>(
    "/interests/:id/notes",
    {
      schema: {
        tags: ["interests"],
        summary: "Add note to interest (admin only)",
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        body: interestNoteCreateSchema,
        response: {
          201: interestNoteSchema,
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
        return reply.code(401).send({ error: "Unauthorized" });
      }
      try {
        const note = await interestService.addNote(user, request.params.id, request.body.content);
        return reply.code(201).send(note);
      } catch (error) {
        if (error instanceof ForbiddenError) {
          return reply.code(403).send({ error: error.message });
        }
        if (error instanceof NotFoundError) {
          return reply.code(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );
}
