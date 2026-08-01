import React from "react";

export default function GuestPlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}
