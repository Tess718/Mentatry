import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Mentatry account to create and join quizzes.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
