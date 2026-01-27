import { providerSchema, ageRangeEnum, careTypeEnum } from "./provider-schemas.js";

export const interestStatusEnum = ["NEW", "IN_PROGRESS", "CONTACTED", "CLOSED"] as const;
export const contactMethodEnum = ["PHONE", "EMAIL", "TEXT"] as const;
export const preferredLanguageEnum = ["ENGLISH", "SPANISH"] as const;

export const interestNoteSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    interestId: { type: "string", format: "uuid" },
    authorId: { type: "string", format: "uuid" },
    content: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
  },
  required: ["id", "interestId", "authorId", "content", "createdAt"],
  additionalProperties: false,
} as const;

export const interestSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    providerId: { type: "string", format: "uuid" },
    provider: { ...providerSchema, nullable: true },
    householdZipCode: { type: "string", nullable: true },
    childAgeRange: { type: "string", enum: ageRangeEnum, nullable: true },
    careTypePreference: { type: "string", enum: careTypeEnum, nullable: true },
    householdSize: { type: "integer", nullable: true },
    incomeRange: { type: "string", nullable: true },
    desiredStartDate: { type: "string", format: "date", nullable: true },
    eligibilityIndicator: { type: "string", nullable: true },
    contactMethod: { type: "string", enum: contactMethodEnum, nullable: true },
    contactPhone: { type: "string", nullable: true },
    contactEmail: { type: "string", format: "email", nullable: true },
    preferredLanguage: { type: "string", enum: preferredLanguageEnum },
    notes: { type: "string", nullable: true },
    status: { type: "string", enum: interestStatusEnum },
    isComplete: { type: "boolean" },
    submittedAt: { type: "string", format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    adminNotes: { type: "array", items: interestNoteSchema },
  },
  required: [
    "id",
    "providerId",
    "preferredLanguage",
    "status",
    "isComplete",
    "submittedAt",
    "createdAt",
    "updatedAt",
  ],
  additionalProperties: false,
} as const;

export const interestListSchema = {
  type: "array",
  items: interestSchema,
} as const;

export const interestCreateSchema = {
  type: "object",
  properties: {
    providerId: { type: "string", format: "uuid" },
    householdZipCode: { type: "string" },
    childAgeRange: { type: "string", enum: ageRangeEnum },
    careTypePreference: { type: "string", enum: careTypeEnum },
    householdSize: { type: "integer", minimum: 1 },
    incomeRange: { type: "string" },
    desiredStartDate: { type: "string", format: "date" },
    eligibilityIndicator: { type: "string" },
    contactMethod: { type: "string", enum: contactMethodEnum },
    contactPhone: { type: "string" },
    contactEmail: { type: "string", format: "email" },
    preferredLanguage: { type: "string", enum: preferredLanguageEnum },
    notes: { type: "string" },
  },
  required: ["providerId"],
  additionalProperties: false,
} as const;

export const interestStatusUpdateSchema = {
  type: "object",
  properties: {
    status: { type: "string", enum: interestStatusEnum },
  },
  required: ["status"],
  additionalProperties: false,
} as const;

export const interestNoteCreateSchema = {
  type: "object",
  properties: {
    content: { type: "string", minLength: 1 },
  },
  required: ["content"],
  additionalProperties: false,
} as const;
