"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createCoopSession(workoutPlanId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Not authenticated");

  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const plan = await prisma.workoutPlan.findUnique({ where: { id: workoutPlanId } });
  if (!plan) throw new Error("Plan not found");

  const coopSession = await prisma.coopSession.create({
    data: {
      name: plan.name + " Co-Op",
      inviteCode,
      members: {
        create: {
          userId: session.user.id,
          status: "IDLE"
        }
      }
    },
    include: { members: true }
  });

  return { success: true, sessionId: coopSession.id, inviteCode };
}

export async function joinCoopSession(inviteCode: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Not authenticated");

  const coopSession = await prisma.coopSession.findUnique({
    where: { inviteCode }
  });

  if (!coopSession || coopSession.status !== "ACTIVE") {
    throw new Error("Invalid or expired invite code");
  }

  // Check if already a member, if not, add
  const existing = await prisma.coopSessionMember.findUnique({
    where: { sessionId_userId: { sessionId: coopSession.id, userId: session.user.id } }
  });

  if (!existing) {
    await prisma.coopSessionMember.create({
      data: {
        sessionId: coopSession.id,
        userId: session.user.id
      }
    });
  }

  return { success: true, sessionId: coopSession.id };
}

export async function updateCoopStatus(sessionId: string, status: string, currentExercise: string | null, newXp: number = 0) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false };

  await prisma.coopSessionMember.update({
    where: { sessionId_userId: { sessionId, userId: session.user.id } },
    data: { 
      status, 
      currentExercise: currentExercise,
      xpContributed: { increment: newXp }
    }
  });

  if (newXp > 0) {
    await prisma.coopSession.update({
      where: { id: sessionId },
      data: { totalXp: { increment: newXp } }
    });
  }

  return { success: true };
}

import { unstable_noStore as noStore } from "next/cache";

export async function getCoopSession(sessionId: string) {
  noStore();
  const session = await prisma.coopSession.findUnique({
    where: { id: sessionId },
    include: {
      members: {
        include: { user: { select: { username: true, image: true } } }
      }
    }
  });
  return session;
}
