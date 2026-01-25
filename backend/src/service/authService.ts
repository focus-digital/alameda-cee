import { randomUUID } from 'node:crypto';

import bcrypt from 'bcryptjs';

import type { User } from '@/domain/types.js';
import { UserRepo } from '@/repo/userRepo.js';
import type { PrismaClient } from '@prisma/client';

const SESSION_MINUTES = 15
export const SESSION_TTL_MS = SESSION_MINUTES * 60 * 1000;

export class InvalidCredentialsError extends Error {
  constructor(message = 'Invalid credentials') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

type UserSession = {
  token: string;
  user: User;
  createdAt: Date;
};

export class AuthService {
  public userRepo: UserRepo;

  private sessionsByToken = new Map<string, UserSession>();
  private tokenByUserId = new Map<string, string>();

  constructor(prisma: PrismaClient) {
    this.userRepo = new UserRepo(prisma);
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const record = await this.findUser(email);

    const passwordMatches = await bcrypt.compare(password, record.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const existingToken = this.tokenByUserId.get(record.user.id);
    if (existingToken) {
      const session = this.sessionsByToken.get(existingToken);
      if (session && !this.isExpired(session)) {
        session.createdAt = new Date();
        return { token: existingToken, user: session.user };
      }

      this.sessionsByToken.delete(existingToken);
      this.tokenByUserId.delete(record.user.id);
    }

    const token = this.createSession(record.user);
    
    return { token, user: record.user };
  }

  authenticate(token: string): User | undefined {
    const session = this.sessionsByToken.get(token);
    if (!session) {
      return undefined;
    }

    if (this.isExpired(session)) {
      this.sessionsByToken.delete(token);
      this.tokenByUserId.delete(session.user.id);
      return undefined;
    }

    return session.user;
  }

  logout(token: string): void {
    const session = this.sessionsByToken.get(token);
    if (!session) {
      return;
    }

    this.sessionsByToken.delete(token);
    this.tokenByUserId.delete(session.user.id);
  }

  static async hashPassword(password: string): Promise<string> {
    const normalizedPassword = password.trim();
    if (!normalizedPassword) {
      throw new Error('Password is required');
    }

    return bcrypt.hash(normalizedPassword, 12);
  }

  private createSession(user: User): string {
    const token = randomUUID();
    const session: UserSession = {
      token,
      user,
      createdAt: new Date(),
    };

    this.sessionsByToken.set(token, session);
    this.tokenByUserId.set(user.id, token);

    return token;
  }

  private async findUser(
    email: string,
  ): Promise<{ user: User; passwordHash: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new InvalidCredentialsError();
    }

    const record = await this.userRepo.fetchByEmailWithPassword(normalizedEmail);

    if (!record) {
      throw new InvalidCredentialsError();
    }

    return record;
  }

  private isExpired(session: UserSession): boolean {
    return Date.now() - session.createdAt.getTime() >= SESSION_TTL_MS;
  }
}