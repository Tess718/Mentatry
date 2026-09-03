"use client";

import { useActionState, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loginAction } from "@/app/actions/auth";
import { AlertCircle, Eye, EyeOff, Loader2, ArrowLeft, Mail, Lock, ShieldCheck } from "lucide-react";

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/quizzes";

  return (
    <div className="w-full max-w-md">
      {/* Top back navigation */}
      <div className="mb-4 flex items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Neo Card */}
      <div className="border-3 border-black bg-white rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#facc15] space-y-5">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex p-3 bg-amber-400 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-xl hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
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
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
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
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
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
                className={`neo-input pl-10 focus:-translate-y-0.5 focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  state?.errors?.email ? "border-red-600 bg-red-50/50" : ""
                }`}
              />
            </div>
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
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                required
                autoComplete="current-password"
                aria-invalid={!!state?.errors?.password}
                aria-describedby={state?.errors?.password ? "password-error" : undefined}
                placeholder="••••••••"
                className={`neo-input pl-10 pr-10 focus:-translate-y-0.5 focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${
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
            className="neo-btn neo-btn-pink w-full py-3.5 text-base font-black tracking-wide mt-2 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 active:shadow-[2px_2px_0px_0px_#000] transition-all"
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

      {/* Trust pill */}
      <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 mt-6 text-center">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Secure encrypted authentication</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-2rem)] flex flex-col justify-center items-center px-4 py-8 relative">
      {/* Ambient background glow */}
      <div className="absolute w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <Suspense fallback={<div className="neo-box p-8 bg-white text-center font-bold">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
