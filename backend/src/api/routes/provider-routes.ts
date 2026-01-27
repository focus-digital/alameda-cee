import type { FastifyInstance } from "fastify";

import { ProviderType, CareType, AgeRange } from "@/domain/enums.js";
import type { ProviderService } from "@/service/providerService.js";
import { NotFoundError } from "@/service/providerService.js";
import {
  providerSchema,
  providerListSchema,
  providerTypeEnum,
  careTypeEnum,
  ageRangeEnum,
} from "../docs/provider-schemas.js";
import { errorSchema } from "../docs/shared-schemas.js";

export interface ProviderRoutesDependencies {
  providerService: ProviderService;
}

export function providerRoutes(
  fastify: FastifyInstance,
  options: { dependencies: ProviderRoutesDependencies }
): void {
  const { providerService } = options.dependencies;

  // GET /providers - Public search with filters
  fastify.get<{
    Querystring: {
      zipCode?: string;
      type?: ProviderType;
      careTypes?: string; // comma-separated
      ageRanges?: string; // comma-separated
    };
  }>(
    "/providers",
    {
      schema: {
        tags: ["providers"],
        summary: "Search child care providers (public)",
        querystring: {
          type: "object",
          properties: {
            zipCode: { type: "string" },
            type: { type: "string", enum: providerTypeEnum },
            careTypes: {
              type: "string",
              description: "Comma-separated care types: FULL_DAY,PART_DAY,BEFORE_AFTER_SCHOOL,DROP_IN",
            },
            ageRanges: {
              type: "string",
              description: "Comma-separated age ranges: INFANT,TODDLER,PRESCHOOL,SCHOOL_AGE",
            },
          },
          additionalProperties: false,
        },
        response: {
          200: providerListSchema,
        },
      },
    },
    async (request, reply) => {
      const { zipCode, type, careTypes, ageRanges } = request.query;

      const filters = {
        zipCode,
        type,
        careTypes: careTypes?.split(",").filter(Boolean) as CareType[] | undefined,
        ageRanges: ageRanges?.split(",").filter(Boolean) as AgeRange[] | undefined,
      };

      const providers = await providerService.getProviders(filters);
      return reply.send(providers);
    }
  );

  // GET /providers/:id - Public provider profile
  fastify.get<{ Params: { id: string } }>(
    "/providers/:id",
    {
      schema: {
        tags: ["providers"],
        summary: "Get provider profile (public)",
        params: {
          type: "object",
          properties: { id: { type: "string", format: "uuid" } },
          required: ["id"],
        },
        response: {
          200: providerSchema,
          404: errorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const provider = await providerService.getProviderById(request.params.id);
        return reply.send(provider);
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.code(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );
}
