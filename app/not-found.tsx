import Link from "next/link";
import { SearchX, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        
        {/* Big 404 text */}
        <h1 className="text-[120px] sm:text-[150px] leading-none font-black text-amber-400 drop-shadow-[8px_8px_0px_#000000]">
          404
        </h1>
        
        {/* Neo-brutalist Box */}
        <div className="neo-box p-8 sm:p-10 space-y-6 rounded-3xl bg-white text-black shadow-[12px_12px_0px_0px_rgba(244,114,182,1)] relative z-10">
          <div className="w-16 h-16 bg-pink-300 border-3 border-black rounded-2xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <SearchX className="w-8 h-8 text-black stroke-[3]" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-black tracking-tight">
              Page Not Found
            </h2>
            <p className="text-slate-800 font-bold leading-relaxed text-sm sm:text-base">
              We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps you made a typo in the URL.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/" className="neo-btn neo-btn-pink w-full sm:w-auto">
              <Home className="w-5 h-5 stroke-[3]" />
              <span>Take Me Home</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
