import { createCoopSession, joinCoopSession } from '@/app/actions/coop-actions';
import { getServerSession } from 'next-auth';
import { broadcastToUsers } from '@/lib/server-push';

jest.mock('@/lib/prisma', () => {
  const { prismaMock } = jest.requireActual('../../__mocks__/prismaMock');
  return { prisma: prismaMock };
});
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/server-push', () => ({ broadcastToUsers: jest.fn() }));

const { prismaMock } = jest.requireActual('../../__mocks__/prismaMock');

const mockSession = { user: { id: 'user-1', name: 'Alice' } } as any;

beforeEach(() => {
  jest.clearAllMocks();
  (getServerSession as jest.Mock).mockResolvedValue(mockSession);
});

describe('createCoopSession', () => {
  it('throws when unauthenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    await expect(createCoopSession('plan-1')).rejects.toThrow('Not authenticated');
  });

  it('creates a coop session when plan exists', async () => {
    prismaMock.workoutPlan.findUnique.mockResolvedValue({ id: 'plan-1', name: 'Plan 1' });
    prismaMock.coopSession.create.mockResolvedValue({ id: 'coop-1', inviteCode: 'ABC123' });

    const res = await createCoopSession('plan-1');

    expect(res.success).toBe(true);
    expect(res.sessionId).toBe('coop-1');
    expect(prismaMock.coopSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          members: expect.objectContaining({
            create: expect.objectContaining({ userId: 'user-1' }),
          }),
        }),
      }),
    );
  });

  it('throws when plan is not found', async () => {
    prismaMock.workoutPlan.findUnique.mockResolvedValue(null);

    await expect(createCoopSession('missing')).rejects.toThrow('Plan not found');
  });
});

describe('joinCoopSession', () => {
  it('throws when unauthenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    await expect(joinCoopSession('CODE')).rejects.toThrow('Not authenticated');
  });

  it('throws on invalid or inactive session', async () => {
    prismaMock.coopSession.findUnique.mockResolvedValue({ status: 'INACTIVE' });

    await expect(joinCoopSession('BADCODE')).rejects.toThrow('Invalid or expired invite code');
  });

  it('does not duplicate membership if already joined', async () => {
    prismaMock.coopSession.findUnique.mockResolvedValue({ id: 'coop-1', status: 'ACTIVE' });
    prismaMock.coopSessionMember.findUnique.mockResolvedValue({ sessionId: 'coop-1', userId: 'user-1' });

    const res = await joinCoopSession('GOOD');

    expect(res.success).toBe(true);
    expect(prismaMock.coopSessionMember.create).not.toHaveBeenCalled();
  });

  it('adds member and broadcasts when joining fresh session', async () => {
    prismaMock.coopSession.findUnique.mockResolvedValue({ id: 'coop-1', status: 'ACTIVE' });
    prismaMock.coopSessionMember.findUnique.mockResolvedValue(null);
    prismaMock.coopSessionMember.create.mockResolvedValue({});
    prismaMock.coopSessionMember.findMany.mockResolvedValue([]);

    const res = await joinCoopSession('GOOD');

    expect(res.success).toBe(true);
    expect(prismaMock.coopSessionMember.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ sessionId: 'coop-1', userId: 'user-1' }) }),
    );
    expect(broadcastToUsers).not.toHaveBeenCalled();
  });
});
