import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";

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
      <main className="flex-1 pb-24 overflow-y-auto overflow-x-hidden w-full max-w-md mx-auto relative bg-transparent no-scrollbar">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <BottomNav />
    </>
  );
}