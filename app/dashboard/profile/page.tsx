"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Save, Sparkles, User2, Lock, Mail, Phone, MapPin, ImagePlus } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/http";
import { useAuth } from "@/lib/auth/client";
import { profileSchema } from "@/lib/validators";

type FormValues = {
  username?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  password: string;
  confirm_password?: string;
  profile_picture?: FileList;
};

export default function ProfilePage() {
  const { token, profile, refreshProfile } = useAuth();

  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username ?? "",
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      phone_number: profile?.phone_number ?? "",
      address: profile?.address ?? "",
      password: "",
      confirm_password: "",
    },
  });

  React.useEffect(() => {
    reset({
      username: profile?.username ?? "",
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      phone_number: profile?.phone_number ?? "",
      address: profile?.address ?? "",
      password: "",
      confirm_password: "",
    });
  }, [profile, reset]);

  const file = watch("profile_picture")?.[0];
  const preview = React.useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (!token) throw new Error("Login required");

      const fd = new FormData();
      // Optional fields
      if (values.username?.trim()) fd.set("username", values.username.trim());
      if (values.name?.trim()) fd.set("name", values.name.trim());
      if (values.email?.trim()) fd.set("email", values.email.trim());
      if (values.phone_number?.trim()) fd.set("phone_number", values.phone_number.trim());
      if (values.address?.trim()) fd.set("address", values.address.trim());

      // Required current password
      fd.set("password", values.password);

      // Optional password change
      if (values.confirm_password && values.confirm_password.trim()) {
        fd.set("confirm_password", values.confirm_password);
      }

      if (values.profile_picture && values.profile_picture[0]) {
        fd.set("profile_picture", values.profile_picture[0]);
      }

      const res = await apiFetch<{ message: string }>("/api/user/profile/edit", {
        method: "PUT",
        token,
        formData: fd,
      });

      toast.success(res.message);
      await refreshProfile();
      reset({
        username: values.username ?? profile?.username ?? "",
        name: values.name ?? profile?.name ?? "",
        email: values.email ?? profile?.email ?? "",
        phone_number: values.phone_number ?? profile?.phone_number ?? "",
        address: values.address ?? profile?.address ?? "",
        password: "",
        confirm_password: "",
      });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not update profile");
    }
  };

  const avatarSrc = preview || profile?.profile_picture || null;

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="card p-6"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/40 px-3 py-1 text-xs font-medium dark:bg-white/5">
          <Sparkles className="h-4 w-4" />
          Profile
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Account settings</h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">Update your details. For security, your current password is required.</p>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card p-6">
          <div className="text-sm font-semibold">Profile preview</div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5">
            <div className="aspect-[16/12]">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <div className="grid gap-2 text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/50 dark:bg-white/5">
                      <ImagePlus className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-medium">Add a profile picture</div>
                    <div className="text-xs text-[rgb(var(--muted))]">PNG/JPG — optional.</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/50 p-4 text-sm dark:bg-white/5">
            <div className="flex items-center gap-2 font-semibold">
              <User2 className="h-4 w-4" /> @{profile?.username ?? "user"}
            </div>
            <div className="mt-1 text-xs text-[rgb(var(--muted))]">User ID: {profile?.user_id ?? "—"}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6">
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Username</label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-3 py-2 dark:bg-white/5">
                  <User2 className="h-4 w-4 opacity-70" />
                  <input className="w-full bg-transparent text-sm outline-none" placeholder="username" {...register("username")} />
                </div>
                {errors.username ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.username.message}</div> : null}
              </div>
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Name</label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-3 py-2 dark:bg-white/5">
                  <User2 className="h-4 w-4 opacity-70" />
                  <input className="w-full bg-transparent text-sm outline-none" placeholder="Your name" {...register("name")} />
                </div>
                {errors.name ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.name.message}</div> : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Email</label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-3 py-2 dark:bg-white/5">
                  <Mail className="h-4 w-4 opacity-70" />
                  <input className="w-full bg-transparent text-sm outline-none" placeholder="email" {...register("email")} />
                </div>
                {errors.email ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.email.message}</div> : null}
              </div>
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Phone</label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-3 py-2 dark:bg-white/5">
                  <Phone className="h-4 w-4 opacity-70" />
                  <input className="w-full bg-transparent text-sm outline-none" placeholder="phone" {...register("phone_number")} />
                </div>
                {errors.phone_number ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.phone_number.message}</div> : null}
              </div>
            </div>

            <div>
              <label className="text-xs text-[rgb(var(--muted))]">Address</label>
              <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-3 py-2 dark:bg-white/5">
                <MapPin className="h-4 w-4 opacity-70" />
                <input className="w-full bg-transparent text-sm outline-none" placeholder="Address" {...register("address")} />
              </div>
              {errors.address ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.address.message}</div> : null}
            </div>

            <div>
              <label className="text-xs text-[rgb(var(--muted))]">Profile picture</label>
              <input className="input mt-1" type="file" accept="image/*" {...register("profile_picture")} />
              {errors.profile_picture ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{String(errors.profile_picture.message ?? "Invalid file")}</div> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">Current password</label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-3 py-2 dark:bg-white/5">
                  <Lock className="h-4 w-4 opacity-70" />
                  <input className="w-full bg-transparent text-sm outline-none" type="password" placeholder="Required" {...register("password")} />
                </div>
                {errors.password ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.password.message}</div> : null}
              </div>
              <div>
                <label className="text-xs text-[rgb(var(--muted))]">New password (optional)</label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/60 px-3 py-2 dark:bg-white/5">
                  <Lock className="h-4 w-4 opacity-70" />
                  <input className="w-full bg-transparent text-sm outline-none" type="password" placeholder="Leave blank" {...register("confirm_password")} />
                </div>
                {errors.confirm_password ? <div className="mt-1 text-xs text-[rgb(var(--bad))]">{errors.confirm_password.message}</div> : null}
              </div>
            </div>

            <button disabled={isSubmitting} className="btn btn-primary justify-center">
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving…" : "Save changes"}
            </button>

            <div className="text-xs text-[rgb(var(--muted))]">
              Tip: If you seeded demo users, the current password is <span className="font-mono">password123</span>.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
