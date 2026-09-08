"use client";

import { useActionState, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loginAction } from "@/app/actions/auth";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/quizzes";

  return (
    <div className="neo-box p-7 sm:p-8 bg-white space-y-6 w-full max-w-md rounded-2xl">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex p-3 bg-amber-400 border-3 border-black rounded-xl hover:-translate-y-0.5 transition-transform cursor-pointer"
            title="Mentatry Home"
          >
            <Image
              src="/mentatry_logo.png"
              alt="Mentatry Logo"
              width={36}
              height={36}
              className="w-9 h-9 object-contain"
              priority
            />
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">
            Sign In
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
            Enter your credentials to access your quizzes
          </p>
        </div>
      </div>

      <div aria-live="polite">
        {state?.error && !state?.errors && (
          <div className="neo-box bg-pink-100 border-red-600 p-3 text-red-700 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-xl">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-black uppercase tracking-wider text-slate-800">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            defaultValue={state?.fields?.email || ""}
            aria-invalid={!!state?.errors?.email}
            aria-describedby={state?.errors?.email ? "email-error" : undefined}
            placeholder="you@example.com"
            className={`neo-input ${
              state?.errors?.email ? "border-red-600 bg-red-50/50" : ""
            }`}
          />
          {state?.errors?.email && (
            <p id="email-error" className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{state.errors.email[0]}</span>
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-black uppercase tracking-wider text-slate-800">
            Password
          </label>
          <div className="relative flex items-center">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              required
              autoComplete="current-password"
              aria-invalid={!!state?.errors?.password}
              aria-describedby={state?.errors?.password ? "password-error" : undefined}
              placeholder="••••••••"
              className={`neo-input pr-10 ${
                state?.errors?.password ? "border-red-600 bg-red-50/50" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 text-slate-500 hover:text-black focus:outline-none p-1 transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {state?.errors?.password && (
            <p id="password-error" className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{state.errors.password[0]}</span>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          className="neo-btn neo-btn-pink w-full py-3.5 text-base font-black tracking-wide mt-2 flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="w-5 h-5 animate-spin shrink-0" />}
          <span>{isPending ? "Signing In..." : "Sign In"}</span>
        </button>
      </form>

      <div className="text-center text-xs sm:text-sm font-bold pt-4 border-t-2 border-slate-100 text-slate-600">
        Don't have an account?{" "}
        <Link
          href={`/signup${callbackUrl !== "/quizzes" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="underline underline-offset-4 font-black text-cyan-700 hover:text-black transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <Suspense fallback={<div className="neo-box p-8 bg-white text-center font-bold">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
