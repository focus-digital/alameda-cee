export const errorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
  },
  required: ['error'],
  additionalProperties: false,
} as const;

export const okStatusSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['ok'] },
  },
  required: ['status'],
  additionalProperties: false,
} as const;