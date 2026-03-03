"use client";

import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

/**
 * PUBLIC_INTERFACE
 * Retro-styled text input component.
 */
export function Input({ label, hint, error, className = "", id, ...props }: Props) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <label className="block" htmlFor={inputId}>
      {label ? <div className="mb-1 text-xs font-semibold">{label}</div> : null}
      <input
        id={inputId}
        className={
          "w-full rounded-md border-2 border-black bg-[var(--surface)] px-3 py-2 text-sm " +
          "shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] " +
          (error ? "ring-2 ring-[var(--danger)] " : "") +
          className
        }
        {...props}
      />
      {error ? (
        <div className="mt-1 text-xs font-semibold text-[var(--danger)]">{error}</div>
      ) : hint ? (
        <div className="mt-1 text-xs opacity-80">{hint}</div>
      ) : null}
    </label>
  );
}
