"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1,
        autoRaf: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
