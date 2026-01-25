import type { ApplicationStatus, LeaveType } from "@/domain/enums.js";
import type { Application } from "@/domain/types.js";
import type { PrismaClient, Application as PrismaApplication } from "@prisma/client";

export type ApplicationCreate = {
  id?: string;
  userId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate?: Date | null;
  status?: ApplicationStatus;
};

export class ApplicationRepo {
  constructor(private prisma: PrismaClient) {}

  async fetchById(id: string): Promise<Application | undefined> {
    const row = await this.prisma.application.findUnique({ where: { id } });
    return row ? ApplicationRepo.toDomain(row) : undefined;
  }

  async listByUserId(userId: string): Promise<Application[]> {
    const rows = await this.prisma.application.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
    return rows.map(ApplicationRepo.toDomain);
  }

  async listByStatus(status: ApplicationStatus): Promise<Application[]> {
    const rows = await this.prisma.application.findMany({
      where: { status },
      orderBy: { startDate: 'desc' },
    });
    return rows.map(ApplicationRepo.toDomain);
  }

  async listAll(): Promise<Application[]> {
    const rows = await this.prisma.application.findMany({
      orderBy: { startDate: 'desc' },
    });
    return rows.map(ApplicationRepo.toDomain);
  }

  async create(createPayload: ApplicationCreate): Promise<Application> {
    const newRow = await this.prisma.application.create({
      data: {
        ...createPayload,
      },
    });

    return ApplicationRepo.toDomain(newRow);
  }

  async updateStatus(id: string, status: ApplicationStatus): Promise<Application> {
    const updated = await this.prisma.application.update({
      where: { id },
      data: { status },
    });
    return ApplicationRepo.toDomain(updated);
  }

  private static toDomain(row: PrismaApplication): Application {
    return {
      ...row,
      status: row.status as ApplicationStatus,
      leaveType: row.leaveType as LeaveType,
    };
  }
}
