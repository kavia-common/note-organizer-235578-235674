"use client";

import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
};

/**
 * PUBLIC_INTERFACE
 * Retro-styled button component.
 */
export function Button({ variant = "primary", size = "md", className = "", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md border-2 transition-colors " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg)] " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm";

  const variants: Record<string, string> = {
    primary:
      "bg-[var(--accent)] text-black border-black shadow-[3px_3px_0_0_#000] hover:shadow-[1px_1px_0_0_#000]",
    ghost:
      "bg-[var(--surface)] text-[var(--text)] border-black shadow-[3px_3px_0_0_#000] hover:bg-[var(--surface2)]",
    danger:
      "bg-[var(--danger)] text-black border-black shadow-[3px_3px_0_0_#000] hover:shadow-[1px_1px_0_0_#000]",
  };

  return <button className={`${base} ${sizes} ${variants[variant]} ${className}`} {...props} />;
}
