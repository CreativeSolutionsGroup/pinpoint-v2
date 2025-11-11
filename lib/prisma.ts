import { PrismaClient } from '@/lib/generated/prisma/client';

// Instantiate Prisma client without persisting to globalThis.
// This removes the global persistence behavior which can cause
// unexpected state across hot reloads or type mismatches with
// dynamic client extension types.
export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Try to connect and report failures early.
prisma.$connect().catch((err) => {
  console.error('Failed to connect to database:', err);
});
