export const providerTypeEnum = ["FAMILY_CHILD_CARE", "CENTER_BASED"] as const;
export const careTypeEnum = ["FULL_DAY", "PART_DAY", "BEFORE_AFTER_SCHOOL", "DROP_IN"] as const;
export const ageRangeEnum = ["INFANT", "TODDLER", "PRESCHOOL", "SCHOOL_AGE"] as const;

export const providerSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    type: { type: "string", enum: providerTypeEnum },
    address: { type: "string" },
    city: { type: "string" },
    zipCode: { type: "string" },
    latitude: { type: "number", nullable: true },
    longitude: { type: "number", nullable: true },
    phone: { type: "string", nullable: true },
    email: { type: "string", nullable: true },
    website: { type: "string", nullable: true },
    descriptionEn: { type: "string", nullable: true },
    descriptionEs: { type: "string", nullable: true },
    acceptsSubsidy: { type: "boolean" },
    ageRangesServed: { type: "array", items: { type: "string", enum: ageRangeEnum } },
    careTypesOffered: { type: "array", items: { type: "string", enum: careTypeEnum } },
    serviceAttributes: { type: "object", nullable: true },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: [
    "id",
    "name",
    "type",
    "address",
    "city",
    "zipCode",
    "acceptsSubsidy",
    "ageRangesServed",
    "careTypesOffered",
    "isActive",
    "createdAt",
    "updatedAt",
  ],
  additionalProperties: false,
} as const;

export const providerListSchema = {
  type: "array",
  items: providerSchema,
} as const;
