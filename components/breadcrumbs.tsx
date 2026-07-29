"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  
  if (!pathname || pathname === "/quizzes") return null;

  const segments = pathname.split("/").filter(Boolean);
  
  // Custom mapping for friendly names
  const getFriendlyName = (segment: string) => {
    if (segment === "quizzes") return "Dashboard";
    if (segment === "new") return "Create Quiz";
    if (segment === "join") return "Join Room";
    if (segment === "achievements") return "Achievements";
    if (segment === "edit") return "Edit Quiz";
    if (segment === "insights") return "Insights";
    if (segment === "results") return "Results";
    
    // If it looks like a CUID/UUID (long alphanumeric), it's probably an ID
    if (segment.length >= 20) return "Quiz Details";
    
    // Capitalize first letter
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <nav className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
      <Link href="/quizzes" className="hover:text-amber-300 text-slate-400 transition-colors flex items-center gap-1">
        <Home className="w-4 h-4" />
      </Link>
      
      {segments.map((segment, index) => {
        // Skip 'quizzes' if it's the first segment, as it's represented by the home icon
        if (segment === "quizzes" && index === 0) return null;
        
        const isIdSegment = segment.length >= 20;
        // Skip ID segments entirely so they don't show up in the breadcrumbs
        if (isIdSegment) return null;

        const isLast = index === segments.length - 1;
        const href = "/" + segments.slice(0, index + 1).join("/");
        
        return (
          <div key={href} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            {isLast ? (
              <span className="text-amber-400 font-black uppercase tracking-wider">{getFriendlyName(segment)}</span>
            ) : (
              <Link href={href} className="hover:text-amber-300 transition-colors uppercase tracking-wider">
                {getFriendlyName(segment)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
