"use client";

import * as React from "react";
import { clsx } from "clsx";

export type BadgeVariant = "default" | "brand" | "mint" | "pink" | "good" | "warn" | "bad";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "badge",
  brand: "badge badge-brand",
  mint: "badge badge-mint",
  pink: "badge badge-pink",
  good: "badge badge-good",
  warn: "badge badge-warn",
  bad: "badge badge-bad",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
