import { http } from './apiClient';
import type { Application } from '../domain/types';
import type { ApplicationStatus, LeaveType } from '../domain/enums';

export type ApplicationPayload = {
  leaveType: LeaveType;
  startDate: string; // ISO
  endDate?: string | null;
};

export async function getApplications(): Promise<Application[]> {
  const response = await http.get<Application[]>('/applications');
  return response.data;
}

export async function submitApplication(payload: ApplicationPayload): Promise<Application> {
  const response = await http.post<Application>('/applications', payload);
  return response.data;
}

export async function withdrawApplication(id: string): Promise<Application> {
  const response = await http.post<Application>(`/applications/${id}/withdraw`);
  return response.data;
}

export async function adjudicateApplication(id: string, status: ApplicationStatus): Promise<Application> {
  const response = await http.post<Application>(`/applications/${id}/adjudicate`, { status });
  return response.data;
}
