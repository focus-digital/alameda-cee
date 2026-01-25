import type { ApplicationStatus, LeaveType, UserRole } from "./enums";

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
  startDate: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}
