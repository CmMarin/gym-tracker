"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendPushNotification } from "@/lib/server-push";

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

  // Notify the target user
  await sendPushNotification(targetId, {
    title: "New Friend Request",
    body: `${session.user.name || "Someone"} sent you a friend request.`,
    url: "/dashboard"
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function acceptFriendRequest(friendshipId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const me = session.user.id;

  const friendship = await prisma.friendship.update({
    where: { id: friendshipId, friendId: me },
    data: { status: "ACCEPTED" },
    include: { user: true }
  });

  // Notify the user who sent the request
  await sendPushNotification(friendship.userId, {
    title: "Friend Request Accepted",
    body: `${session.user.name || "A user"} accepted your friend request.`,
    url: "/dashboard"
  });

  revalidatePath("/dashboard");
  return { success: true };
}
