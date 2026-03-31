import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unstable_cache } from "next/cache";

const getCachedExercises = unstable_cache(
  async () => {
    return await prisma.exercise.findMany({
      orderBy: { name: 'asc' }
    });
  },
  ['global-exercises'],
  { revalidate: 86400, tags: ['global-exercises'] }
);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exercises = await getCachedExercises();

    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Failed to fetch exercises", error);
    return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 });
  }
}
