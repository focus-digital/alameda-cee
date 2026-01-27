import type { ProviderType, CareType, AgeRange } from "@/domain/enums.js";
import type { Provider } from "@/domain/types.js";
import type { PrismaClient, Provider as PrismaProvider } from "@prisma/client";

export type ProviderFilters = {
  zipCode?: string;
  type?: ProviderType;
  careTypes?: CareType[];
  ageRanges?: AgeRange[];
  acceptsSubsidy?: boolean;
};

export type ProviderCreate = {
  id?: string;
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
  acceptsSubsidy?: boolean;
  ageRangesServed: AgeRange[];
  careTypesOffered: CareType[];
  serviceAttributes?: Record<string, unknown> | null;
  isActive?: boolean;
};

export class ProviderRepo {
  constructor(private prisma: PrismaClient) {}

  async fetchById(id: string): Promise<Provider | undefined> {
    const row = await this.prisma.provider.findUnique({ where: { id } });
    return row ? ProviderRepo.toDomain(row) : undefined;
  }

  async listActive(filters?: ProviderFilters): Promise<Provider[]> {
    const where: Record<string, unknown> = { isActive: true };

    if (filters?.zipCode) where.zipCode = filters.zipCode;
    if (filters?.type) where.type = filters.type;
    if (filters?.acceptsSubsidy !== undefined) where.acceptsSubsidy = filters.acceptsSubsidy;

    const rows = await this.prisma.provider.findMany({
      where,
      orderBy: { name: "asc" },
    });

    // Filter by careTypes and ageRanges in memory (JSON fields)
    return rows.map(ProviderRepo.toDomain).filter((p) => {
      if (filters?.careTypes?.length) {
        const hasMatch = filters.careTypes.some((ct) => p.careTypesOffered.includes(ct));
        if (!hasMatch) return false;
      }
      if (filters?.ageRanges?.length) {
        const hasMatch = filters.ageRanges.some((ar) => p.ageRangesServed.includes(ar));
        if (!hasMatch) return false;
      }
      return true;
    });
  }

  async listAll(): Promise<Provider[]> {
    const rows = await this.prisma.provider.findMany({
      orderBy: { name: "asc" },
    });
    return rows.map(ProviderRepo.toDomain);
  }

  async create(data: ProviderCreate): Promise<Provider> {
    const row = await this.prisma.provider.create({
      data: {
        ...data,
        ageRangesServed: JSON.stringify(data.ageRangesServed),
        careTypesOffered: JSON.stringify(data.careTypesOffered),
        serviceAttributes: data.serviceAttributes ? JSON.stringify(data.serviceAttributes) : null,
      },
    });
    return ProviderRepo.toDomain(row);
  }

  async update(
    id: string,
    data: Partial<Omit<ProviderCreate, "id">>
  ): Promise<Provider> {
    const updateData: Record<string, unknown> = { ...data };
    if (data.ageRangesServed) {
      updateData.ageRangesServed = JSON.stringify(data.ageRangesServed);
    }
    if (data.careTypesOffered) {
      updateData.careTypesOffered = JSON.stringify(data.careTypesOffered);
    }
    if (data.serviceAttributes !== undefined) {
      updateData.serviceAttributes = data.serviceAttributes
        ? JSON.stringify(data.serviceAttributes)
        : null;
    }

    const row = await this.prisma.provider.update({
      where: { id },
      data: updateData,
    });
    return ProviderRepo.toDomain(row);
  }

  private static toDomain(row: PrismaProvider): Provider {
    return {
      ...row,
      type: row.type as ProviderType,
      ageRangesServed: JSON.parse(row.ageRangesServed) as AgeRange[],
      careTypesOffered: JSON.parse(row.careTypesOffered) as CareType[],
      serviceAttributes: row.serviceAttributes
        ? (JSON.parse(row.serviceAttributes as string) as Record<string, unknown>)
        : null,
    };
  }
}
