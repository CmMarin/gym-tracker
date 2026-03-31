import { GET } from '@/app/api/exercises/route';
import { getServerSession } from 'next-auth';

jest.mock('next/server', () => ({
  __esModule: true,
  NextResponse: {
    json: (data: any, init?: ResponseInit) => ({ status: init?.status ?? 200, json: async () => data }),
  },
}));
jest.mock('next/cache', () => ({ __esModule: true, unstable_cache: (fn: any) => fn }));
jest.mock('@/lib/prisma', () => {
  const { prismaMock } = jest.requireActual('../../__mocks__/prismaMock');
  return { prisma: prismaMock };
});
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));

const { prismaMock } = jest.requireActual('../../__mocks__/prismaMock');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('exercises API', () => {
  it('returns 401 when unauthorized', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
  });

  it('returns cached exercises for authenticated user', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
    prismaMock.exercise.findMany.mockResolvedValue([{ id: 'e1', name: 'Squat' }]);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual([{ id: 'e1', name: 'Squat' }]);
    expect(prismaMock.exercise.findMany).toHaveBeenCalled();
  });
});
