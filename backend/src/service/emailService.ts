import { Resend } from 'resend';

export type SendEmailPayload = {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
};

export class EmailService {
  private readonly resend: Resend;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    const apiToken = env.EMAIL_SERVICE_API_TOKEN;
    if (!apiToken) {
      throw new Error('EMAIL_SERVICE_API_TOKEN not configured');
    }

    this.resend = new Resend(apiToken);
  }

  async sendEmail(payload: SendEmailPayload) {
    const { from, to, subject, html, text } = payload;
    if (!html && !text) {
      throw new Error('Email content missing');
    }

    // Resend requires either html or text to be defined (not undefined)
    if (html) {
      return this.resend.emails.send({
        from,
        to,
        subject,
        html,
      });
    }

    return this.resend.emails.send({
      from,
      to,
      subject,
      text: text!,
    });
  }
}