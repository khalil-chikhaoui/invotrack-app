import { useMemo } from "react";
import { Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { InvoiceTemplateProps } from "./InvoicePDF";
import { formatMoney } from "../../../hooks/formatMoney";
import { formatDate } from "date-fns";
import InvoiceQRCode from "../InvoiceQRCode";

const getFontSrc = (n: string) =>
  typeof window !== "undefined"
    ? `${window.location.origin}/fonts/${n}`
    : `/fonts/${n}`;

Font.register({
  family: "ReceiptMono",
  fonts: [
    { src: getFontSrc("Cairo-Regular.ttf"), fontWeight: 400 },
    { src: getFontSrc("Cairo-Bold.ttf"), fontWeight: 700 },
  ],
});

// --- CONSTANTS FOR LAYOUT CALCULATION (in points) ---
const PT_TO_CM = 28.35; // 1cm approx 28.35pt
const PAGE_WIDTH = 220;
const PADDING_HORIZ = 10;
const CONTENT_WIDTH = PAGE_WIDTH - PADDING_HORIZ * 2;
const DESC_COL_WIDTH = CONTENT_WIDTH * 0.55; // 55% of content width

// Vertical heights of static elements
const H_HEADER_BRAND = 25; // Logo/Name area
const H_HEADER_ADDR = 25;  // Address lines
const H_DIVIDER = 13;      // Dashed line + margins
const H_INFO_ROW = 10;     // Each info line (Date, Client...)
const H_TABLE_HEAD = 18;   // Table header row
const H_TOTAL_ROW = 12;    // Subtotal/Tax rows
const H_GRAND_TOTAL = 25;  // Grand total area
const H_QR_SECTION = 60;   // QR Container (50 size + 10 margin)
const H_BOTTOM_SPACER = PT_TO_CM; // Exactly 1cm bottom padding

const styles = StyleSheet.create({
  page: {
    padding: `15 ${PADDING_HORIZ} 0 ${PADDING_HORIZ}`, // Top, Right, Bottom=0 (handled by height), Left
    fontFamily: "ReceiptMono",
    fontSize: 8,
    color: "#000",
    lineHeight: 1.2,
  },
  centered: { alignItems: "center", textAlign: "center", marginBottom: 8 },
  brandName: {
    fontSize: 12,
    fontWeight: 700,
    
    marginBottom: 10,
  },
  addressText: { fontSize: 7, opacity: 0.8, marginBottom: 1 },
  dashedLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderStyle: "dashed",
    marginVertical: 6,
  },
  receiptInfo: { marginBottom: 6, fontSize: 7 },
  infoRow: { marginBottom: 1 }, 
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomStyle: "dashed",
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableRow: { 
    flexDirection: "row", 
    marginBottom: 4,
    alignItems: "flex-start" 
  },
  colDesc: { width: "55%" },
  colQty: { width: "15%", textAlign: "center" },
  colTotal: { width: "30%", textAlign: "right" },
  totalsSection: { marginTop: 4 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopStyle: "dashed",
    fontSize: 10,
    fontWeight: 700,
  },
  // The footer pushes the QR code to have the margin visually, 
  // but the page height ensures the cut is 1cm below it.
  qrContainer: { 
    marginTop: 10, 
    alignItems: "center",
    height: 50, // Fixed height for calculation
    justifyContent: "center"
  },
});

