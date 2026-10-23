"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Alert, Modal, btnPrimary, btnSecondary } from "@/components/admin/ui";

/** Minimal RFC-4180 CSV reader: quoted fields, escaped quotes, commas and newlines inside quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

const ALIASES: Record<string, string[]> = {
  name: ["name", "full name", "contact name", "contact", "lead"],
  phone: ["phone", "mobile", "phone number", "whatsapp", "contact number"],
  email: ["email", "e-mail", "email address"],
  company: ["company", "business", "organization", "organisation", "company name"],
  location: ["location", "city", "address", "country"],
  source: ["source", "lead source"],
  value: ["value", "estimated value", "expected value", "amount", "budget"],
  currency: ["currency"],
  notes: ["notes", "message", "details", "comments", "note"],
};

export default function ImportLeadsModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function onFile(file: File | null) {
    setError(null);
    setDone(null);
    setRows([]);
    if (!file) return;
    setFileName(file.name);
    const table = parseCsv(await file.text());
    if (table.length < 2) return setError("The file needs a header row and at least one lead.");
    const header = table[0].map((h) => h.trim().toLowerCase());
    const col: Record<string, number> = {};
    for (const [field, names] of Object.entries(ALIASES)) col[field] = header.findIndex((h) => names.includes(h));
    if (col.name === -1) return setError('Add a "Name" column to the first row of your file.');
    setRows(table.slice(1).map((r) => Object.fromEntries(Object.entries(col).map(([f, i]) => [f, i >= 0 ? (r[i] ?? "").trim() : ""]))));
  }

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows }) });
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        const skipped = json?.skipped?.length ? ` (${json.skipped.length} rows skipped)` : "";
        return setError((json?.error ?? "Could not import.") + skipped);
      }
      setDone(`Imported ${json.imported} lead${json.imported === 1 ? "" : "s"}${json.skipped?.length ? `. Skipped ${json.skipped.length}: ${json.skipped.slice(0, 5).map((s: { row: number; reason: string }) => `row ${s.row} (${s.reason})`).join(", ")}${json.skipped.length > 5 ? "..." : ""}` : "."}`);
      setRows([]);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnSecondary}>
        <Upload className="h-4 w-4" /> Import
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Import leads"
        description="Upload a CSV. Columns are matched by name: Name, Phone, Email, Company, Location, Source, Value, Notes."
        footer={
          <>
            <button className={btnSecondary} onClick={() => setOpen(false)}>
              Close
            </button>
            <button className={`${btnPrimary} ml-auto`} disabled={busy || rows.length === 0} onClick={run}>
              {busy ? "Importing..." : rows.length ? `Import ${rows.length} lead${rows.length === 1 ? "" : "s"}` : "Import"}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#1A14A5] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white" />
          {fileName && rows.length > 0 && (
            <p className="text-sm text-[#231F20]/70">
              <strong>{fileName}</strong>: {rows.length} row{rows.length === 1 ? "" : "s"} ready. Each lead needs a name and a phone or email; the rest are skipped and listed afterwards. They land in your first stage.
            </p>
          )}
          {error && <Alert tone="error">{error}</Alert>}
          {done && <Alert tone="success">{done}</Alert>}
          <p className="text-xs text-[#231F20]/50">Export from Excel or Google Sheets as &quot;CSV (comma delimited)&quot;. Up to 500 leads at a time.</p>
        </div>
      </Modal>
    </>
  );
}
