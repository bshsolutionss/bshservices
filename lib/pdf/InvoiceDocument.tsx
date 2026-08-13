import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { Invoice, Payment, PaymentMethod } from "@/lib/invoices";
import { INVOICE_STATUS_LABELS, PAYMENT_METHOD_LABELS, formatMoney } from "@/lib/invoices";
import type { Client } from "@/lib/clients";

const BRAND_BLUE = "#1A14A5";
const BRAND_DARK = "#231F20";
const BRAND_BG = "#F4F7FE";
const MUTED = "#6B7280";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: BRAND_DARK,
    fontFamily: "Helvetica",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  logo: { width: 40, height: 40, marginBottom: 6, borderRadius: 6 },
  brandName: { fontSize: 14, fontWeight: 700, color: BRAND_BLUE },
  brandTagline: { fontSize: 8, color: MUTED, marginTop: 2 },
  invoiceTitle: { fontSize: 22, fontWeight: 700, color: BRAND_DARK, textAlign: "right" },
  invoiceMeta: { fontSize: 9, color: MUTED, textAlign: "right", marginTop: 4 },
  statusBadge: {
    alignSelf: "flex-end",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 9,
    fontWeight: 700,
  },
  partiesRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  partyBlock: { width: "45%" },
  partyLabel: { fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  partyName: { fontSize: 11, fontWeight: 700, color: BRAND_DARK, marginBottom: 2 },
  partyLine: { fontSize: 9, color: MUTED, marginBottom: 1 },
  summaryTable: {
    backgroundColor: BRAND_BG,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  summaryLabel: { fontSize: 9, color: MUTED },
  summaryValue: { fontSize: 9, color: BRAND_DARK },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 8, marginTop: 4, borderTopWidth: 1, borderTopColor: "#E2E4F5" },
  totalLabel: { fontSize: 11, fontWeight: 700, color: BRAND_DARK },
  totalValue: { fontSize: 11, fontWeight: 700, color: BRAND_BLUE },
  balanceRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 6 },
  balanceLabel: { fontSize: 10, fontWeight: 700, color: BRAND_DARK },
  balanceValue: { fontSize: 10, fontWeight: 700, color: "#991B1B" },
  sectionTitle: { fontSize: 10, fontWeight: 700, color: BRAND_DARK, marginBottom: 8 },
  paymentsTable: { marginBottom: 24 },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E4F5",
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableRow: { flexDirection: "row", paddingVertical: 3 },
  colDate: { width: "20%", fontSize: 9, color: BRAND_DARK },
  colMethod: { width: "30%", fontSize: 9, color: BRAND_DARK },
  colRef: { width: "30%", fontSize: 9, color: MUTED },
  colAmount: { width: "20%", fontSize: 9, color: BRAND_DARK, textAlign: "right" },
  tableHeaderText: { fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5 },
  notes: { fontSize: 9, color: MUTED, marginBottom: 24, lineHeight: 1.5 },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E4F5",
    textAlign: "center",
  },
  footerText: { fontSize: 8, color: MUTED, marginBottom: 2 },
  footerBrand: { fontSize: 8, color: BRAND_BLUE, fontWeight: 700 },
});

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: "#F1F1F1", text: "#4B5563" },
  sent: { bg: "#DBEAFE", text: "#1E40AF" },
  paid: { bg: "#D1FAE5", text: "#065F46" },
  partially_paid: { bg: "#FEF3C7", text: "#92400E" },
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

interface InvoiceDocumentProps {
  invoice: Invoice;
  client: Client;
  payments: Payment[];
  paid: number;
  balance: number;
  /** Buffer of the BSH logo PNG, read from public/ at request time — see the PDF route. */
  logoBuffer: Buffer;
}

export function InvoiceDocument({ invoice, client, payments, paid, balance, logoBuffer }: InvoiceDocumentProps) {
  const statusColors = STATUS_COLORS[invoice.status] ?? STATUS_COLORS.draft;

  return (
    <Document title={`Invoice ${invoice.invoice_number}`} author="BSH Solutions">
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image is a PDF
                drawing primitive, not an HTML <img>; it has no alt prop in its API. */}
            <Image src={{ data: logoBuffer, format: "png" }} style={styles.logo} />
            <Text style={styles.brandName}>BSH Solutions</Text>
            <Text style={styles.brandTagline}>Business Smart Hub · bshsolutionss.com</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceMeta}>{invoice.invoice_number}</Text>
            <Text style={styles.invoiceMeta}>Issued {formatDate(invoice.created_at)}</Text>
            <Text style={styles.invoiceMeta}>Due {formatDate(invoice.due_date)}</Text>
            <Text style={[styles.statusBadge, { backgroundColor: statusColors.bg, color: statusColors.text }]}>
              {INVOICE_STATUS_LABELS[invoice.status]}
            </Text>
          </View>
        </View>

        <View style={styles.partiesRow}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>BSH Solutions</Text>
            <Text style={styles.partyLine}>Karachi, Pakistan</Text>
            <Text style={styles.partyLine}>bshsolutionss@gmail.com</Text>
            <Text style={styles.partyLine}>+92 312 8994968</Text>
          </View>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Bill To</Text>
            <Text style={styles.partyName}>{client.company_name}</Text>
            {client.contact_name && <Text style={styles.partyLine}>{client.contact_name}</Text>}
            <Text style={styles.partyLine}>{client.contact_email}</Text>
            {client.contact_phone && <Text style={styles.partyLine}>{client.contact_phone}</Text>}
          </View>
        </View>

        <View style={styles.summaryTable}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount</Text>
            <Text style={styles.summaryValue}>{formatMoney(invoice.amount, invoice.currency)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>{formatMoney(invoice.tax, invoice.currency)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={styles.summaryValue}>-{formatMoney(invoice.discount, invoice.currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatMoney(invoice.total, invoice.currency)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Paid</Text>
            <Text style={styles.summaryValue}>{formatMoney(paid, invoice.currency)}</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Balance Due</Text>
            <Text style={styles.balanceValue}>{formatMoney(balance, invoice.currency)}</Text>
          </View>
        </View>

        {payments.length > 0 && (
          <View style={styles.paymentsTable}>
            <Text style={styles.sectionTitle}>Payments Received</Text>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colDate, styles.tableHeaderText]}>Date</Text>
              <Text style={[styles.colMethod, styles.tableHeaderText]}>Method</Text>
              <Text style={[styles.colRef, styles.tableHeaderText]}>Reference</Text>
              <Text style={[styles.colAmount, styles.tableHeaderText]}>Amount</Text>
            </View>
            {payments.map((payment) => (
              <View key={payment.id} style={styles.tableRow}>
                <Text style={styles.colDate}>{formatDate(payment.paid_on)}</Text>
                <Text style={styles.colMethod}>
                  {payment.method ? PAYMENT_METHOD_LABELS[payment.method as PaymentMethod] : "—"}
                </Text>
                <Text style={styles.colRef}>{payment.reference || "—"}</Text>
                <Text style={styles.colAmount}>{formatMoney(payment.amount, invoice.currency)}</Text>
              </View>
            ))}
          </View>
        )}

        {invoice.notes && (
          <View>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{invoice.notes}</Text>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>BSH Solutions</Text>
          <Text style={styles.footerText}>Thank you for your business.</Text>
          <Text style={styles.footerText}>bshsolutionss.com · bshsolutionss@gmail.com</Text>
        </View>
      </Page>
    </Document>
  );
}
