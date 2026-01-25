import { Prisma } from "@prisma/client";

export const prismaDecimalToNumber = (value: Prisma.Decimal | number): number =>
  value instanceof Prisma.Decimal ? value.toNumber() : value;

export const prismaDecimalToOptionalNumber = (
  value: Prisma.Decimal | number | null | undefined,
): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  return prismaDecimalToNumber(value);
};

export const toPrismaDecimal = (value: number | Prisma.Decimal): Prisma.Decimal =>
  value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value ?? 0);

export const toNullablePrismaDecimal = (
  value: number | Prisma.Decimal | null | undefined,
): Prisma.Decimal | null => {
  if (value === null || value === undefined) {
    return null;
  }

  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
};