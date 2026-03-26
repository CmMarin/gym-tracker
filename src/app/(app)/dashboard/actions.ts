"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function searchUser(username: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const me = session.user.id;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return { error: "User not found" };
  if (user.id === me) return { error: "You can't add yourself!" };

  const existingFriendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: me, friendId: user.id },
        { userId: user.id, friendId: me }
      ]
    }
  });

  if (existingFriendship) {
    if (existingFriendship.status === "ACCEPTED") return { error: "Already friends!" };
    return { error: "Friend request already pending!" };
  }

  return { user: { id: user.id, username: user.username } };
}

export async function sendFriendRequest(targetId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const me = session.user.id;

  await prisma.friendship.create({
    data: {
      userId: me,
      friendId: targetId,
      status: "PENDING"
    }
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function acceptFriendRequest(friendshipId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const me = session.user.id;

  await prisma.friendship.update({
    where: { id: friendshipId, friendId: me },
    data: { status: "ACCEPTED" }
  });

  revalidatePath("/dashboard");
  return { success: true };
}
