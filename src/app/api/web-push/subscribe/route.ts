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

    const subscription = await req.json();
    
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    // Upsert the subscription (endpoint is unique)
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      create: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      update: {
        userId: session.user.id,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      }
    });

    // Also enable notifications setting for user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { pushNotificationsEnabled: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
