import { http, baseURL } from './apiClient';
import type { Interest, InterestNote } from '../domain/types';
import type {
  InterestStatus,
  ContactMethod,
  PreferredLanguage,
  AgeRange,
  CareType,
} from '../domain/enums';

export type InterestPayload = {
  providerId: string;
  householdZipCode?: string;
  childAgeRange?: AgeRange;
  careTypePreference?: CareType;
  householdSize?: number;
  incomeRange?: string;
  desiredStartDate?: string; // ISO date string
  eligibilityIndicator?: string;
  contactMethod?: ContactMethod;
  contactPhone?: string;
  contactEmail?: string;
  preferredLanguage?: PreferredLanguage;
  notes?: string;
};

// Public API - no auth required
export async function submitInterest(payload: InterestPayload): Promise<Interest> {
  const response = await http.post<Interest>('/interests', payload);
  return response.data;
}

// Admin APIs - auth required
export async function getInterests(status?: InterestStatus): Promise<Interest[]> {
  const url = status ? `/interests?status=${status}` : '/interests';
  const response = await http.get<Interest[]>(url);
  return response.data;
}

export async function getInterestById(id: string): Promise<Interest> {
  const response = await http.get<Interest>(`/interests/${id}`);
  return response.data;
}

export async function updateInterestStatus(id: string, status: InterestStatus): Promise<Interest> {
  const response = await http.post<Interest>(`/interests/${id}/status`, { status });
  return response.data;
}

export async function addInterestNote(id: string, content: string): Promise<InterestNote> {
  const response = await http.post<InterestNote>(`/interests/${id}/notes`, { content });
  return response.data;
}

export function getInterestsExportUrl(): string {
  return `${baseURL}/interests/export`;
}
