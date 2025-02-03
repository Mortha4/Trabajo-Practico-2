import { CardSeason, PrismaClient } from "@prisma/client";

export enum PrismaError {
    UNIQUE_CONSTRAINT_VIOLATION = "P2002",
    RECORD_NOT_FOUND = "P2001",
    REQUIRED_RECORD_NOT_FOUND = "P2025",
    FOREIGN_KEY_CONSTRAINT_VIOLATION = "P2003",
}

export enum SecurityScopes {
    Self = "Self", /// The user must be the owner of the requested resource
    Admin = "Admin", /// The user must have administrator privileges
}

export const prisma = new PrismaClient();

export function formatSeason(season: CardSeason) {
    return `${season.slice(0, "Season".length)} ${season.slice("Season".length)}`;
}

export function recoverSeason(formattedSeason: string) {
    return formattedSeason.replace(" ", "");
}
