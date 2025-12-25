"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * Input
 * A text input with label, description (helper), and error message support.
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  description?: string;
  error?: string;
  requiredAsterisk?: boolean;
}

let idCounter = 0;
const genId = (prefix = "input") => `${prefix}-${++idCounter}`;

// PUBLIC_INTERFACE
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      description,
      error,
      className = "",
      required,
      requiredAsterisk = true,
      ...props
    },
    ref
  ) => {
    const inputId = id || genId("inp");
    const descId = description ? `${inputId}-desc` : undefined;
    const errId = error ? `${inputId}-err` : undefined;
    const describedBy = [descId, errId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full">
        {label ? (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-slate-800"
          >
            {label}{" "}
            {required && requiredAsterisk ? (
              <span className="text-red-600">*</span>
            ) : null}
          </label>
        ) : null}
        <input
          id={inputId}
          ref={ref}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-500/40 ${
            error ? "border-red-300 ring-1 ring-inset ring-red-200" : "border-slate-200"
          } ${className}`}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          required={required}
          {...props}
        />
        {description ? (
          <p id={descId} className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        ) : null}
        {error ? (
          <p id={errId} className="mt-1 text-xs text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
