import { Navbar } from "@/components/navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="w-full px-6 sm:px-12">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <footer className="border-t-4 border-black bg-slate-950 text-slate-400 py-6 px-6 sm:px-12 text-center text-xs font-mono mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:items-start gap-1">
            <span className="font-bold tracking-wider text-amber-300">
              MENTATRY &copy; {new Date().getFullYear()} &mdash; AI QUIZ PLATFORM
            </span>
            <span className="text-slate-500">
              INSTANT AI QUIZZES • CLASSROOM JOIN CODES • REAL-TIME ANALYTICS
            </span>
          </div>
          <div className="flex items-center gap-6 font-bold tracking-wider uppercase text-[10px] sm:text-xs text-slate-400">
            <a href="/privacy" className="hover:text-amber-300 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-amber-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </>
  );
}
