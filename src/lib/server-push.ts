import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Type definition for valid web push subscriptions needed by the web-push library
interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:support@gymtracker.app",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn("VAPID keys are missing. Web push notifications will not work.");
}

export async function sendPushNotification(
  userId: string,
  payload: { title: string; body: string; url?: string; [key: string]: any }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { pushSubscriptions: true },
    });

    if (!user || !user.pushNotificationsEnabled || user.pushSubscriptions.length === 0) {
      return { success: true, sent: 0 };
    }

    const notificationPayload = JSON.stringify(payload);
    let sentCount = 0;

    const pushPromises = user.pushSubscriptions.map(async (sub) => {
      const pushSubscription: PushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, notificationPayload);
        sentCount++;
      } catch (error: any) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          console.log("Push subscription expired/invalid. Removing from DB.");
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error("Error sending push notification:", error);
        }
      }
    });

    await Promise.all(pushPromises);
    return { success: true, sent: sentCount };
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return { success: false, error };
  }
}

export async function broadcastToUsers(
  userIds: string[],
  payload: { title: string; body: string; url?: string; [key: string]: any }
) {
  const chunks = [];
  // basic chunking if there are many users
  for (const userId of userIds) {
    chunks.push(sendPushNotification(userId, payload));
  }
  await Promise.all(chunks);
}
