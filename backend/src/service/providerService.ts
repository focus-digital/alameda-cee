import type { Provider } from "@/domain/types.js";
import { ProviderRepo, type ProviderFilters, type ProviderCreate } from "@/repo/providerRepo.js";
import type { PrismaClient } from "@prisma/client";

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ProviderService {
  public providerRepo: ProviderRepo;

  constructor(prisma: PrismaClient) {
    this.providerRepo = new ProviderRepo(prisma);
  }

  async getProviders(filters?: ProviderFilters): Promise<Provider[]> {
    return this.providerRepo.listActive(filters);
  }

  async getProviderById(id: string): Promise<Provider> {
    const provider = await this.providerRepo.fetchById(id);
    if (!provider) {
      throw new NotFoundError("Provider not found");
    }
    return provider;
  }

  async createProvider(data: ProviderCreate): Promise<Provider> {
    return this.providerRepo.create(data);
  }
}
