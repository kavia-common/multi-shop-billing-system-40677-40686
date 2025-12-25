"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * Badge
 * A small label for statuses and counts.
 */
export type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "error";

const styles: Record<BadgeVariant, string> = {
  neutral:
    "bg-slate-100 text-slate-800 ring-1 ring-inset ring-slate-200",
  primary:
    "bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200",
  success:
    "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-200",
  warning:
    "bg-yellow-100 text-yellow-900 ring-1 ring-inset ring-yellow-200",
  error:
    "bg-red-100 text-red-800 ring-1 ring-inset ring-red-200",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

// PUBLIC_INTERFACE
export function Badge({ variant = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
