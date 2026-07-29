import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Room",
  description: "Enter a 6-character room code to join a live quiz.",
};

export default function JoinQuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
