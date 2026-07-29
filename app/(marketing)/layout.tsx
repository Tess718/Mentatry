import { Navbar } from "@/components/navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-8">
        {children}
      </div>
      <footer className="border-t-4 border-black bg-slate-950 text-slate-400 p-6 text-center text-xs font-mono mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-bold tracking-wider text-amber-300">
            MENTATRY &copy; {new Date().getFullYear()} &mdash; AI QUIZ PLATFORM
          </span>
          <span className="text-slate-500">
            INSTANT AI QUIZZES • CLASSROOM JOIN CODES • REAL-TIME ANALYTICS
          </span>
        </div>
      </footer>
    </>
  );
}
