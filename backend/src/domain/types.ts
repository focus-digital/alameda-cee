import type { UserRole, LeaveType, ApplicationStatus } from "./enums.js";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export type Application = {
  id: string;
  userId: string;
  leaveType: LeaveType;
  status: ApplicationStatus;
  startDate: Date;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
