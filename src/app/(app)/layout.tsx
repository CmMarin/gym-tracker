import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <TopNav />
      {/* Main content takes up screen space minus top/bottom navs */}
      <main className="flex-1 pb-24 overflow-y-auto w-full max-w-md mx-auto relative bg-gray-50">
        {children}
      </main>
      <BottomNav />
    </>
  );
}