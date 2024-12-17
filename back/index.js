import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const allUsers = await prisma.user.findMany();
console.log(allUsers);

await prisma.$disconnect();
