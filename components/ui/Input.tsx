"use client";

import * as React from "react";
import { clsx } from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, type = "text", id, ...props }, ref) => {
    const inputId = id || React.useId();
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs font-medium text-[rgb(var(--muted))]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={clsx(
              "input",
              leftIcon && "!pl-10",
              rightIcon && "!pr-10",
              error && "border-[rgb(var(--bad))] focus:ring-[rgba(var(--bad)/0.25)]",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-[rgb(var(--bad))]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
