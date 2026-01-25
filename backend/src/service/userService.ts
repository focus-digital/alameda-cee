import type { User } from "@/domain/types.js";
import { UserRepo, type UserCreate } from "@/repo/userRepo.js";
import type { PrismaClient } from "@prisma/client";

export class UserService {
  public userRepo: UserRepo;

  constructor(private prisma: PrismaClient) {
    this.userRepo = new UserRepo(prisma);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.userRepo.fetchById(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.userRepo.fetchByEmail(email);
  }

  async ensureUser(createPayload: UserCreate): Promise<User> {
    const existing = await this.getUserByEmail(createPayload.email);
    if (existing) {
      return existing;
    }

    return this.userRepo.create(createPayload);
  }

  async listUsers(): Promise<User[]> {
    return this.userRepo.fetchAll();
  }
}