import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidateTag } from "next/cache";

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
    console.error("Failed to fetch custom exercises", error);
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
    const rawName = typeof body?.name === "string" ? body.name.trim() : "";
    const targetMuscles = Array.isArray(body?.targetMuscles) ? body.targetMuscles : [];
    const category = typeof body?.category === "string" ? body.category.trim() : undefined;

    if (!rawName || targetMuscles.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rawName.length > 100 || (category && category.length > 100)) {
      return NextResponse.json({ error: "Input too long" }, { status: 400 });
    }

    const existing = await prisma.customExercise.findFirst({
      where: {
        userId: session.user.id,
        name: { equals: rawName, mode: "insensitive" },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Exercise with this name already exists" }, { status: 400 });
    }

    const newExercise = await prisma.customExercise.create({
      data: {
        name: rawName,
        targetMuscles,
        category,
        userId: session.user.id
      }
    });

    revalidateTag(`custom-exercises-${session.user.id}`, "default");

    return NextResponse.json({ success: true, exercise: newExercise });
  } catch (error) {
    console.error("Failed to create custom exercise", error);
    return NextResponse.json({ error: "Failed to create custom exercise" }, { status: 500 });
  }
}
