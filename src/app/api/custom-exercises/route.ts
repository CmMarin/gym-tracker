import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customExercises = await prisma.customExercise.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(customExercises);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch custom exercises" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, targetMuscles, category } = body;

    if (!name || !targetMuscles) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newExercise = await prisma.customExercise.create({
      data: {
        name,
        targetMuscles,
        category,
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true, exercise: newExercise });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create custom exercise" }, { status: 500 });
  }
}
