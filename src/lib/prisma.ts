import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined,
  pool: Pool | undefined 
};

// Configure robust connection pooling to prevent exhaustion under >5 concurrent users
const pool = globalForPrisma.pool ?? new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Strict maximum connection limit
  idleTimeoutMillis: 30000, // Closes idle connections after 30s
  connectionTimeoutMillis: 2000 // Fails fast to keep app responsive
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
