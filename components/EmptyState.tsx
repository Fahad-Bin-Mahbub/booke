"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { PackageOpen, Sparkles } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--border))] bg-gradient-to-b from-[rgba(var(--brand)/0.02)] to-[rgba(var(--mint)/0.02)] px-6 py-16 text-center"
    >
      {/* Icon */}
      <div className="relative mb-6">
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-[rgba(var(--brand)/0.1)] via-white to-[rgba(var(--mint)/0.1)] shadow-lg">
          {icon || <PackageOpen className="h-10 w-10 text-[rgb(var(--muted))]" />}
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[rgb(var(--brand))] to-[rgb(var(--brand2))] shadow-lg"
        >
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </motion.div>
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold tracking-tight text-[rgb(var(--fg))]">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[rgb(var(--muted))]">
          {description}
        </p>
      )}

      {/* Action */}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
