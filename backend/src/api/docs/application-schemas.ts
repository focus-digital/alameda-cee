export const applicationSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    leaveType: {
      type: 'string',
      enum: [
        'ChildBirthRecovery',
        'ChildBirthBonding',
        'AdoptionBonding',
        'FosterCareBonding',
        'SeriousIllness',
        'SeriousSurgery',
        'Caregiver',
        'MilitaryCaregiver',
      ],
    },
    status: {
      type: 'string',
      enum: ['UNDER_REVIEW', 'APPROVED', 'DENIED', 'WITHDRAWN'],
    },
    startDate: { type: 'string', format: 'date-time' },
    endDate: { type: 'string', format: 'date-time' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'userId', 'leaveType', 'status', 'startDate', 'createdAt', 'updatedAt'],
  additionalProperties: false,
} as const;
