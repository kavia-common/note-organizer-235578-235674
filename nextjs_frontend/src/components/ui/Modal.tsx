"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
};

/**
 * PUBLIC_INTERFACE
 * Accessible retro-styled modal dialog.
 */
export function Modal({ open, title, children, onClose, footer }: Props) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl rounded-lg border-2 border-black bg-[var(--surface)] p-4 shadow-[6px_6px_0_0_#000]">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="mt-4">{children}</div>

        <div className="mt-4 flex items-center justify-end gap-2">
          {footer ? footer : <Button variant="ghost" onClick={onClose}>Done</Button>}
        </div>
      </div>
    </div>
  );
}
