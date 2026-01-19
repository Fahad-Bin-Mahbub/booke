"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AtSign, Lock, LogIn, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/http";
import { loginSchema } from "@/lib/validators";
import { useAuth } from "@/lib/auth/client";

type FormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { setToken, refreshProfile } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await apiFetch<{ token: string }>("/api/user/login", { method: "POST", body: values });
      setToken(res.token);
      await refreshProfile();
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e?.message ?? "Login failed");
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="card relative overflow-hidden p-8"
      >
        <div className="absolute inset-0">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[rgba(var(--brand)/0.18)] blur-3xl" />
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[rgba(var(--brand2)/0.16)] blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[rgba(var(--mint)/0.14)] blur-3xl" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/40 px-3 py-1 text-xs font-medium dark:bg-white/5">
            <Sparkles className="h-4 w-4" />
            Vibrant, modern UI
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Sign in to BookE</h1>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            Use your account to post books, manage orders, and keep a wishlist.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/50 p-4 text-sm dark:bg-white/5">
            <div className="font-semibold">Demo accounts</div>
            <div className="mt-2 grid gap-2 text-xs text-[rgb(var(--muted))]">
              <div>
                <span className="font-mono">alice@example.com</span> · password <span className="font-mono">password123</span>
              </div>
              <div>
                <span className="font-mono">bob@example.com</span> · password <span className="font-mono">password123</span>
              </div>
              <div>
                <span className="font-mono">carla@example.com</span> · password <span className="font-mono">password123</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="card p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div>
            <label className="text-xs text-[rgb(var(--muted))]">Email</label>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-3 py-2 dark:bg-white/5">
              <AtSign className="h-4 w-4 opacity-70" />
              <input
                {...register("email")}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            {errors.email ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.email.message}</div> : null}
          </div>

          <div>
            <label className="text-xs text-[rgb(var(--muted))]">Password</label>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-3 py-2 dark:bg-white/5">
              <Lock className="h-4 w-4 opacity-70" />
              <input
                {...register("password")}
                type="password"
                className="w-full bg-transparent text-sm outline-none"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            {errors.password ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.password.message}</div> : null}
          </div>

          <button disabled={isSubmitting} className="btn btn-primary mt-2">
            <LogIn className="h-4 w-4" />
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>

          <div className="text-center text-sm text-[rgb(var(--muted))]">
            New here?{" "}
            <Link href="/register" className="font-medium text-[rgb(var(--fg))] underline decoration-white/30 underline-offset-4">
              Create an account
            </Link>
          </div>
        </form>
      </motion.section>
    </div>
  );
}
