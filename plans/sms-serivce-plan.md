# Plan: Create SmsService

## Context
The codebase already captures `contactPhone` and `contactMethod = "TEXT"` on interest submissions but has no SMS-sending implementation. This plan adds an `SmsService` using Twilio, mirroring the existing `EmailService` pattern.

## Critical Files
- **Reference:** `backend/src/service/emailService.ts` — pattern to follow exactly
- **New file:** `backend/src/service/smsService.ts` — to be created
- **Dependencies:** `backend/package.json` — add `twilio` package
- **Env example:** `backend/.env.example` — add Twilio env var stubs

---

## Implementation Steps

### 1. Install Twilio SDK
```
yarn workspace backend add twilio
yarn workspace backend add -D @types/twilio   # if needed; twilio ships its own types
```

### 2. Create `backend/src/service/smsService.ts`

Model after `emailService.ts`:

```ts
import Twilio from 'twilio';

export type SendSmsPayload = {
  to: string;
  body: string;
};

export class SmsService {
  private readonly client: Twilio.Twilio;
  private readonly from: string;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    const accountSid = env.TWILIO_ACCOUNT_SID;
    const authToken  = env.TWILIO_AUTH_TOKEN;
    const from       = env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !from) {
      throw new Error('Twilio env vars not configured');
    }

    this.client = Twilio(accountSid, authToken);
    this.from   = from;
  }

  async sendSms(payload: SendSmsPayload) {
    const { to, body } = payload;
    return this.client.messages.create({ from: this.from, to, body });
  }
}
```

### 3. Update env files

**`backend/.env.example`** — add commented stubs:
```
# TWILIO_ACCOUNT_SID=your-twilio-account-sid
# TWILIO_AUTH_TOKEN=your-twilio-auth-token
# TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

**`backend/.env`** — add real values (user must supply actual Twilio credentials):
```
TWILIO_ACCOUNT_SID=<your-account-sid>
TWILIO_AUTH_TOKEN=<your-auth-token>
TWILIO_PHONE_NUMBER=<your-twilio-number>
```

### 4. Create `backend/tests/service/smsService.test.ts`

The project uses Vitest. Mock the `twilio` module with `vi.mock` and test:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SmsService } from '@/service/smsService';

const mockCreate = vi.fn().mockResolvedValue({ sid: 'SM123' });

vi.mock('twilio', () => ({
  default: vi.fn(() => ({
    messages: { create: mockCreate },
  })),
}));

const baseEnv = {
  TWILIO_ACCOUNT_SID: 'ACtest',
  TWILIO_AUTH_TOKEN:  'authtest',
  TWILIO_PHONE_NUMBER: '+10000000000',
};

describe('SmsService', () => {
  beforeEach(() => mockCreate.mockClear());

  it('throws when env vars are missing', () => {
    expect(() => new SmsService({})).toThrow('Twilio env vars not configured');
  });

  it('constructs successfully with all env vars', () => {
    expect(() => new SmsService(baseEnv)).not.toThrow();
  });

  it('sends an SMS with correct params', async () => {
    const svc = new SmsService(baseEnv);
    await svc.sendSms({ to: '+19999999999', body: 'Hello' });

    expect(mockCreate).toHaveBeenCalledOnce();
    expect(mockCreate).toHaveBeenCalledWith({
      from: '+10000000000',
      to:   '+19999999999',
      body: 'Hello',
    });
  });
});
```

---

## Verification
1. `yarn workspace backend tsc --noEmit` — confirms no type errors
2. `yarn workspace backend vitest run tests/service/smsService.test.ts` — all 3 unit tests pass
3. Manual smoke test: set real Twilio credentials in `.env.local` and call `sendSms({ to: '+1...', body: 'test' })` from a route or script.
