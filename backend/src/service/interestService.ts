import { ContactMethod, InterestStatus, PreferredLanguage } from "@/domain/enums.js";
import type { Interest, InterestNote, User } from "@/domain/types.js";
import { InterestRepo, type InterestCreate } from "@/repo/interestRepo.js";
import { EmailService } from "./emailService.js";
import { SmsService } from "./smsService.js";
import type { PrismaClient } from "@prisma/client";

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class InterestService {
  public interestRepo: InterestRepo;
  private emailService: EmailService | null = null;
  private smsService: SmsService | null = null;

  constructor(prisma: PrismaClient) {
    this.interestRepo = new InterestRepo(prisma);

    // Initialize email service if configured
    try {
      this.emailService = new EmailService();
    } catch {
      console.warn("Email service not configured - confirmation emails will be skipped");
    }

    // Initialize SMS service if configured
    try {
      this.smsService = new SmsService();
    } catch {
      console.warn("SMS service not configured - confirmation texts will be skipped");
    }
  }

  // Public: Submit interest (no auth required)
  async submitInterest(data: InterestCreate): Promise<Interest> {
    // Calculate completeness
    const isComplete = !!(
      data.contactMethod &&
      (data.contactPhone || data.contactEmail) &&
      data.householdZipCode &&
      data.childAgeRange
    );

    const interest = await this.interestRepo.create({
      ...data,
      status: InterestStatus.NEW,
      isComplete,
    });

    // Send confirmation email if email is provided and service is configured
    if (data.contactEmail && this.emailService) {
      await this.sendConfirmationEmail(data.contactEmail, data.preferredLanguage, interest);
    }

    // Send confirmation SMS for phone/text contact methods
    if (
      data.contactPhone &&
      this.smsService &&
      (data.contactMethod === ContactMethod.TEXT || data.contactMethod === ContactMethod.PHONE)
    ) {
      await this.sendConfirmationSms(data.contactPhone, data.contactMethod, data.preferredLanguage);
    }

    return interest;
  }

  // Admin: Get all interests
  async getInterests(user: User): Promise<Interest[]> {
    if (user.role !== "ADMIN") {
      throw new ForbiddenError("Only admins can view interests");
    }
    return this.interestRepo.listAll();
  }

  // Admin: Get interests by status
  async getInterestsByStatus(user: User, status: InterestStatus): Promise<Interest[]> {
    if (user.role !== "ADMIN") {
      throw new ForbiddenError("Only admins can view interests");
    }
    return this.interestRepo.listByStatus(status);
  }

  // Admin: Get interest by ID
  async getInterestById(user: User, id: string): Promise<Interest> {
    if (user.role !== "ADMIN") {
      throw new ForbiddenError("Only admins can view interest details");
    }
    const interest = await this.interestRepo.fetchById(id, true, true);
    if (!interest) {
      throw new NotFoundError("Interest not found");
    }
    return interest;
  }

  // Admin: Update status
  async updateStatus(user: User, id: string, status: InterestStatus): Promise<Interest> {
    if (user.role !== "ADMIN") {
      throw new ForbiddenError("Only admins can update interest status");
    }
    const existing = await this.interestRepo.fetchById(id);
    if (!existing) {
      throw new NotFoundError("Interest not found");
    }
    return this.interestRepo.updateStatus(id, status);
  }

  // Admin: Add note
  async addNote(user: User, interestId: string, content: string): Promise<InterestNote> {
    if (user.role !== "ADMIN") {
      throw new ForbiddenError("Only admins can add notes");
    }
    const existing = await this.interestRepo.fetchById(interestId);
    if (!existing) {
      throw new NotFoundError("Interest not found");
    }
    return this.interestRepo.addNote(interestId, user.id, content);
  }

  // Admin: Export interests for CSV
  async exportInterests(user: User): Promise<Interest[]> {
    if (user.role !== "ADMIN") {
      throw new ForbiddenError("Only admins can export interests");
    }
    return this.interestRepo.listAll(true);
  }

  private async sendConfirmationSms(
    phone: string,
    contactMethod: ContactMethod,
    language: PreferredLanguage = PreferredLanguage.ENGLISH
  ): Promise<void> {
    if (!this.smsService) return;

    const isSpanish = language === PreferredLanguage.SPANISH;
    const isText = contactMethod === ContactMethod.TEXT;

    const body = isSpanish
      ? isText
        ? "Gracias por su interés en el programa CEE. Hemos recibido su solicitud y nos pondremos en contacto con usted pronto por mensaje de texto."
        : "Gracias por su interés en el programa CEE. Hemos recibido su solicitud y le llamaremos pronto."
      : isText
        ? "Thank you for your interest in the CEE program. We received your request and will follow up with you by text soon."
        : "Thank you for your interest in the CEE program. We received your request and will give you a call soon.";

    try {
      await this.smsService.sendSms({ to: phone, body });
    } catch (error) {
      console.error("Failed to send confirmation SMS:", error);
      // Don't throw - SMS failure shouldn't block interest submission
    }
  }

  private async sendConfirmationEmail(
    email: string,
    language: PreferredLanguage = PreferredLanguage.ENGLISH,
    interest: Interest
  ): Promise<void> {
    if (!this.emailService) return;

    const isSpanish = language === PreferredLanguage.SPANISH;

    const subject = isSpanish
      ? "Confirmación de su interés en cuidado infantil"
      : "Confirmation of Your Child Care Interest";

    const providerName = interest.provider?.name ?? "the provider";

    const html = isSpanish
      ? `
        <h1>Gracias por expresar su interés</h1>
        <p>Hemos recibido su solicitud de interés en <strong>${providerName}</strong>.</p>
        <h2>Próximos pasos</h2>
        <ul>
          <li>Un administrador de subsidios revisará su solicitud</li>
          <li>Se comunicarán con usted para discutir sus opciones y los próximos pasos</li>
          <li>Este formulario de interés <strong>no garantiza elegibilidad, aprobación o inscripción</strong></li>
        </ul>
        <p>Si tiene preguntas, por favor espere a que un administrador se comunique con usted.</p>
        <p><em>Este es un mensaje automatizado del sistema de Elegibilidad y Matrícula Coordinada de First 5 Alameda County.</em></p>
      `
      : `
        <h1>Thank You for Expressing Interest</h1>
        <p>We have received your interest submission for <strong>${providerName}</strong>.</p>
        <h2>What Happens Next</h2>
        <ul>
          <li>A subsidy administrator will review your submission</li>
          <li>They will reach out to discuss your options and next steps</li>
          <li>This interest form <strong>does not guarantee eligibility, approval, or enrollment</strong></li>
        </ul>
        <p>If you have questions, please wait for an administrator to contact you.</p>
        <p><em>This is an automated message from the First 5 Alameda County Coordinated Eligibility & Enrollment system.</em></p>
      `;

    try {
      await this.emailService.sendEmail({
        from: "First 5 Alameda (CEE Demo) <noreply@focus-labs.io>",
        to: email,
        subject,
        html,
      });
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
      // Don't throw - email failure shouldn't block interest submission
    }
  }
}
