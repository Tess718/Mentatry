"use client";

import { useActionState, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signupAction } from "@/app/actions/auth";
import { AlertCircle, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";

function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/quizzes";

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const isValidPassword =
    hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  return (
    <div className="neo-box p-8 bg-white space-y-6">
      <div className="space-y-2 text-center">
        <Link href="/" className="inline-flex p-3 bg-amber-400 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-xl hover:-translate-y-1 transition-transform cursor-pointer">
          <Image
            src="/mentatry_logo.png"
            alt="Mentatry Logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
            priority
          />
        </Link>
        <h1 className="text-3xl font-black uppercase tracking-tight">
          Create Account
        </h1>
        <p className="text-sm font-semibold text-slate-600">
          Start generating AI quizzes in seconds
        </p>
      </div>

      <div aria-live="polite">
        {state?.error && (
          <div className="neo-box bg-pink-100 border-red-600 p-3 text-red-700 text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-black uppercase tracking-wider">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              required
              autoComplete="given-name"
              placeholder="Jane"
              className="neo-input"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black uppercase tracking-wider">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              required
              autoComplete="family-name"
              placeholder="Doe"
              className="neo-input"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-black uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="neo-input"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider">
            Password
          </label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="neo-input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 text-slate-700 hover:text-black focus:outline-none p-1"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Password Requirements List */}
          <div className="bg-slate-50 border-2 border-slate-300 p-3 space-y-1 text-xs font-semibold">
            <span className="font-black text-slate-700 uppercase block mb-1">
              Requirements:
            </span>
            <div
              className={`flex items-center gap-1.5 ${
                hasMinLength ? "text-emerald-700 font-bold" : "text-slate-500"
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  hasMinLength ? "text-emerald-600" : "text-slate-400"
                }`}
              />
              <span>At least 8 characters</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                hasUpper ? "text-emerald-700 font-bold" : "text-slate-500"
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  hasUpper ? "text-emerald-600" : "text-slate-400"
                }`}
              />
              <span>At least one uppercase letter (A-Z)</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                hasLower ? "text-emerald-700 font-bold" : "text-slate-500"
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  hasLower ? "text-emerald-600" : "text-slate-400"
                }`}
              />
              <span>At least one lowercase letter (a-z)</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                hasNumber ? "text-emerald-700 font-bold" : "text-slate-500"
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  hasNumber ? "text-emerald-600" : "text-slate-400"
                }`}
              />
              <span>At least one number (0-9)</span>
            </div>
            <div
              className={`flex items-center gap-1.5 ${
                hasSpecial ? "text-emerald-700 font-bold" : "text-slate-500"
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  hasSpecial ? "text-emerald-600" : "text-slate-400"
                }`}
              />
              <span>At least one special character (!@#$%^&*)</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || !isValidPassword}
          aria-busy={isPending}
          className="neo-btn neo-btn-lime w-full py-3 text-base mt-2 flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="w-5 h-5 animate-spin shrink-0" />}
          <span>{isPending ? "Creating Account..." : "Create Account"}</span>
        </button>
      </form>

      <div className="text-center text-sm font-bold pt-2 border-t-2 border-slate-200">
        Already have an account?{" "}
        <Link
          href={`/login${callbackUrl !== "/quizzes" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="underline font-black text-pink-600 hover:text-black"
        >
          Log In
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto py-12">
      <Suspense fallback={<div className="neo-box p-8 bg-white text-center font-bold">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
