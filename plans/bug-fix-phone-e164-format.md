# Bug Fix: Phone Number E.164 Format Validation

## User Story
As a family submitting the interest form with a phone/text contact method, I want the system to accept common US phone number formats (e.g., `(510) 555-1234`, `510-555-1234`) so that my confirmation SMS is delivered even if I don't type the number in a specific format.

## Context
Twilio requires phone numbers in E.164 format (e.g., `+15105551234`). The current app accepts any string in the phone field, passes it through without any formatting, and feeds it directly to Twilio. When a user types `(510) 555-1234`, the Twilio call fails silently — the interest is saved but the confirmation SMS is never delivered. There is no validation on the frontend either to guide the user.

**Fix strategy:**
- **Backend (safest fix):** Normalize US phone numbers to E.164 inside `smsService.ts` before calling Twilio. Strip all non-digit characters; if the result is 10 digits, prepend `+1`.
- **Frontend:** Add client-side format validation with a helpful error message before the user submits, so they can correct obvious mistakes immediately.

## Integration Flow
```
User types phone → Frontend validates format → POST /api/interests
  → interestService.submitInterest()
    → smsService.sendSms({ to: phone })
      → [NEW] normalizePhone(phone) → E.164 string
      → twilio.messages.create({ to: "+1...", body })
```

## Critical Files

| File | Change |
|---|---|
| `backend/src/service/smsService.ts` | Add `normalizePhone()` helper; call it before Twilio |
| `backend/tests/service/smsService.test.ts` | Add tests for `normalizePhone` behavior |
| `frontend/src/pages/family/interest-form-page.tsx` | Add `phoneInvalidFormat` translation key; validate format in `handleSubmit` |

## Implementation Steps

### 1. Normalize Phone in SMS Service (Backend)
**File:** `backend/src/service/smsService.ts`

Add a `normalizePhone` helper before the class and call it in `sendSms`:

```ts
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return raw; // return as-is and let Twilio surface the error
}

export class SmsService {
  // ... (constructor unchanged)

  async sendSms(payload: SendSmsPayload) {
    const { to, body } = payload;
    return this.client.messages.create({ from: this.from, to: normalizePhone(to), body });
  }
}
```

### 2. Update SMS Service Tests
**File:** `backend/tests/service/smsService.test.ts`

Add a `describe` block for `normalizePhone` and update the existing send test. The test file uses `vitest` with `vi.mock` for Twilio (existing pattern):

```ts
// Add after the existing 'sends an SMS with correct params' test:

describe('normalizePhone (via sendSms)', () => {
  it('normalizes a 10-digit number to E.164', async () => {
    const svc = new SmsService(baseEnv);
    await svc.sendSms({ to: '5105551234', body: 'Hi' });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ to: '+15105551234' }));
  });

  it('normalizes (510) 555-1234 format to E.164', async () => {
    const svc = new SmsService(baseEnv);
    await svc.sendSms({ to: '(510) 555-1234', body: 'Hi' });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ to: '+15105551234' }));
  });

  it('normalizes 510-555-1234 format to E.164', async () => {
    const svc = new SmsService(baseEnv);
    await svc.sendSms({ to: '510-555-1234', body: 'Hi' });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ to: '+15105551234' }));
  });

  it('normalizes 11-digit number starting with 1 to E.164', async () => {
    const svc = new SmsService(baseEnv);
    await svc.sendSms({ to: '15105551234', body: 'Hi' });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ to: '+15105551234' }));
  });

  it('passes through an already-valid E.164 number unchanged', async () => {
    const svc = new SmsService(baseEnv);
    await svc.sendSms({ to: '+15105551234', body: 'Hi' });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ to: '+15105551234' }));
  });

  it('passes through an unrecognized format as-is', async () => {
    const svc = new SmsService(baseEnv);
    await svc.sendSms({ to: '510', body: 'Hi' });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ to: '510' }));
  });
});
```

### 3. Add Frontend Phone Format Validation
**File:** `frontend/src/pages/family/interest-form-page.tsx`

**Step A** — Add `phoneInvalidFormat` to both translation objects (lines 19–83):

```tsx
// In en translations (after phoneRequired):
phoneInvalidFormat: 'Please enter a valid 10-digit US phone number.',

// In es translations (after phoneRequired):
phoneInvalidFormat: 'Por favor ingrese un número de teléfono válido de 10 dígitos.',
```

**Step B** — Add a format check in `handleSubmit` after the existing `!phone` check (lines 163–166):

```tsx
if ((contactMethod === ContactMethod.PHONE || contactMethod === ContactMethod.TEXT) && !phone) {
  setValidationError(t.phoneRequired);
  return;
}

// NEW: validate format — accept 10 digits (with any separators) or E.164
const digits = phone.replace(/\D/g, '');
const validLength = digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
if ((contactMethod === ContactMethod.PHONE || contactMethod === ContactMethod.TEXT) && !validLength) {
  setValidationError(t.phoneInvalidFormat);
  return;
}
```

## Verification
1. Run backend tests: `cd backend && npm test`
   - All new `normalizePhone` tests should pass
2. Run frontend type check: `cd frontend && npm run typecheck`
3. Start dev server and submit the interest form using phone/text contact method with these inputs — all should pass validation:
   - `(510) 555-1234`
   - `510-555-1234`
   - `510.555.1234`
   - `5105551234`
   - `+15105551234`
4. These inputs should show the format validation error:
   - `510` (too short)
   - `abc`
   - blank handled by existing `phoneRequired` check
5. If Twilio is configured in `.env`, confirm the SMS is actually delivered for a real number in each of the valid formats above.
