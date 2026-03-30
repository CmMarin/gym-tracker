import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { endpoint } = await req.json();

    if (endpoint) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint }
      });
    } else {
      // If no specific endpoint is provided, delete all for user
      await prisma.pushSubscription.deleteMany({
        where: { userId: session.user.id }
      });
    }

    // Disable push notifications setting for user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { pushNotificationsEnabled: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing push subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
