import { GET, POST } from '@/app/api/custom-exercises/route';
import { getServerSession } from 'next-auth';

jest.mock('next/server', () => ({
  __esModule: true,
  NextRequest: jest.fn(),
  NextResponse: {
    json: (data: any, init?: ResponseInit) => ({ status: init?.status ?? 200, json: async () => data }),
  },
}));
jest.mock('@/lib/prisma', () => {
  const { prismaMock } = jest.requireActual('../../__mocks__/prismaMock');
  return { prisma: prismaMock };
});
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));

const { prismaMock } = jest.requireActual('../../__mocks__/prismaMock');

const mockSession = { user: { id: 'user-1' } } as any;

beforeEach(() => {
  jest.resetAllMocks();
});

describe('custom-exercises API', () => {
  it('GET returns 401 when unauthorized', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
  });

  it('GET returns user exercises', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    prismaMock.customExercise.findMany.mockResolvedValue([{ id: 'c1', name: 'Curl' }]);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual([{ id: 'c1', name: 'Curl' }]);
  });

  it('POST validates required fields', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const req = { json: async () => ({}) } as any;

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('POST rejects empty targetMuscles', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const req = { json: async () => ({ name: 'Curl', targetMuscles: [] }) } as any;

    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(prismaMock.customExercise.create).not.toHaveBeenCalled();
  });

  it('POST rejects oversized inputs', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const longName = 'A'.repeat(120);
    const req = { json: async () => ({ name: longName, targetMuscles: ['biceps'] }) } as any;

    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(prismaMock.customExercise.create).not.toHaveBeenCalled();
  });

  it('POST rejects duplicate names per user', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    prismaMock.customExercise.findFirst.mockResolvedValue({ id: 'existing' });
    const req = { json: async () => ({ name: 'Curl', targetMuscles: ['biceps'] }) } as any;

    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(prismaMock.customExercise.create).not.toHaveBeenCalled();
  });

  it('POST creates custom exercise', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    prismaMock.customExercise.create.mockResolvedValue({ id: 'c1', name: 'Curl' });
    const req = {
      json: async () => ({ name: 'Curl', targetMuscles: ['biceps'], category: 'arms' }),
    } as any;

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(prismaMock.customExercise.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: 'Curl' }) }),
    );
    expect(json.success).toBe(true);
    expect(json.exercise).toEqual({ id: 'c1', name: 'Curl' });
  });
});
