import { prismaMock } from '../../__mocks__/prismaMock';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {}
}));

// We only import after the mocks so next-auth doesn't trigger openid-client.
import { finishWorkoutAction } from '@/app/actions/workout-actions';
import { getServerSession } from 'next-auth';

describe('Workout Actions - finishWorkoutAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock user session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' }
    });

    // Mock Prisma standard responses
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1', xp: 500, streakDays: 2 });
    prismaMock.activeWorkout.findUnique.mockResolvedValue({ 
      userId: 'user-1', 
      workoutPlanId: 'plan-1', 
      startTime: new Date(Date.now() - 3600000) // 1 hour ago
    });
    prismaMock.workoutSession.create.mockResolvedValue({ 
      id: 'session-1',
      completedAt: new Date()
    });
    prismaMock.workoutSession.findFirst.mockResolvedValue({
      completedAt: new Date(Date.now() - 7 * 24 * 3600000) // 1 week ago
    });
    prismaMock.user.update.mockResolvedValue({});
    prismaMock.workoutSession.update.mockResolvedValue({});
    prismaMock.activeWorkout.delete.mockResolvedValue({});
    prismaMock.setLog.create.mockResolvedValue({});
  });

  it('calculates correct XP and detects PR for a normal session', async () => {
    // History: Max weight was 100x10
    prismaMock.setLog.findMany.mockResolvedValue([
      { weight: 100, reps: 10, createdAt: new Date(Date.now() - 86400000) } // Yesterday
    ]);

    const workoutData = {
      exercises: [
        {
          id: 'ex-1',
          name: 'Bench Press',
          sets: [
            // A warm up set
            { completed: true, weight: '60', reps: '10', isWarmup: true },
            // A PR set: 105x5
            { completed: true, weight: '105', reps: '5', isWarmup: false },
          ]
        }
      ]
    };

    const result = await finishWorkoutAction(workoutData);

    // Initial 100 XP
    // Warmup: +5 XP
    // PR: +50 XP
    // Total should be 155
    expect(result.xpEarned).toBe(155);
    expect(result.prs).toContain('Bench Press');
    
    // Check if the setLogs were created correctly
    expect(prismaMock.setLog.create).toHaveBeenCalledTimes(2);
    expect(prismaMock.setLog.create).toHaveBeenNthCalledWith(1, expect.objectContaining({
      data: expect.objectContaining({ weight: 60, reps: 10, isWarmup: true, isPR: false })
    }));
    expect(prismaMock.setLog.create).toHaveBeenNthCalledWith(2, expect.objectContaining({
      data: expect.objectContaining({ weight: 105, reps: 5, isWarmup: false, isPR: true })
    }));
  });

  it('applies regression penalty if lifted less than previous session', async () => {
    // History: Max weight last session was 100x10
    const yesterday = new Date(Date.now() - 86400000);
    prismaMock.setLog.findMany.mockResolvedValue([
      { weight: 100, reps: 10, createdAt: yesterday }
    ]);

    const workoutData = {
      exercises: [
        {
          id: 'ex-1',
          name: 'Bench Press',
          sets: [
            // Only lifted 90x10 this time
            { completed: true, weight: '90', reps: '10', isWarmup: false },
          ]
        }
      ]
    };

    const result = await finishWorkoutAction(workoutData);

    // Baseline 100 XP
    // +10 XP for normal set
    // -20 XP for regression penalty
    // Total = 90 XP
    expect(result.xpEarned).toBe(90);
  });
});