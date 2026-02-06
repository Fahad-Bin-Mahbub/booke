"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AtSign, User2, Lock, ArrowRight, Sparkles, BookOpen, Shield, Heart } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/http";
import { registerSchema, loginSchema } from "@/lib/validators";
import { useAuth } from "@/lib/auth/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type FormValues = {
  username: string;
  name: string;
  email: string;
  password: string;
  confirm_password: string;
};

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[rgba(var(--mint)/0.15)] to-[rgba(var(--brand)/0.1)]">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-[rgb(var(--fg))]">{title}</div>
        <div className="text-xs text-[rgb(var(--muted))]">{description}</div>
      </div>
    </div>
  );
}

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
    <div className="mx-auto max-w-6xl py-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left - Info Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col justify-center"
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(var(--mint)/0.2)] bg-[rgba(var(--mint)/0.08)] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--mint))]">
            <Sparkles className="h-3.5 w-3.5" />
            Join BookE Today
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Create your{" "}
            <span className="bg-gradient-to-r from-[rgb(var(--mint))] to-[rgb(var(--brand))] bg-clip-text text-transparent">
              account
            </span>
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))] sm:text-base">
            Post books for sale, loan, or giveaway. Track your orders and build trust through ratings.
          </p>

          {/* Features */}
          <div className="mt-8 space-y-4">
            <FeatureItem
              icon={<BookOpen className="h-5 w-5 text-[rgb(var(--mint))]" />}
              title="List Your Books"
              description="Easily post books with photos, prices, and descriptions"
            />
            <FeatureItem
              icon={<Shield className="h-5 w-5 text-[rgb(var(--brand))]" />}
              title="Secure Transactions"
              description="Order tracking and seller verification"
            />
            <FeatureItem
              icon={<Heart className="h-5 w-5 text-[rgb(var(--brand2))]" />}
              title="Build Your Reputation"
              description="Get rated and reviewed by the community"
            />
          </div>

          {/* Tip Card */}
          <Card className="mt-8 bg-gradient-to-br from-[rgba(var(--mint)/0.05)] to-[rgba(var(--brand)/0.03)]">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[rgb(var(--mint))] to-[rgb(var(--brand))]">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold">Pro Tip</div>
                <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
                  Choose a short, memorable username — it shows up on every listing you post!
                </p>
              </div>
            </div>
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
              <h2 className="text-xl font-semibold">Create Account</h2>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                Fill in your details to get started
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  {...register("username")}
                  label="Username"
                  placeholder="fahad"
                  autoComplete="username"
                  leftIcon={<User2 className="h-4 w-4" />}
                  error={errors.username?.message}
                />
                <Input
                  {...register("name")}
                  label="Full Name"
                  placeholder="Fahad Bin Mahbub"
                  autoComplete="name"
                  leftIcon={<Sparkles className="h-4 w-4" />}
                  error={errors.name?.message}
                />
              </div>

              <Input
                {...register("email")}
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                leftIcon={<AtSign className="h-4 w-4" />}
                error={errors.email?.message}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  {...register("password")}
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                />
                <Input
                  {...register("confirm_password")}
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.confirm_password?.message}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[rgb(var(--muted))]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-[rgb(var(--brand))] underline underline-offset-4 hover:opacity-80"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
