"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

function BreadcrumbsContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  if (!pathname || pathname === "/quizzes") return null;

  const segments = pathname.split("/").filter(Boolean);
  const from = searchParams?.get("from");
  const roomId = searchParams?.get("roomId");
  
  // Custom mapping for friendly names
  const getFriendlyName = (segment: string) => {
    if (segment === "quizzes") return "Dashboard";
    if (segment === "new") return "Create Quiz";
    if (segment === "join") return "Join Room";
    if (segment === "achievements") return "Achievements";
    if (segment === "edit") return "Edit Quiz";
    if (segment === "insights") return "Insights";
    if (segment === "results") return "Results";
    
    // Capitalize first letter
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  let crumbs = [];
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (segment === "quizzes" && i === 0) continue;
    if (segment === "rooms") continue;
    if (segment.length >= 20) continue;

    const href = "/" + segments.slice(0, i + 1).join("/");
    crumbs.push({ label: getFriendlyName(segment), href });
  }

  // Inject contextual intermediate breadcrumbs based on query params
  if (segments.includes("results") && from) {
    const quizId = segments[1];
    const resultsCrumb = crumbs.pop();
    
    if (from === "insights" && quizId) {
      crumbs.push({ label: "Insights", href: `/quizzes/${quizId}/insights` });
    } else if (from === "room" && roomId) {
      crumbs.push({ label: "Room Summary", href: `/rooms/${roomId}/summary` });
    } else if (from === "leaderboard" && roomId) {
      crumbs.push({ label: "Leaderboard", href: `/rooms/${roomId}/leaderboard` });
    }
    
    if (resultsCrumb) {
      crumbs.push(resultsCrumb);
    }
  }

  return (
    <nav className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
      <Link href="/quizzes" className="hover:text-amber-300 text-slate-400 transition-colors flex items-center gap-1">
        <Home className="w-4 h-4" />
      </Link>
      
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        
        return (
          <div key={crumb.label + crumb.href} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            {isLast ? (
              <span className="text-amber-400 font-black uppercase tracking-wider">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-amber-300 transition-colors uppercase tracking-wider">
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function Breadcrumbs() {
  return (
    <Suspense fallback={<nav className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-6 pb-2"><Link href="/quizzes"><Home className="w-4 h-4" /></Link></nav>}>
      <BreadcrumbsContent />
    </Suspense>
  );
}
