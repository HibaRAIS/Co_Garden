import { PrismaClient } from '@prisma/client';

/**
 * Instance unique de Prisma Client pour l'application
 * Utilisée pour toutes les opérations de base de données
 */
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});

/**
 * Tester la connexion à la base de données
 */
export const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connection established successfully (Prisma).');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

/**
 * Déconnecter Prisma proprement
 */
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

export default prisma;
