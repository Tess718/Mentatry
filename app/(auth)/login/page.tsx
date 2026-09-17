"use client";

import { useActionState, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loginAction } from "@/app/actions/auth";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthShowcasePanel } from "@/components/auth-showcase-panel";

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/quizzes";

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col justify-between h-full py-2">
      {/* Mobile-only Brand Logo */}
      <div className="lg:hidden mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 p-2 bg-amber-400 border-2 border-black rounded-xl hover:-translate-y-0.5 transition-transform"
          title="Mentatry Home"
        >
          <Image
            src="/mentatry_logo.png"
            alt="Mentatry Logo"
            width={26}
            height={26}
            className="w-6.5 h-6.5 object-contain"
          />
          <span className="font-black text-black text-xs uppercase tracking-wider">
            Mentatry
          </span>
        </Link>
      </div>

      {/* Center Form Content */}
      <div className="space-y-6 my-auto">
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
            Sign In
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            Enter your credentials to access your quizzes
          </p>
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
            className="neo-btn neo-btn-pink w-full py-3.5 text-base font-black tracking-wide mt-3 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPending && <Loader2 className="w-5 h-5 animate-spin shrink-0" />}
            <span>{isPending ? "Signing In..." : "Sign In"}</span>
          </button>
        </form>
      </div>

      {/* Bottom Switch Link */}
      <div className="text-center text-xs sm:text-sm font-bold pt-6 mt-6 border-t-2 border-slate-100 text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          href={`/signup${callbackUrl !== "/quizzes" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="font-black text-pink-600 hover:text-black underline underline-offset-4 transition-colors ml-1"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 lg:py-12">
      {/* Master Unified Container Card Scaled Up to max-w-6xl with 50/50 split */}
      <div className="w-full max-w-6xl bg-white border-4 border-black rounded-3xl sm:rounded-[36px] shadow-[10px_10px_0px_0px_#000] p-4 sm:p-6 lg:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {/* Left Inset Sticker Showcase Panel (Equal 50% width) */}
          <div className="hidden lg:block h-full">
            <AuthShowcasePanel mode="login" />
          </div>

          {/* Right Form Area (Equal 50% width) */}
          <div className="flex flex-col justify-center px-3 sm:px-8 lg:px-10 py-4 sm:py-6">
            <Suspense fallback={<div className="p-8 text-center font-bold text-slate-800">Loading...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
