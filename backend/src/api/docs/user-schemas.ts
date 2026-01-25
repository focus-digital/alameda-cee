export const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    role: { type: 'string', enum: ['ADMIN', 'USER'] },
  },
  required: ['id', 'email', 'firstName', 'lastName', 'role'],
  additionalProperties: false,
} as const;
