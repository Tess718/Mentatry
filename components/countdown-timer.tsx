"use client";

import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      const msUntilMidnight = tomorrow.getTime() - now.getTime();
      
      const hours = Math.floor(msUntilMidnight / (1000 * 60 * 60));
      const minutes = Math.floor((msUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`Ends in ${hours}h ${minutes}m`);
    };

    calculateTimeLeft();
    // Update every minute instead of every second to save re-renders
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) {
    return (
      <span className="text-sm font-black uppercase flex items-center gap-1">
        <Timer className="w-4 h-4" />
        Ends tonight at midnight UTC
      </span>
    );
  }

  return (
    <span className="text-sm font-black uppercase flex items-center gap-1">
      <Timer className="w-4 h-4" />
      {timeLeft}
    </span>
  );
}
