import type {
  InterestStatus,
  ContactMethod,
  PreferredLanguage,
  AgeRange,
  CareType,
  ProviderType,
} from "@/domain/enums.js";
import type { Interest, InterestNote, Provider } from "@/domain/types.js";
import type {
  PrismaClient,
  Interest as PrismaInterest,
  InterestNote as PrismaNote,
  Provider as PrismaProvider,
} from "@prisma/client";

export type InterestCreate = {
  providerId: string;
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
  preferredLanguage?: PreferredLanguage;
  notes?: string | null;
  status?: InterestStatus;
  isComplete?: boolean;
};

type PrismaInterestWithRelations = PrismaInterest & {
  provider?: PrismaProvider | null;
  adminNotes?: PrismaNote[];
};

export class InterestRepo {
  constructor(private prisma: PrismaClient) {}

  async fetchById(
    id: string,
    includeProvider = false,
    includeNotes = false
  ): Promise<Interest | undefined> {
    const row = await this.prisma.interest.findUnique({
      where: { id },
      include: { provider: includeProvider, adminNotes: includeNotes },
    });
    return row ? InterestRepo.toDomain(row) : undefined;
  }

  async listAll(includeProvider = true): Promise<Interest[]> {
    const rows = await this.prisma.interest.findMany({
      include: { provider: includeProvider, adminNotes: true },
      orderBy: { submittedAt: "desc" },
    });
    return rows.map(InterestRepo.toDomain);
  }

  async listByStatus(status: InterestStatus): Promise<Interest[]> {
    const rows = await this.prisma.interest.findMany({
      where: { status },
      include: { provider: true, adminNotes: true },
      orderBy: { submittedAt: "desc" },
    });
    return rows.map(InterestRepo.toDomain);
  }

  async create(data: InterestCreate): Promise<Interest> {
    const row = await this.prisma.interest.create({
      data: {
        providerId: data.providerId,
        householdZipCode: data.householdZipCode,
        childAgeRange: data.childAgeRange,
        careTypePreference: data.careTypePreference,
        householdSize: data.householdSize,
        incomeRange: data.incomeRange,
        desiredStartDate: data.desiredStartDate,
        eligibilityIndicator: data.eligibilityIndicator,
        contactMethod: data.contactMethod,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        preferredLanguage: data.preferredLanguage ?? "ENGLISH",
        notes: data.notes,
        status: data.status ?? "NEW",
        isComplete: data.isComplete ?? false,
      },
      include: { provider: true },
    });
    return InterestRepo.toDomain(row);
  }

  async updateStatus(id: string, status: InterestStatus): Promise<Interest> {
    const row = await this.prisma.interest.update({
      where: { id },
      data: { status },
      include: { provider: true, adminNotes: true },
    });
    return InterestRepo.toDomain(row);
  }

  async addNote(
    interestId: string,
    authorId: string,
    content: string
  ): Promise<InterestNote> {
    const row = await this.prisma.interestNote.create({
      data: { interestId, authorId, content },
    });
    return row as InterestNote;
  }

  async getNotesByInterestId(interestId: string): Promise<InterestNote[]> {
    const rows = await this.prisma.interestNote.findMany({
      where: { interestId },
      orderBy: { createdAt: "desc" },
    });
    return rows as InterestNote[];
  }

  private static toDomain(row: PrismaInterestWithRelations): Interest {
    let provider: Provider | undefined;
    if (row.provider) {
      provider = {
        ...row.provider,
        type: row.provider.type as ProviderType,
        ageRangesServed: JSON.parse(row.provider.ageRangesServed) as AgeRange[],
        careTypesOffered: JSON.parse(row.provider.careTypesOffered) as CareType[],
        serviceAttributes: row.provider.serviceAttributes
          ? (JSON.parse(row.provider.serviceAttributes as string) as Record<string, unknown>)
          : null,
      };
    }

    return {
      id: row.id,
      providerId: row.providerId,
      provider,
      householdZipCode: row.householdZipCode,
      childAgeRange: row.childAgeRange as AgeRange | null,
      careTypePreference: row.careTypePreference as CareType | null,
      householdSize: row.householdSize,
      incomeRange: row.incomeRange,
      desiredStartDate: row.desiredStartDate,
      eligibilityIndicator: row.eligibilityIndicator,
      contactMethod: row.contactMethod as ContactMethod | null,
      contactPhone: row.contactPhone,
      contactEmail: row.contactEmail,
      preferredLanguage: row.preferredLanguage as PreferredLanguage,
      notes: row.notes,
      status: row.status as InterestStatus,
      isComplete: row.isComplete,
      submittedAt: row.submittedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      adminNotes: row.adminNotes as InterestNote[] | undefined,
    };
  }
}
