"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { loginAction } from "@/app/actions/auth";
import { AlertCircle, Eye, EyeOff } from "lucide-react";


export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="neo-box p-8 bg-white space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-flex p-3 bg-amber-400 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-xl">
            <Image 
              src="/mentatry_logo.png" 
              alt="Mentatry Logo" 
              width={32} 
              height={32}
              className="w-8 h-8 object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Welcome Back</h1>
          <p className="text-sm font-semibold text-slate-600">Sign in to manage and take your quizzes</p>
        </div>

        {state?.error && (
          <div className="neo-box bg-pink-100 border-red-600 p-3 text-red-700 text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-black uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="neo-input"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black uppercase tracking-wider">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                className="neo-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 text-slate-700 hover:text-black focus:outline-none p-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="neo-btn neo-btn-pink w-full py-3 text-base mt-2"
          >
            {isPending ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-sm font-bold pt-2 border-t-2 border-slate-200">
          Don't have an account?{" "}
          <Link href="/signup" className="underline font-black text-cyan-600 hover:text-black">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
