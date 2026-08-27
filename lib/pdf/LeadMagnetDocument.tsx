import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { LeadMagnet } from "@/lib/lead-magnets";

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
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  logo: { width: 32, height: 32, borderRadius: 6 },
  brandName: { fontSize: 12, fontWeight: 700, color: BRAND_BLUE },
  coverBand: {
    backgroundColor: BRAND_BG,
    borderRadius: 10,
    padding: 24,
    marginBottom: 24,
  },
  title: { fontSize: 22, fontWeight: 700, color: BRAND_DARK, marginBottom: 6 },
  subtitle: { fontSize: 11, color: MUTED },
  itemRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 10 },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: BRAND_BLUE,
    borderRadius: 3,
    marginTop: 1,
  },
  itemText: { fontSize: 10, color: BRAND_DARK, lineHeight: 1.4, flex: 1 },
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

interface LeadMagnetDocumentProps {
  magnet: LeadMagnet;
  /** Buffer of the BSH logo PNG, read from public/ at request time — see the API route. */
  logoBuffer: Buffer;
  siteHost: string;
}

export function LeadMagnetDocument({ magnet, logoBuffer, siteHost }: LeadMagnetDocumentProps) {
  return (
    <Document title={magnet.pdfTitle} author="BSH Solutions">
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image is a PDF
              drawing primitive, not an HTML <img>; it has no alt prop in its API. */}
          <Image src={{ data: logoBuffer, format: "png" }} style={styles.logo} />
          <Text style={styles.brandName}>BSH Solutions</Text>
        </View>

        <View style={styles.coverBand}>
          <Text style={styles.title}>{magnet.pdfTitle}</Text>
          <Text style={styles.subtitle}>{magnet.pdfSubtitle}</Text>
        </View>

        {magnet.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <View style={styles.checkbox} />
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>BSH Solutions — Business Smart Hub</Text>
          <Text style={styles.footerText}>{siteHost} · Want a hand working through this list? Book a free consultation.</Text>
        </View>
      </Page>
    </Document>
  );
}
