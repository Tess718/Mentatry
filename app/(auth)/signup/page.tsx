"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signupAction } from "@/app/actions/auth";
import { AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";


export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signupAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

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
          <h1 className="text-3xl font-black uppercase tracking-tight">Create Account</h1>
          <p className="text-sm font-semibold text-slate-600">Start generating AI quizzes in seconds</p>
        </div>

        {state?.error && (
          <div className="neo-box bg-pink-100 border-red-600 p-3 text-red-700 text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                placeholder="Jane"
                className="neo-input"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                placeholder="Doe"
                className="neo-input"
              />
            </div>
          </div>

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

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            {/* Password strength requirement checklist */}
            <div className="bg-slate-50 border-2 border-black p-3 text-xs space-y-1 font-semibold">
              <div className="font-black text-[10px] uppercase text-slate-500 mb-1">Password Requirements:</div>
              <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-lime-700 font-bold" : "text-slate-500"}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> At least 8 characters
              </div>
              <div className={`flex items-center gap-1.5 ${hasUpper ? "text-lime-700 font-bold" : "text-slate-500"}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> At least 1 uppercase letter (A-Z)
              </div>
              <div className={`flex items-center gap-1.5 ${hasLower ? "text-lime-700 font-bold" : "text-slate-500"}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> At least 1 lowercase letter (a-z)
              </div>
              <div className={`flex items-center gap-1.5 ${hasNumber ? "text-lime-700 font-bold" : "text-slate-500"}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> At least 1 number (0-9)
              </div>
              <div className={`flex items-center gap-1.5 ${hasSpecial ? "text-lime-700 font-bold" : "text-slate-500"}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> At least 1 special character (!@#$%^&*)
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="neo-btn neo-btn-lime w-full py-3 text-base mt-2"
          >
            {isPending ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center text-sm font-bold pt-2 border-t-2 border-slate-200">
          Already have an account?{" "}
          <Link href="/login" className="underline font-black text-pink-600 hover:text-black">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
