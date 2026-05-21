import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.exercise.createMany({
      data: [
         { name: 'Treadmill', category: 'Cardio' },
         { name: 'Stairmaster', category: 'Cardio' },
         { name: 'Elliptical', category: 'Cardio' }
      ],
      skipDuplicates: true
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