export default function TemplateReceipt({
  invoice,
  business,
  t,
  locale,
}: InvoiceTemplateProps) {
  const format = (amt: number) =>
    formatMoney(amt, business.currency, business.currencyFormat);

  // --- QR CODE URL ---
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrUrl = `${baseUrl}/invoice/${invoice._id}/view?style=Receipt&lang=${business.language}`;

  // --- PRECISE HEIGHT CALCULATION ---
  const pageHeight = useMemo(() => {
    let h = 15; // Top Padding

    // 1. Header Section
    h += H_HEADER_BRAND + H_HEADER_ADDR; 
    h += H_DIVIDER; 
    h += (H_INFO_ROW * 3) + 6; // 3 rows (No, Date, Client) + margin
    h += H_TABLE_HEAD;

    // 2. Dynamic Items Section
    // Estimate text wrapping: Avg char width approx 4.5pt.
    invoice.items.forEach((item) => {
      const name = t(item.name) || item.name || "";
      // Estimate lines: (Length * AvgCharWidth) / ColumnWidth
      const estLines = Math.ceil((name.length * 4.5) / DESC_COL_WIDTH);
      const lines = Math.max(1, estLines);
      
      // Height = (Lines * LineHeight) + MarginBottom
      h += (lines * 9) + 4; // 9pt per line text, 4pt margin
    });

    h += H_DIVIDER;

    // 3. Totals Section
    h += H_TOTAL_ROW * 2; // Subtotal + Tax
    if (invoice.totalDiscount > 0) h += H_TOTAL_ROW; // Discount
    h += H_GRAND_TOTAL;

    // 4. Footer & QR
    h += H_QR_SECTION;

    // 5. The "1cm from down" Spacer
    h += H_BOTTOM_SPACER;

    return h;
  }, [invoice.items, invoice.totalDiscount, t]);

  return (
    <Page size={[PAGE_WIDTH, pageHeight]} style={styles.page}>
      {/* HEADER */}
      <View style={styles.centered}>
        <Text style={styles.brandName}>{business.name}</Text>
        <Text style={styles.addressText}>{business.address?.street}</Text>
        <Text style={styles.addressText}>
          {business.address?.city} {business.address?.zipCode}
        </Text>
      </View>

      <View style={styles.dashedLine} />

      {/* INFO */}
      <View style={styles.receiptInfo}>
        <Text style={styles.infoRow}>{t("receiptNo")}: {invoice.invoiceNumber}</Text>
        <Text style={styles.infoRow}>
          {t("dateLabel")}:{" "}
          {formatDate(new Date(invoice.issueDate), "dd/MM/yy HH:mm", {
            locale,
          })}
        </Text>
        <Text style={styles.infoRow}>{t("clientLabel")}: {t(invoice.clientSnapshot.name) || invoice.clientSnapshot.name}</Text>
      </View>

      {/* TABLE */}
      <View style={styles.tableHeader}>
        <Text style={styles.colDesc}>{t("description")}</Text>
        <Text style={styles.colQty}>{t("qty")}</Text>
        <Text style={styles.colTotal}>{t("total")}</Text>
      </View>

      {invoice.items.map((item, i) => (
        <View key={i} style={styles.tableRow} wrap={false}>
          <Text style={styles.colDesc}>{t(item.name)}</Text>
          <Text style={styles.colQty}>{item.quantity}</Text>
          <Text style={styles.colTotal}>{format(item.total)}</Text>
        </View>
      ))}

      <View style={styles.dashedLine} />

      {/* TOTALS */}
      <View style={styles.totalsSection} wrap={false}>
        <View style={styles.totalRow}>
          <Text>{t("subtotal")}</Text>
          <Text>{format(invoice.subTotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>
            {t("tax")} ({invoice.taxRate}%)
          </Text>
          <Text>{format(invoice.totalTax)}</Text>
        </View>
        {invoice.totalDiscount > 0 && (
          <View style={styles.totalRow}>
            <Text>{t("discount")}</Text>
            <Text>-{format(invoice.totalDiscount)}</Text>
          </View>
        )}
        <View style={styles.grandTotal}>
          <Text>{t("total").toUpperCase()}</Text>
          <Text>{format(invoice.grandTotal)}</Text>
        </View>
      </View>

      {/* QR CODE - Positioned at bottom flow */}
      <View style={styles.qrContainer}>
        <InvoiceQRCode url={qrUrl} size={50} />
      </View>
      
      {/* The Page height calculation guarantees exactly ~1cm (28pt) of empty space below this point */}
    </Page>
  );
}