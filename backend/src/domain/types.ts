import type {
  UserRole,
  LeaveType,
  ApplicationStatus,
  ProviderType,
  CareType,
  InterestStatus,
  ContactMethod,
  PreferredLanguage,
  AgeRange,
} from "./enums.js";

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

// == CEE Types ==

export type Provider = {
  id: string;
  name: string;
  type: ProviderType;
  address: string;
  city: string;
  zipCode: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  descriptionEn?: string | null;
  descriptionEs?: string | null;
  acceptsSubsidy: boolean;
  ageRangesServed: AgeRange[];
  careTypesOffered: CareType[];
  serviceAttributes?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Interest = {
  id: string;
  providerId: string;
  provider?: Provider;
  householdZipCode?: string | null;
  childAgeRange?: AgeRange | null;
  careTypePreference?: CareType | null;
  householdSize?: number | null;
  incomeRange?: string | null;
  desiredStartDate?: Date | null;
  eligibilityIndicator?: string | null;
  contactMethod?: ContactMethod | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  preferredLanguage: PreferredLanguage;
  notes?: string | null;
  status: InterestStatus;
  isComplete: boolean;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  adminNotes?: InterestNote[];
};

export type InterestNote = {
  id: string;
  interestId: string;
  authorId: string;
  content: string;
  createdAt: Date;
};
