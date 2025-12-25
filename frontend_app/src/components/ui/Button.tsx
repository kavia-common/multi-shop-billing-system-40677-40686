"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * Button
 * A reusable button component aligned to the Ocean Professional theme.
 * - Variants: primary, secondary, outline, ghost, destructive
 * - Sizes: sm, md, lg
 * - Loading state with accessible spinner
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  /** visual variant */
  variant?: ButtonVariant;
  /** size variant */
  size?: ButtonSize;
  /** loading state disables button and shows spinner */
  loading?: boolean;
  /** full width */
  block?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white shadow hover:bg-blue-700 focus-visible:ring-blue-500",
  secondary:
    "bg-amber-500 text-slate-900 shadow hover:bg-amber-600 focus-visible:ring-amber-500",
  outline:
    "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 focus-visible:ring-blue-500",
  ghost:
    "bg-transparent text-slate-800 hover:bg-slate-100 focus-visible:ring-blue-500",
  destructive:
    "bg-red-500 text-white shadow hover:bg-red-600 focus-visible:ring-red-500",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-5 py-2.5 text-base rounded-xl",
};

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

// PUBLIC_INTERFACE
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      block = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const classes = [
      "inline-flex items-center justify-center gap-2 transition outline-none focus-visible:ring-2",
      sizeClass[size],
      variantClass[variant],
      block ? "w-full" : "",
      disabled || loading ? "opacity-60 cursor-not-allowed" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Spinner className="h-4 w-4" />
            <span className="sr-only">Loading</span>
          </>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
