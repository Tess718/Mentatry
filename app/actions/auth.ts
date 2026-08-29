"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import { headers } from "next/headers";
import { authRatelimit } from "@/lib/ratelimit";

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

function getClientIp(headersList: Headers): string {
  const xForwardedFor = headersList.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  return headersList.get("x-real-ip") ?? "127.0.0.1";
}

export async function signupAction(prevState: any, formData: FormData) {
  try {
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const { success: rateLimitSuccess } = await authRatelimit.limit(ip);
    
    if (!rateLimitSuccess) {
      return { error: "Too many attempts. Please try again later." };
    }

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
      return { error: "We are unable to create this account" };
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

    const rawCallbackUrl = (formData.get("callbackUrl") as string) || "/quizzes";
    const redirectTo = (rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//"))
      ? rawCallbackUrl
      : "/quizzes";

    await signIn("credentials", {
      email,
      password: validated.data.password,
      redirectTo,
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
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const { success: rateLimitSuccess } = await authRatelimit.limit(ip);
    
    if (!rateLimitSuccess) {
      return { error: "Too many login attempts. Please try again later." };
    }

    const rawEmail = formData.get("email") as string;
    const rawPassword = formData.get("password") as string;
    const rawCallbackUrl = (formData.get("callbackUrl") as string) || "/quizzes";
    const redirectTo = (rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//"))
      ? rawCallbackUrl
      : "/quizzes";

    const validated = loginSchema.safeParse({ email: rawEmail, password: rawPassword });
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const email = validated.data.email.toLowerCase().trim();

    await signIn("credentials", {
      email,
      password: validated.data.password,
      redirectTo,
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

export async function logoutAction(redirectToOrFormData?: string | FormData) {
  const target =
    typeof redirectToOrFormData === "string" ? redirectToOrFormData : "/";
  await signOut({ redirectTo: target });
}
