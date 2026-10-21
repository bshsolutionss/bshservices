"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Short line under the title explaining what this dialog does. */
  description?: string;
  /** Sticky footer slot — actions belong here so every dialog puts them in the same place. */
  footer?: React.ReactNode;
  /** Optional strip between the title and the body (e.g. a Stepper). */
  header?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

const SIZES: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The one dialog shell for the whole admin panel — create/edit forms,
 * confirmations and wizards all mount inside this so the overlay, escape
 * handling, scroll locking and footer placement behave identically everywhere.
 *
 * Built-in safety and accessibility, so no form has to remember them:
 *  - typing anything marks the dialog "unsaved"; closing it with Escape, the
 *    backdrop or the X then asks before throwing the work away, and closing
 *    the browser tab warns too;
 *  - focus moves into the dialog, stays inside while Tab-ing, and returns to
 *    the button that opened it.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  header,
  size = "md",
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [dirty, setDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const requestClose = useCallback(() => {
    if (dirty) setConfirmDiscard(true);
    else onClose();
  }, [dirty, onClose]);

  // Always call the freshest version from the long-lived key listener.
  const requestCloseRef = useRef(requestClose);
  requestCloseRef.current = requestClose;

  useEffect(() => {
    if (open) return;
    setDirty(false);
    setConfirmDiscard(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        requestCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Put the cursor in the first field (unless a field already grabbed focus via autoFocus).
    const timer = window.setTimeout(() => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.contains(document.activeElement)) return;
      dialog.querySelector<HTMLElement>("input:not([type=hidden]):not([disabled]), select, textarea")?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open || !dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [open, dirty]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div className="fixed inset-0 bg-[#231F20]/40 backdrop-blur-[2px]" onClick={requestClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onInputCapture={() => setDirty(true)}
        className={cn(
          "relative z-10 my-auto w-full rounded-2xl bg-white shadow-2xl ring-1 ring-[#1A14A5]/10",
          SIZES[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#1A14A5]/10 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-[#231F20]">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-[#231F20]/55">{description}</p>}
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            title="Close"
            className="-mr-1 rounded-lg p-1.5 text-[#231F20]/40 transition hover:bg-[#F4F7FE] hover:text-[#231F20]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {confirmDiscard && (
          <div role="alertdialog" aria-label="Discard changes?" className="flex flex-wrap items-center gap-3 border-b border-amber-100 bg-amber-50 px-5 py-3 text-sm sm:px-6">
            <p className="flex-1 font-medium text-amber-900">You have unsaved changes. Close without saving?</p>
            <button
              type="button"
              onClick={() => setConfirmDiscard(false)}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#231F20] ring-1 ring-amber-200 hover:bg-amber-100"
            >
              Keep editing
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmDiscard(false);
                setDirty(false);
                onClose();
              }}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
            >
              Discard changes
            </button>
          </div>
        )}

        {header && <div className="border-b border-[#1A14A5]/10 px-5 py-4 sm:px-6">{header}</div>}

        <div className="px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center gap-3 rounded-b-2xl border-t border-[#1A14A5]/10 bg-[#F4F7FE]/60 px-5 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
