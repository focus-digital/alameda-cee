# User Story: SMS Confirmation on Interest Form Submission

> As a user, I want to receive a text message confirming my submission of an interest form when I identify phone or text message as my preferred communication method.

## Context
The codebase captures `contactPhone` and `contactMethod` on interest submissions. The `ContactMethod` enum has three values: `EMAIL`, `PHONE`, and `TEXT`. Currently only email is sent on submission and the confirmation page only acknowledges email. This plan adds `SmsService` using Twilio for PHONE/TEXT methods and updates the confirmation page to reflect the correct contact method.

**Consent & cost considerations:**
- `TEXT` — by selecting text message as their preferred contact method, the user implicitly consents to receiving an SMS and acknowledges any carrier messaging costs. No additional permission step is needed.
- `PHONE` — the user has only indicated they want a phone call. Sending them an SMS confirmation is an assumption that they also accept texts and may incur a cost. **Future work:** before texting PHONE users, we should add an explicit opt-in (e.g. a checkbox: "Also send me a text confirmation") to obtain consent. For now, this plan sends the SMS for both PHONE and TEXT, but this should be revisited before production.

| Contact Method | Backend action | Confirmation page shows |
|---|---|---|
| `EMAIL` | Send confirmation email (already done) | "A confirmation email has been sent to [email]" (already done) |
| `TEXT` | Send confirmation SMS → SmsService | "A confirmation text has been sent to [phone]" |
| `PHONE` | Send confirmation SMS → SmsService | "We will give you a call at [phone]" |

## Full Integration Flow

```
Frontend (interest-form-page.tsx:192) passes { email, phone, contactMethod, language } to navigate()
  → ConfirmationPage reads state and shows the right message per contactMethod
  → POST /api/interests (interest-routes.ts:34)
    → InterestService.submitInterest() (interestService.ts:37)
      → [existing] contactMethod === 'EMAIL' → sendConfirmationEmail() → EmailService.sendEmail()
      → [NEW]      contactMethod === 'TEXT' || 'PHONE' → sendConfirmationSms() → SmsService.sendSms()
```

## Critical Files
| File | Change |
|------|--------|
| `backend/src/service/smsService.ts` | **Create** — new service |
| `backend/src/service/interestService.ts` | **Modify** — initialize & call SmsService |
| `backend/tests/service/smsService.test.ts` | **Create** — unit tests |
| `backend/package.json` | Add `twilio` dependency |
| `backend/.env` + `backend/.env.example` | Add Twilio env vars |
| `frontend/src/pages/family/interest-form-page.tsx` | **Modify** — pass `phone` + `contactMethod` to navigate() (line 192) |
| `frontend/src/pages/family/confirmation-page.tsx` | **Modify** — show phone confirmation message for PHONE/TEXT |

---

## Implementation Steps

### 1. Install Twilio SDK
```
yarn workspace backend add twilio
```
(Twilio ships its own types — no `@types/twilio` needed.)

### 2. Create `backend/src/service/smsService.ts`

Mirrors `emailService.ts` structure exactly:

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

### 3. Modify `backend/src/service/interestService.ts`

**a) Import SmsService** alongside EmailService import.

**b) Add `smsService` field and initialize in constructor** (mirroring emailService try/catch pattern, lines 25–34):
```ts
private readonly smsService?: SmsService;

// inside constructor:
try {
  this.smsService = new SmsService();
} catch {
  // SMS not configured — silently skip
}
```

**c) Trigger SMS in `submitInterest()`** after the existing email block (~line 55):
```ts
const wantsSms = data.contactMethod === 'TEXT' || data.contactMethod === 'PHONE';
if (data.contactPhone && wantsSms && this.smsService) {
  await this.sendConfirmationSms(data.contactPhone, data.contactMethod, data.preferredLanguage, interest);
}
```

**d) Add private `sendConfirmationSms()` method** — body differs by method and language:
```ts
private async sendConfirmationSms(
  phone: string,
  contactMethod: string,
  language: string | undefined,
  interest: Interest,
) {
  const isSpanish = language === 'es';
  const isText = contactMethod === 'TEXT';

  const body = isSpanish
    ? isText
      ? `Gracias por su interés en el programa CEE. Hemos recibido su solicitud y nos pondremos en contacto con usted pronto por mensaje de texto.`
      : `Gracias por su interés en el programa CEE. Hemos recibido su solicitud y le llamaremos pronto.`
    : isText
      ? `Thank you for your interest in the CEE program. We received your request and will follow up with you by text soon.`
      : `Thank you for your interest in the CEE program. We received your request and will give you a call soon.`;

  await this.smsService!.sendSms({ to: phone, body });
}
```

### 4. Modify `frontend/src/pages/family/interest-form-page.tsx`

**Line 192** — pass `phone` and `contactMethod` in the navigation state alongside `email`:
```ts
navigate('/confirmation', {
  state: { email: email || undefined, phone: phone || undefined, contactMethod, language },
});
```

### 5. Modify `frontend/src/pages/family/confirmation-page.tsx`

**a) Update translations** — add `textSent` and `phoneSent` keys to both `en` and `es`:
```ts
en: {
  // ...existing keys...
  textSent: 'A confirmation text has been sent to',
  phoneSent: 'We will give you a call at',
},
es: {
  // ...existing keys...
  textSent: 'Se ha enviado un mensaje de confirmacion a',
  phoneSent: 'Le llamaremos al',
},
```

**b) Update state type** (line 39) to include `phone` and `contactMethod`:
```ts
const state = location.state as {
  email?: string;
  phone?: string;
  contactMethod?: 'EMAIL' | 'PHONE' | 'TEXT';
  language?: 'en' | 'es';
} | null;
const phone = state?.phone;
const contactMethod = state?.contactMethod;
```

**c) Replace the email-only block** (lines 57–61) with contact-method-aware rendering:
```tsx
{contactMethod === 'EMAIL' && email && (
  <p className="margin-bottom-3">
    {t.emailSent} <strong>{email}</strong>
  </p>
)}
{contactMethod === 'TEXT' && phone && (
  <p className="margin-bottom-3">
    {t.textSent} <strong>{phone}</strong>
  </p>
)}
{contactMethod === 'PHONE' && phone && (
  <p className="margin-bottom-3">
    {t.phoneSent} <strong>{phone}</strong>
  </p>
)}
```

### 6. Update env files

**`backend/.env.example`** — add after `EMAIL_SERVICE_API_TOKEN`:
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

### 7. Create `backend/tests/service/smsService.test.ts`

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
1. `yarn workspace backend tsc --noEmit` — no type errors
2. `yarn workspace backend vitest run tests/service/smsService.test.ts` — all 3 unit tests pass
3. Submit the interest form selecting **Text** → confirmation page shows "A confirmation text has been sent to [phone]" and Twilio delivers SMS
4. Submit selecting **Phone** → confirmation page shows "We will give you a call at [phone]" and Twilio delivers SMS
5. Submit selecting **Email** → existing behavior unchanged
