"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Modal from "./Modal";
import Alert from "./Alert";
import { btnDanger, btnPrimary, btnSecondary } from "./styles";

interface ConfirmButtonProps {
  /** What the trigger button says. */
  label: string;
  /** Dialog heading, e.g. "Delete invoice?". */
  title: string;
  /** What will happen, in plain words — including anything that cascades. */
  message: React.ReactNode;
  confirmLabel?: string;
  /** Runs on confirm. Throw to show the message in the dialog and keep it open. */
  onConfirm: () => Promise<void>;
  tone?: "danger" | "primary";
  /** Trigger styling — "block" fills its container (sidebar cards), "inline" is a plain text button (table rows). */
  display?: "button" | "block" | "inline";
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Every destructive or irreversible action in the admin panel goes through
 * this: one dialog, one place for the warning text, one place where the
 * error shows up if the action fails. Replaces the scattered native
 * `confirm()` calls, which couldn't explain consequences or report failures.
 */
export default function ConfirmButton({
  label,
  title,
  message,
  confirmLabel,
  onConfirm,
  tone = "danger",
  display = "button",
  icon,
  className,
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      await onConfirm();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't work. Try again.");
    } finally {
      setRunning(false);
    }
  };

  const triggerClass =
    display === "inline"
      ? cn("text-xs font-semibold text-red-600 transition hover:underline", className)
      : cn(
          tone === "danger"
            ? "inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            : btnSecondary,
          display === "block" && "w-full",
          className
        );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClass}>
        {icon}
        {label}
      </button>

      <Modal
        open={open}
        onClose={() => (running ? undefined : setOpen(false))}
        title={title}
        size="sm"
        footer={
          <>
            <button type="button" className={btnSecondary} onClick={() => setOpen(false)} disabled={running}>
              Cancel
            </button>
            <button
              type="button"
              className={cn("ml-auto", tone === "danger" ? btnDanger : btnPrimary)}
              onClick={run}
              disabled={running}
            >
              {running ? "Working…" : (confirmLabel ?? label)}
            </button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-[#231F20]/70">
          <div>{message}</div>
          {error && <Alert tone="error">{error}</Alert>}
        </div>
      </Modal>
    </>
  );
}
