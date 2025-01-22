import { PrismaClient } from "@prisma/client";

export enum PrismaError {
    UNIQUE_CONSTRAINT_VIOLATION = "P2002",
    RECORD_NOT_FOUND = "P2001",
    REQUIRED_RECORD_NOT_FOUND = "P2025"
}

export const prisma = new PrismaClient();
