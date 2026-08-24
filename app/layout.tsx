import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mentatry — AI-Powered Quizzes & Live Classrooms",
    template: "%s | Mentatry",
  },
  description: "Create, take, and share interactive quizzes powered by AI. Host live rooms, track streaks, and earn achievements in a gamified learning environment.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Mentatry — AI-Powered Quizzes",
    description: "Generate interactive multiple-choice quizzes from any topic in seconds. Share via short join codes & track live student performance.",
    url: "/",
    siteName: "Mentatry",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mentatry — AI-Powered Quizzes",
    description: "Generate interactive multiple-choice quizzes from any topic in seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="grid-bg-dark text-white flex flex-col min-h-screen">
        <main className="flex-1 w-full min-h-screen">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  );
}
