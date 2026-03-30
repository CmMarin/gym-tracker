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

    const schedule = await prisma.workoutSchedule.findUnique({
      where: { userId: session.user.id }
    });

    return NextResponse.json(schedule || null);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      mondayId, tuesdayId, wednesdayId, 
      thursdayId, fridayId, saturdayId, sundayId, 
      scope 
    } = body;

    const schedule = await prisma.workoutSchedule.upsert({
      where: { userId: session.user.id },
      update: {
        mondayId: mondayId || null,
        tuesdayId: tuesdayId || null,
        wednesdayId: wednesdayId || null,
        thursdayId: thursdayId || null,
        fridayId: fridayId || null,
        saturdayId: saturdayId || null,
        sundayId: sundayId || null,
        scope: scope || "ONGOING"
      },
      create: {
        userId: session.user.id,
        mondayId: mondayId || null,
        tuesdayId: tuesdayId || null,
        wednesdayId: wednesdayId || null,
        thursdayId: thursdayId || null,
        fridayId: fridayId || null,
        saturdayId: saturdayId || null,
        sundayId: sundayId || null,
        scope: scope || "ONGOING"
      }
    });

    return NextResponse.json({ success: true, schedule });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}
