"use client";

import { useEffect } from "react";
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

/**
 * The one dialog shell for the whole admin panel — create/edit forms,
 * confirmations and wizards all mount inside this so the overlay, escape
 * handling, scroll locking and footer placement behave identically
 * everywhere. Body scroll is locked while open and Escape closes it.
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
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div className="fixed inset-0 bg-[#231F20]/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
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
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 rounded-lg p-1.5 text-[#231F20]/40 transition hover:bg-[#F4F7FE] hover:text-[#231F20]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

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
