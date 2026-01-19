"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AtSign, User2, Lock, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/http";
import { registerSchema, loginSchema } from "@/lib/validators";
import { useAuth } from "@/lib/auth/client";

type FormValues = {
  username: string;
  name: string;
  email: string;
  password: string;
  confirm_password: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { setToken, refreshProfile } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", name: "", email: "", password: "", confirm_password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await apiFetch("/api/user/register", { method: "POST", body: values });

      // Auto-login for a smoother UX
      const loginPayload = loginSchema.parse({ email: values.email, password: values.password });
      const res = await apiFetch<{ token: string }>("/api/user/login", { method: "POST", body: loginPayload });
      setToken(res.token);
      await refreshProfile();

      toast.success("Account created!");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not register");
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
            Create your BookE identity
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Create an account</h1>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            Post books for sale/loan/giveaway, track orders, and build trust with ratings.
          </p>

          <div className="mt-6 grid gap-3 text-sm">
            <div className="card bg-white/50 p-4 dark:bg-white/5">
              <div className="text-xs text-[rgb(var(--muted))]">Pro tip</div>
              <div className="mt-1 font-medium">Use a short username — it shows up on every listing.</div>
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-[rgb(var(--muted))]">Username</label>
              <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-3 py-2 dark:bg-white/5">
                <User2 className="h-4 w-4 opacity-70" />
                <input {...register("username")} className="w-full bg-transparent text-sm outline-none" placeholder="fahad" autoComplete="username" />
              </div>
              {errors.username ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.username.message}</div> : null}
            </div>
            <div>
              <label className="text-xs text-[rgb(var(--muted))]">Name</label>
              <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-3 py-2 dark:bg-white/5">
                <Sparkles className="h-4 w-4 opacity-70" />
                <input {...register("name")} className="w-full bg-transparent text-sm outline-none" placeholder="Fahad Bin Mahbub" autoComplete="name" />
              </div>
              {errors.name ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.name.message}</div> : null}
            </div>
          </div>

          <div>
            <label className="text-xs text-[rgb(var(--muted))]">Email</label>
            <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-3 py-2 dark:bg-white/5">
              <AtSign className="h-4 w-4 opacity-70" />
              <input {...register("email")} className="w-full bg-transparent text-sm outline-none" placeholder="you@example.com" autoComplete="email" />
            </div>
            {errors.email ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.email.message}</div> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-[rgb(var(--muted))]">Password</label>
              <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-3 py-2 dark:bg-white/5">
                <Lock className="h-4 w-4 opacity-70" />
                <input {...register("password")} type="password" className="w-full bg-transparent text-sm outline-none" placeholder="••••••••" autoComplete="new-password" />
              </div>
              {errors.password ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.password.message}</div> : null}
            </div>
            <div>
              <label className="text-xs text-[rgb(var(--muted))]">Confirm password</label>
              <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-3 py-2 dark:bg-white/5">
                <Lock className="h-4 w-4 opacity-70" />
                <input {...register("confirm_password")} type="password" className="w-full bg-transparent text-sm outline-none" placeholder="••••••••" autoComplete="new-password" />
              </div>
              {errors.confirm_password ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.confirm_password.message}</div> : null}
            </div>
          </div>

          <button disabled={isSubmitting} className="btn btn-primary mt-2">
            <ArrowRight className="h-4 w-4" />
            {isSubmitting ? "Creating…" : "Create account"}
          </button>

          <div className="text-center text-sm text-[rgb(var(--muted))]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[rgb(var(--fg))] underline decoration-white/30 underline-offset-4">
              Sign in
            </Link>
          </div>
        </form>
      </motion.section>
    </div>
  );
}
