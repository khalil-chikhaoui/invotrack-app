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
const PT_TO_CM = 28.35; 
const PAGE_WIDTH = 220;
const PADDING_HORIZ = 10;
const CONTENT_WIDTH = PAGE_WIDTH - PADDING_HORIZ * 2;
const DESC_COL_WIDTH = CONTENT_WIDTH * 0.55; 

// Vertical heights for the dynamic engine
const H_HEADER_BRAND = 25; 
const H_HEADER_ADDR = 25;  
const H_DIVIDER = 13;      
const H_INFO_ROW = 10;     
const H_TABLE_HEAD = 18;   
const H_TOTAL_ROW = 12;    
const H_GRAND_TOTAL = 25;  
const H_QR_SECTION = 60;   
const H_BOTTOM_SPACER = PT_TO_CM; 

const styles = StyleSheet.create({
  page: {
    padding: `15 ${PADDING_HORIZ} 0 ${PADDING_HORIZ}`,
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
  qrContainer: { 
    marginTop: 10, 
    alignItems: "center",
    height: 50, 
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

  // --- DYNAMIC HEIGHT ENGINE ---
  const pageHeight = useMemo(() => {
    let h = 15; // Initial Top Padding

    // 1. Header & Brand
    h += H_HEADER_BRAND + H_HEADER_ADDR; 
    h += H_DIVIDER; 

    // 2. Info Rows (Receipt No, Date, Client Name + Optional Due Date)
    const activeInfoRows = invoice.dueDate ? 4 : 3;
    h += (H_INFO_ROW * activeInfoRows) + 6; 
    h += H_TABLE_HEAD;

    // 3. Line Items (Calculates multi-line wrapping)
    invoice.items.forEach((item) => {
      const name = t(item.name) || item.name || "";
      const estLines = Math.ceil((name.length * 4.5) / DESC_COL_WIDTH);
      const lines = Math.max(1, estLines);
      h += (lines * 9) + 4; 
    });

    h += H_DIVIDER;

    // 4. Totals Block
    h += H_TOTAL_ROW * 2; 
    if (invoice.totalDiscount > 0) h += H_TOTAL_ROW; 
    h += H_GRAND_TOTAL;

    // 5. QR and Cutting Spacer
    h += H_QR_SECTION;
    h += H_BOTTOM_SPACER;

    return h;
  }, [invoice.items, invoice.totalDiscount, invoice.dueDate, t]);

  return (
    <Page size={[PAGE_WIDTH, pageHeight]} style={styles.page}>
      {/* BRANDING */}
      <View style={styles.centered}>
        <Text style={styles.brandName}>{business.name}</Text>
        <Text style={styles.addressText}>{business.address?.street}</Text>
        <Text style={styles.addressText}>
          {business.address?.city} {business.address?.zipCode}
        </Text>
      </View>

      <View style={styles.dashedLine} />

      {/* METADATA INFO */}
      <View style={styles.receiptInfo}>
        <Text style={styles.infoRow}>
          {t("receiptNo") || "Receipt No"}: {invoice.invoiceNumber}
        </Text>
        <Text style={styles.infoRow}>
          {t("dateLabel") || "Date"}:{" "}
          {formatDate(new Date(invoice.issueDate), "dd/MM/yy HH:mm", {
            locale,
          })}
        </Text>

        {/* --- DUE DATE ROW --- */}
        {invoice.dueDate && (
          <Text style={styles.infoRow}>
            {t("dueDate") || "Due Date"}:{" "}
            {formatDate(new Date(invoice.dueDate), "dd/MM/yy", {
              locale,
            })}
          </Text>
        )}

        <Text style={styles.infoRow}>
          {t("clientLabel") || "Client"}: {t(invoice.clientSnapshot.name) || invoice.clientSnapshot.name}
        </Text>
      </View>

      {/* ITEMS TABLE */}
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

      {/* FINANCIAL SUMMARY */}
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

      {/* QR CODE & FOOTER */}
      <View style={styles.qrContainer}>
        <InvoiceQRCode url={qrUrl} size={50} />
      </View>
    </Page>
  );
}