import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Bell, Trophy } from "lucide-react";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30
  });

  // Mark all as read when visited
  if (notifications.some(n => !n.read)) {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true }
    });
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-32 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 text-blue-500 p-3 rounded-2xl">
          <Bell size={24} />
        </div>
        <h1 className="text-2xl font-black text-slate-800">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border-2 border-gray-100 rounded-[2rem] p-8 text-center text-slate-500 font-bold">
          No notifications yet!
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notif => (
            <div key={notif.id} className={`p-4 rounded-2xl border-2 transition-all ${notif.read ? 'bg-white border-gray-100 opacity-75' : 'bg-blue-50 border-blue-200 shadow-sm'}`}>
              <div className="flex gap-3">
                <div className="text-blue-500 pt-1 shrink-0">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{notif.title}</h3>
                  <p className="text-slate-600 text-sm mt-1">{notif.message}</p>
                  <span className="text-xs text-slate-400 mt-2 block">
                    {notif.createdAt.toLocaleDateString()} {notif.createdAt.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
