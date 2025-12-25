"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * Select
 * A native select with label, helper text, and error state.
 */
export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  description?: string;
  error?: string;
  options?: SelectOption[];
  requiredAsterisk?: boolean;
}

let idCounter = 0;
const genId = (prefix = "sel") => `${prefix}-${++idCounter}`;

// PUBLIC_INTERFACE
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      label,
      description,
      error,
      options,
      className = "",
      required,
      requiredAsterisk = true,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || genId();
    const descId = description ? `${selectId}-desc` : undefined;
    const errId = error ? `${selectId}-err` : undefined;
    const describedBy = [descId, errId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full">
        {label ? (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-slate-800"
          >
            {label}{" "}
            {required && requiredAsterisk ? (
              <span className="text-red-600">*</span>
            ) : null}
          </label>
        ) : null}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/40 ${
              error ? "border-red-300 ring-1 ring-inset ring-red-200" : "border-slate-200"
            } ${className}`}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy}
            required={required}
            {...props}
          >
            {options
              ? options.map((o) => (
                  <option key={o.value} value={o.value} disabled={o.disabled}>
                    {o.label}
                  </option>
                ))
              : children}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
          >
            <path
              d="M6 9l6 6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
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
Select.displayName = "Select";
