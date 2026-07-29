import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a free Mentatry account to start generating AI quizzes today.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
