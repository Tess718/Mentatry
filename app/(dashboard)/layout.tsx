import { auth } from "@/auth";
import { Sidebar } from "@/components/sidebar";
import Avatar from "@/components/ui/avatar";
import { ScrollToTop } from "@/components/scroll-to-top";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;
  const displayName = user?.firstName || user?.email || "Quizmaster";
  const avatarSeed = user?.email || user?.id || "default";

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Sidebar user={user} />
      <div className="lg:pl-64 flex-1 flex flex-col transition-all w-full">
        {/* Full-width Fixed Top Header Bar Outside Sidebar */}
        <header className="sticky top-0 z-30 w-full bg-slate-900/95 backdrop-blur-md border-b-4 border-black py-3 px-4 sm:px-8 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-end gap-4">
            {/* User Name & Avatar (Right-aligned) */}
            {user ? (
              <div className="flex items-center gap-3">
                <Avatar seed={avatarSeed} size={42} />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-black text-amber-400 tracking-wider">
                    DASHBOARD USER
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-white">
                    {displayName}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm font-black uppercase text-amber-400">
                GUEST DASHBOARD
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Main Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
