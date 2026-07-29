"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please provide a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character (!@#$%^&*)"),
});

const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function signupAction(prevState: any, formData: FormData) {
  try {
    const rawFirstName = formData.get("firstName") as string;
    const rawLastName = formData.get("lastName") as string;
    const rawEmail = formData.get("email") as string;
    const rawPassword = formData.get("password") as string;

    const validated = signupSchema.safeParse({
      firstName: rawFirstName,
      lastName: rawLastName,
      email: rawEmail,
      password: rawPassword,
    });

    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const email = validated.data.email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(validated.data.password, 10);
    await prisma.user.create({
      data: {
        firstName: validated.data.firstName.trim(),
        lastName: validated.data.lastName.trim(),
        email,
        password: hashedPassword,
      },
    });

    await signIn("credentials", {
      email,
      password: validated.data.password,
      redirectTo: "/quizzes",
    });

    return { success: true };
  } catch (err: any) {
    if (err?.type === "CredentialsSignin") {
      return { error: "Invalid credentials." };
    }
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("Signup error:", err);
    return { error: "Something went wrong during sign up. Please try again." };
  }
}

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const rawEmail = formData.get("email") as string;
    const rawPassword = formData.get("password") as string;

    const validated = loginSchema.safeParse({ email: rawEmail, password: rawPassword });
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const email = validated.data.email.toLowerCase().trim();

    await signIn("credentials", {
      email,
      password: validated.data.password,
      redirectTo: "/quizzes",
    });

    return { success: true };
  } catch (err: any) {
    if (err?.type === "CredentialsSignin" || err?.message?.includes("CredentialsSignin")) {
      return { error: "Invalid email or password." };
    }
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("Login error:", err);
    return { error: "Invalid email or password." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
