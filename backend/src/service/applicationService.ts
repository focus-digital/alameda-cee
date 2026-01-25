import { ApplicationStatus } from '@/domain/enums.js';
import type { Application, User } from '@/domain/types.js';
import { ApplicationRepo, type ApplicationCreate } from '@/repo/applicationRepo.js';
import type { PrismaClient } from '@prisma/client';

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ApplicationService {
  public applicationRepo: ApplicationRepo;

  constructor(prisma: PrismaClient) {
    this.applicationRepo = new ApplicationRepo(prisma);
  }

  async submit(user: User, payload: Omit<ApplicationCreate, 'userId' | 'status'>): Promise<Application> {
    return this.applicationRepo.create({
      ...payload,
      userId: user.id,
      status: ApplicationStatus.UNDER_REVIEW,
    });
  }

  async getApplications(user: User): Promise<Application[]> {
    if (user.role === 'ADMIN') {
      return this.applicationRepo.listAll();
    }

    return this.applicationRepo.listByUserId(user.id);
  }

  async withdraw(user: User, applicationId: string): Promise<Application> {
    const existing = await this.applicationRepo.fetchById(applicationId);
    if (!existing) {
      throw new NotFoundError('Application not found');
    }
    if (existing.userId !== user.id) {
      throw new ForbiddenError('Cannot withdraw another user’s application');
    }

    return this.applicationRepo.updateStatus(applicationId, ApplicationStatus.WITHDRAWN);
  }

  async adjudicate(user: User, applicationId: string, status: ApplicationStatus): Promise<Application> {
    const existing = await this.applicationRepo.fetchById(applicationId);
    if (!existing) {
      throw new NotFoundError('Application not found');
    }

    return this.applicationRepo.updateStatus(applicationId, status);
  }
}
