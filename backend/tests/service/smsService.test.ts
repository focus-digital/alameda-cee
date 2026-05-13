import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SmsService } from '@/service/smsService.js';

const mockCreate = vi.fn().mockResolvedValue({ sid: 'SM123' });

vi.mock('twilio', () => ({
  default: vi.fn(() => ({
    messages: { create: mockCreate },
  })),
}));

const baseEnv = {
  TWILIO_ACCOUNT_SID: 'ACtest',
  TWILIO_AUTH_TOKEN: 'authtest',
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
      to: '+19999999999',
      body: 'Hello',
    });
  });
});
