import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SmsService } from '@/service/smsService.js';

// Mock the Twilio library and its client
const mockCreate = vi.fn().mockResolvedValue({ sid: 'SM123' });

// Mock the entire Twilio module to return a client with the mocked create method
vi.mock('twilio', () => ({
  default: vi.fn(() => ({
    messages: { create: mockCreate },
  })),
}));

// Base environment variables for successful SmsService construction
const baseEnv = {
  TWILIO_ACCOUNT_SID: 'ACtest',
  TWILIO_AUTH_TOKEN: 'authtest',
  TWILIO_PHONE_NUMBER: '+10000000000',
};

describe('SmsService', () => {
  // Clear mock call history before each test
  beforeEach(() => mockCreate.mockClear());

  // Test constructor behavior
  describe('constructor', () => {
    
    // Throws when env vars are missing
    it('throws when env vars are missing', () => {
      expect(() => new SmsService({})).toThrow('Twilio env vars not configured');
    });

    // Constructs successfully when env vars are present and does not throw an error
    it('constructs successfully with all env vars', () => {
      expect(() => new SmsService(baseEnv)).not.toThrow();
    });
  });

    // Sends SMS with correct params
  it('sends an SMS with correct params', async () => {
    // Use a fresh instance to ensure constructor runs and sets up the client
    const svc = new SmsService(baseEnv);
    // Call sendSms with test payload
    await svc.sendSms({ to: '+19999999999', body: 'Hello' });

    // Assert that the Twilio client's create method was called with correct params
    expect(mockCreate).toHaveBeenCalledOnce();

    // The from number should come from env, to and body from payload
    expect(mockCreate).toHaveBeenCalledWith({
      from: '+10000000000',
      to: '+19999999999',
      body: 'Hello',
    });
  });
});
