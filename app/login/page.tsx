"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AtSign, Lock, LogIn, Sparkles, BookOpen, Users, Star } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/http";
import { loginSchema } from "@/lib/validators";
import { useAuth } from "@/lib/auth/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type FormValues = {
  email: string;
  password: string;
};

const demoAccounts = [
  { email: "alice@example.com", name: "Alice", role: "Power seller" },
  { email: "bob@example.com", name: "Bob", role: "Active buyer" },
  { email: "carla@example.com", name: "Carla", role: "New member" },
];

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[rgba(var(--brand)/0.15)] to-[rgba(var(--mint)/0.1)]">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-[rgb(var(--fg))]">{title}</div>
        <div className="text-xs text-[rgb(var(--muted))]">{description}</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { setToken, refreshProfile } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
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

  const fillDemo = (email: string) => {
    setValue("email", email);
    setValue("password", "password123");
  };

  return (
    <div className="mx-auto max-w-6xl py-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left - Info Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col justify-center"
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(var(--brand)/0.2)] bg-[rgba(var(--brand)/0.08)] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--brand))]">
            <Sparkles className="h-3.5 w-3.5" />
            Welcome to BookE
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Sign in to your{" "}
            <span className="bg-gradient-to-r from-[rgb(var(--brand))] to-[rgb(var(--brand2))] bg-clip-text text-transparent">
              account
            </span>
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))] sm:text-base">
            Access your listings, manage orders, and connect with the book community.
          </p>

          {/* Features */}
          <div className="mt-8 space-y-4">
            <FeatureItem
              icon={<BookOpen className="h-5 w-5 text-[rgb(var(--brand))]" />}
              title="Buy, Sell, or Loan"
              description="List your books or find great reads at any price"
            />
            <FeatureItem
              icon={<Users className="h-5 w-5 text-[rgb(var(--mint))]" />}
              title="Trusted Community"
              description="Rate and review sellers for safe transactions"
            />
            <FeatureItem
              icon={<Star className="h-5 w-5 text-[rgb(var(--brand2))]" />}
              title="Wishlist & Track"
              description="Save favorites and track your orders easily"
            />
          </div>

          {/* Demo Accounts */}
          <Card className="mt-8 bg-[rgba(var(--brand)/0.03)]">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <div className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand2))]">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              Demo Accounts
            </div>
            <div className="mt-3 grid gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => fillDemo(acc.email)}
                  className="flex items-center justify-between rounded-xl border border-[rgb(var(--border))] bg-white px-3 py-2 text-left transition-all hover:border-[rgba(var(--brand)/0.3)] hover:bg-[rgba(var(--brand)/0.03)] dark:bg-slate-900"
                >
                  <div>
                    <div className="text-xs font-medium">{acc.name}</div>
                    <div className="text-[10px] text-[rgb(var(--muted))]">{acc.email}</div>
                  </div>
                  <span className="text-[10px] font-medium text-[rgb(var(--muted))]">{acc.role}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-[rgb(var(--muted))]">
              Password: <code className="kbd">password123</code>
            </p>
          </Card>
        </motion.div>

        {/* Right - Form Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card variant="elevated" className="p-8">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold">Sign In</h2>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                Enter your credentials to continue
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                {...register("email")}
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                leftIcon={<AtSign className="h-4 w-4" />}
                error={errors.email?.message}
              />

              <Input
                {...register("password")}
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isSubmitting}
                leftIcon={<LogIn className="h-4 w-4" />}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[rgb(var(--muted))]">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-[rgb(var(--brand))] underline underline-offset-4 hover:opacity-80"
                >
                  Create one
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
