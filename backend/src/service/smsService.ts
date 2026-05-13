import twilio from 'twilio';

export type SendSmsPayload = {
  to: string;
  body: string;
};

export class SmsService {
  private readonly client: ReturnType<typeof twilio>;
  private readonly from: string;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    const accountSid = env.TWILIO_ACCOUNT_SID;
    const authToken = env.TWILIO_AUTH_TOKEN;
    const from = env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !from) {
      throw new Error('Twilio env vars not configured');
    }

    this.client = twilio(accountSid, authToken);
    this.from = from;
  }

  async sendSms(payload: SendSmsPayload) {
    const { to, body } = payload;
    return this.client.messages.create({ from: this.from, to, body });
  }
}
