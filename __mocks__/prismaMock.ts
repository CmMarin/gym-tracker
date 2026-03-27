export const prismaMock = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  activeWorkout: {
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  workoutSession: {
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
  },
  setLog: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));
