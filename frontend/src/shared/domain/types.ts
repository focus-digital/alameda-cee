import type {
  UserRole,
  ProviderType,
  CareType,
  InterestStatus,
  ContactMethod,
  PreferredLanguage,
  AgeRange,
} from "./enums";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}


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
  createdAt: string;
  updatedAt: string;
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
  desiredStartDate?: string | null;
  eligibilityIndicator?: string | null;
  contactMethod?: ContactMethod | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  preferredLanguage: PreferredLanguage;
  notes?: string | null;
  status: InterestStatus;
  isComplete: boolean;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  adminNotes?: InterestNote[];
};

export type InterestNote = {
  id: string;
  interestId: string;
  authorId: string;
  content: string;
  createdAt: string;
};
