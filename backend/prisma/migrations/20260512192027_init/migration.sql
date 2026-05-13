-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNDER_REVIEW',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "descriptionEn" TEXT,
    "descriptionEs" TEXT,
    "acceptsSubsidy" BOOLEAN NOT NULL DEFAULT true,
    "ageRangesServed" TEXT NOT NULL,
    "careTypesOffered" TEXT NOT NULL,
    "serviceAttributes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Interest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerId" TEXT NOT NULL,
    "householdZipCode" TEXT,
    "childAgeRange" TEXT,
    "careTypePreference" TEXT,
    "householdSize" INTEGER,
    "incomeRange" TEXT,
    "desiredStartDate" DATETIME,
    "eligibilityIndicator" TEXT,
    "contactMethod" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'ENGLISH',
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Interest_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterestNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interestId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InterestNote_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Application_userId_idx" ON "Application"("userId");

-- CreateIndex
CREATE INDEX "Provider_zipCode_idx" ON "Provider"("zipCode");

-- CreateIndex
CREATE INDEX "Provider_type_idx" ON "Provider"("type");

-- CreateIndex
CREATE INDEX "Provider_isActive_idx" ON "Provider"("isActive");

-- CreateIndex
CREATE INDEX "Interest_providerId_idx" ON "Interest"("providerId");

-- CreateIndex
CREATE INDEX "Interest_status_idx" ON "Interest"("status");

-- CreateIndex
CREATE INDEX "Interest_isComplete_idx" ON "Interest"("isComplete");

-- CreateIndex
CREATE INDEX "Interest_submittedAt_idx" ON "Interest"("submittedAt");

-- CreateIndex
CREATE INDEX "InterestNote_interestId_idx" ON "InterestNote"("interestId");
