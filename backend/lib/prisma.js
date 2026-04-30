import { PrismaClient } from '@prisma/client';

// Instance unique du client Prisma, partagée dans toute l'application
const prisma = new PrismaClient();

export default prisma;