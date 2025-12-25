"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * Card
 * A surface container with optional header, content, and footer.
 */

// PUBLIC_INTERFACE
export function Card({
  className = "",
  children,
  role,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`card bg-white ${className}`}
      role={role}
      {...props}
    >
      {children}
    </div>
  );
}

// PUBLIC_INTERFACE
export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-4 py-3 border-b border-slate-200/70 ${className}`} {...props}>
      {children}
    </div>
  );
}

// PUBLIC_INTERFACE
export function CardTitle({
  as: As = "h3",
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: React.ElementType }) {
  return (
    <As className={`text-base font-semibold text-slate-900 ${className}`} {...props}>
      {children}
    </As>
  );
}

// PUBLIC_INTERFACE
export function CardDescription({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`mt-1 text-sm text-slate-600 ${className}`} {...props}>
      {children}
    </p>
  );
}

// PUBLIC_INTERFACE
export function CardContent({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-4 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

// PUBLIC_INTERFACE
export function CardFooter({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-4 py-3 border-t border-slate-200/70 ${className}`} {...props}>
      {children}
    </div>
  );
}
