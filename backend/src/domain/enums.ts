export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN"
}

export enum LeaveType {
  ChildBirthRecovery = "ChildBirthRecovery",
  ChildBirthBonding = "ChildBirthBonding",
  AdoptionBonding = "AdoptionBonding",
  FosterCareBonding = "FosterCareBonding",
  SeriousIllness = "SeriousIllness",
  SeriousSurgery = "SeriousSurgery",
  Caregiver = "Caregiver",
  MilitaryCaregiver = "MilitaryCaregiver",
}

export enum ApplicationStatus {
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  DENIED = "DENIED",
  WITHDRAWN = "WITHDRAWN",
}

// == CEE Enums ==

export enum ProviderType {
  FAMILY_CHILD_CARE = "FAMILY_CHILD_CARE",
  CENTER_BASED = "CENTER_BASED",
}

export enum CareType {
  FULL_DAY = "FULL_DAY",
  PART_DAY = "PART_DAY",
  BEFORE_AFTER_SCHOOL = "BEFORE_AFTER_SCHOOL",
  DROP_IN = "DROP_IN",
}

export enum InterestStatus {
  NEW = "NEW",
  IN_PROGRESS = "IN_PROGRESS",
  CONTACTED = "CONTACTED",
  CLOSED = "CLOSED",
}

export enum ContactMethod {
  PHONE = "PHONE",
  EMAIL = "EMAIL",
  TEXT = "TEXT",
}

export enum PreferredLanguage {
  ENGLISH = "ENGLISH",
  SPANISH = "SPANISH",
}

export enum AgeRange {
  INFANT = "INFANT",
  TODDLER = "TODDLER",
  PRESCHOOL = "PRESCHOOL",
  SCHOOL_AGE = "SCHOOL_AGE",
}
