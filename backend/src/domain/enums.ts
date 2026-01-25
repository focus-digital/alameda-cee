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
