"use client";

import { useEffect, useState } from "react";

export function ScrollHeader({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 py-3.5 px-6 sm:px-12 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-900/95 backdrop-blur-md border-b-4 border-black shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          : "bg-transparent border-b-4 border-transparent shadow-none"
      }`}
    >
      {children}
    </header>
  );
}
