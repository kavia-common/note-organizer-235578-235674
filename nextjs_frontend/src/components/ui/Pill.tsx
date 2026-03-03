"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  title?: string;
};

/**
 * PUBLIC_INTERFACE
 * Clickable retro pill for tags/filters.
 */
export function Pill({ children, active, onClick, title }: Props) {
  const cls =
    "inline-flex items-center rounded-full border-2 border-black px-3 py-1 text-xs font-semibold " +
    "shadow-[2px_2px_0_0_#000] transition-colors " +
    (active
      ? "bg-[var(--accent)] text-black"
      : "bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)]");

  if (!onClick) return <span className={cls} title={title}>{children}</span>;

  return (
    <button type="button" className={cls} onClick={onClick} title={title}>
      {children}
    </button>
  );
}
