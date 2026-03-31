export const prismaMock = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  activeWorkout: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
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
    groupBy: jest.fn(),
  },
  userAchievement: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  workoutPlan: {
    findUnique: jest.fn(),
  },
  exercise: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  coopSession: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  coopSessionMember: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  customExercise: {
    findMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
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
  revalidateTag: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));
