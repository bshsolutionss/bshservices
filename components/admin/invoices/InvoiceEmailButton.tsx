"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Paperclip } from "lucide-react";
import { Alert, Modal, TextField, TextareaField, btnGhost, btnPrimary, btnSecondary } from "@/components/admin/ui";

interface InvoiceEmailButtonProps {
  invoiceId: string;
  invoiceNumber: string;
  /** The client's contact email - pre-filled, still editable. */
  clientEmail: string;
  defaultMessage: string;
  /** Whether it has been emailed before, so the button can say "Resend". */
  alreadyEmailed: boolean;
  /** Draft invoices become "sent" once emailed - the dialog says so. */
  isDraft: boolean;
}

/** Email the invoice PDF to the client from the panel, with an editable message. */
export default function InvoiceEmailButton({
  invoiceId,
  invoiceNumber,
  clientEmail,
  defaultMessage,
  alreadyEmailed,
  isDraft,
}: InvoiceEmailButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(clientEmail);
  const [subject, setSubject] = useState(`Invoice ${invoiceNumber} from BSH Solutions`);
  const [message, setMessage] = useState(defaultMessage);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setError(null);
    setDone(null);
  };

  const send = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: to.trim(), subject: subject.trim(), message: message.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not send the invoice.");
      setDone(`Sent to ${body.sent_to}${body.marked_sent ? " and marked as sent" : ""}.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the invoice.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={isDraft ? btnPrimary : btnSecondary}>
        <Mail className="h-4 w-4" />
        {alreadyEmailed ? "Resend by email" : "Email to client"}
      </button>

      <Modal
        open={open}
        onClose={close}
        title={`Email ${invoiceNumber}`}
        description="The PDF is attached automatically."
        size="md"
        footer={
          done ? (
            <button type="button" className={`${btnPrimary} ml-auto`} onClick={close}>
              Done
            </button>
          ) : (
            <>
              <button type="button" className={btnGhost} onClick={close}>
                Cancel
              </button>
              <button type="button" className={`${btnPrimary} ml-auto`} onClick={send} disabled={sending}>
                <Mail className="h-4 w-4" />
                {sending ? "Sending…" : "Send invoice"}
              </button>
            </>
          )
        }
      >
        {done ? (
          <Alert tone="success">{done}</Alert>
        ) : (
          <div className="space-y-4">
            <TextField id="inv-mail-to" label="To" type="email" required value={to} onChange={setTo} />
            <TextField id="inv-mail-subject" label="Subject" value={subject} onChange={setSubject} />
            <TextareaField id="inv-mail-msg" label="Message" rows={5} value={message} onChange={setMessage} />
            <p className="flex items-center gap-1.5 text-xs text-[#231F20]/55">
              <Paperclip className="h-3.5 w-3.5" />
              {invoiceNumber}.pdf
              {isDraft && " · the invoice will be marked as sent"}
            </p>
            {error && <Alert tone="error">{error}</Alert>}
          </div>
        )}
      </Modal>
    </>
  );
}
