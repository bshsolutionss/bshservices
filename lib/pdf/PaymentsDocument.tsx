import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { formatDate, formatMoney } from "@/lib/invoices";
import type { PaymentRecord } from "@/lib/admin/payments-hub";

const DARK = "#231F20";
const MUTED = "#6B7280";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, color: DARK, fontFamily: "Helvetica" },
  title: { fontSize: 18, fontWeight: 700 },
  sub: { color: MUTED, marginTop: 3, marginBottom: 16 },
  totals: { flexDirection: "row", gap: 10, marginBottom: 18 },
  box: { flex: 1, backgroundColor: "#F4F7FE", borderRadius: 6, padding: 10 },
  boxLabel: { color: MUTED, fontSize: 8, marginBottom: 3 },
  boxValue: { fontSize: 13, fontWeight: 700 },
  head: { flexDirection: "row", backgroundColor: "#231F20", color: "#fff", paddingVertical: 5, paddingHorizontal: 6, fontSize: 8, fontWeight: 700 },
  row: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: "#E5E7EB" },
  cDate: { width: "14%" },
  cType: { width: "12%" },
  cTitle: { width: "44%" },
  cAmount: { width: "30%", textAlign: "right" },
  muted: { color: MUTED, fontSize: 8 },
});

interface Props {
  companyName: string;
  periodLabel: string;
  records: PaymentRecord[];
  totals: { received: string; paidOut: string; net: string };
}

export function PaymentsDocument({ companyName, periodLabel, records, totals }: Props) {
  return (
    <Document title={`Payments - ${periodLabel}`}>
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.title}>{companyName} - payments</Text>
        <Text style={styles.sub}>
          {periodLabel} · {records.length} record{records.length === 1 ? "" : "s"} · amounts in PKR equivalent
        </Text>
        <View style={styles.totals}>
          <View style={styles.box}>
            <Text style={styles.boxLabel}>Received</Text>
            <Text style={styles.boxValue}>{totals.received}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.boxLabel}>Paid out</Text>
            <Text style={styles.boxValue}>{totals.paidOut}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.boxLabel}>Net</Text>
            <Text style={styles.boxValue}>{totals.net}</Text>
          </View>
        </View>
        <View style={styles.head} fixed>
          <Text style={styles.cDate}>Date</Text>
          <Text style={styles.cType}>Type</Text>
          <Text style={styles.cTitle}>Details</Text>
          <Text style={styles.cAmount}>Amount</Text>
        </View>
        {records.map((r) => (
          <View key={`${r.kind}-${r.id}`} style={styles.row} wrap={false}>
            <Text style={styles.cDate}>{formatDate(r.date)}</Text>
            <Text style={styles.cType}>{r.kind === "received" ? "Received" : "Paid out"}</Text>
            <View style={styles.cTitle}>
              <Text>{r.title}</Text>
              {r.subtitle ? <Text style={styles.muted}>{r.subtitle}</Text> : null}
            </View>
            <Text style={styles.cAmount}>
              {r.kind === "received" ? "+" : "-"}
              {formatMoney(r.amount, r.currency)}
            </Text>
          </View>
        ))}
        {records.length === 0 && <Text style={{ ...styles.muted, marginTop: 12 }}>No payments in this period.</Text>}
      </Page>
    </Document>
  );
}
