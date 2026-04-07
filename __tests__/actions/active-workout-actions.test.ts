import { startOrResumeWorkout } from '@/app/actions/active-workout-actions';
import { getServerSession } from 'next-auth';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/lib/prisma', () => {
  const { prismaMock } = jest.requireActual('../../__mocks__/prismaMock');
  return { prisma: prismaMock };
});

const { prismaMock } = jest.requireActual('../../__mocks__/prismaMock');

describe('active-workout-actions - startOrResumeWorkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws when unauthenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    await expect(startOrResumeWorkout('plan-1')).rejects.toThrow('Not authenticated');
  });

  it('starts workout with empty exercises safely', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
    prismaMock.activeWorkout.findUnique.mockResolvedValue(null);
    prismaMock.workoutPlan.findUnique.mockResolvedValue({
      id: 'plan-1',
      name: 'Plan',
      userId: 'user-1',
      planExercises: [],
    });
    prismaMock.activeWorkout.create.mockResolvedValue({ id: 'active-1', state: { exercises: [] } });

    const res = await startOrResumeWorkout('plan-1');

    expect(res.success).toBe(true);
    expect((res.activeWorkout.state as any).exercises).toHaveLength(0);
    expect(prismaMock.activeWorkout.create).toHaveBeenCalled();
  });

  it('reuses existing active workout for same plan (guards double start)', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
    const existing = { id: 'active-1', workoutPlanId: 'plan-1', state: { exercises: [] } } as any;
    prismaMock.activeWorkout.findUnique.mockResolvedValue(existing);

    const res = await startOrResumeWorkout('plan-1');

    expect(res.success).toBe(true);
    expect(res.activeWorkout).toBe(existing);
    expect(prismaMock.activeWorkout.delete).not.toHaveBeenCalled();
    expect(prismaMock.activeWorkout.create).not.toHaveBeenCalled();
  });
});
