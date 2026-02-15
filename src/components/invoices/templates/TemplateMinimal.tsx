import { useMemo } from "react";
import { Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import { InvoiceTemplateProps } from "./InvoicePDF";
import { formatMoney } from "../../../hooks/formatMoney";
import { DEFAULT_COLORS } from "../../../pages/Business/InvoiceSettings";
import { formatDate } from "date-fns";
import InvoiceQRCode from "../InvoiceQRCode";

const getFontSrc = (fontName: string) => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/fonts/${fontName}`;
  }
  return `/fonts/${fontName}`;
};

Font.register({
  family: "Cairo",
  fonts: [
    { src: getFontSrc("Cairo-Light.ttf"), fontWeight: 300 },
    { src: getFontSrc("Cairo-Regular.ttf"), fontWeight: 400 },
    { src: getFontSrc("Cairo-Medium.ttf"), fontWeight: 500 },
    { src: getFontSrc("Cairo-Bold.ttf"), fontWeight: 700 },
    { src: getFontSrc("Cairo-ExtraBold.ttf"), fontWeight: 800 },
  ],
});

const createStyles = (primaryColor: string, accentColor: string) =>
  StyleSheet.create({
    page: {
      padding: "20 30",
      fontFamily: "Cairo",
      fontSize: 9,
      color: "#000",
      lineHeight: 1.3,
      paddingBottom: 60, // Added padding at bottom to prevent overlap with footer
    },
    row: { flexDirection: "row", width: "100%" },
    colHalf: { width: "50%" },
    colRight: { alignItems: "flex-end" },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: primaryColor,
      marginVertical: 10,
      opacity: 0.5,
    },
    dividerLight: {
      borderBottomWidth: 0.5,
      borderBottomColor: "#ccc",
      marginVertical: 4,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 700,
      color: primaryColor,
      textTransform: "uppercase",
      marginBottom: 5,
    },
    businessName: {
      fontSize: 14,
      fontWeight: 700,
      color: primaryColor,
      marginBottom: 8,
      marginTop: 4,
    },
    clientName: {
      fontSize: 14,
      fontWeight: 700,
      color: primaryColor,
      marginBottom: 8,
      marginTop: 4,
    },
    label: {
      fontSize: 8,
      fontWeight: 700,
      color: "#444",
      textTransform: "uppercase",
      marginBottom: 1,
    },
    value: { fontSize: 9, fontWeight: 400, color: "#111" },
    valueBold: { fontSize: 9, fontWeight: 700, color: "#111" },
    textAccent: { color: accentColor },
    tableContainer: { marginTop: 15 },
    tableHeader: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: primaryColor,
      paddingBottom: 4,
      marginBottom: 4,
    },
    tableRow: { flexDirection: "row", paddingVertical: 3 },
    th: {
      fontSize: 8,
      fontWeight: 700,
      color: primaryColor,
      textTransform: "uppercase",
    },
    colDesc: { width: "50%" },
    colQty: { width: "10%", textAlign: "center" },
    colRate: { width: "20%", textAlign: "right" },
    colTotal: { width: "20%", textAlign: "right" },
    totalsContainer: {
      marginTop: 20,
      justifyContent: "flex-end",
      flexDirection: "row",
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 5,
    },
    grandTotalLabel: { fontSize: 11, fontWeight: 700, color: primaryColor },
    grandTotalValue: { fontSize: 14, fontWeight: 700, color: primaryColor },
    footerSection: {
      marginTop: 20,
      borderTopWidth: 1,
      borderTopColor: "#e5e7eb",
      paddingTop: 8,
    },
    // --- New Footer Styles ---
    footerNote: {
      position: "absolute",
      bottom: 20,
      left: 0,
      right: 0,
      textAlign: "center",
      fontSize: 8,
      color: "#444",
    },
    qrFooterLeft: {
      position: "absolute",
      bottom: 20,
      left: 30,
    },
  });

export default function TemplateMinimal({
  invoice,
  business,
  settings,
  t,
}: InvoiceTemplateProps) {
  const styles = useMemo(
    () =>
      createStyles(
        settings.color.primary || DEFAULT_COLORS.primary,
        settings.color.accent || DEFAULT_COLORS.accent,
      ),
    [settings.color],
  );
  const format = (amount: number) =>
    formatMoney(amount, business.currency, business.currencyFormat);

  const getLogoSize = () => {
    switch (settings.logoSize) {
      case "Small":
        return { width: 100, height: 50 };
      case "Large":
        return { width: 200, height: 100 };
      default:
        return { width: 140, height: 70 };
    }
  };

  // --- QR CODE URL GENERATION ---
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrUrl = `${baseUrl}/invoice/${invoice._id}/view?style=Minimal&lang=${business.language}`;

  return (
    <Page size="A4" style={styles.page}>
      <View style={[styles.row, { alignItems: "flex-start" }]}>
        <View style={styles.colHalf}>
          {settings.visibility.showLogo && business.logo ? (
            <Image
              src={business.logo}
              style={{
                ...getLogoSize(),
                objectFit: "contain",
                objectPosition: "left",
              }}
            />
          ) : (
            <Text style={styles.businessName}>{business.name}</Text>
          )}
          <View style={{ marginTop: 4 }}>
            {business.logo && settings.visibility.showLogo && (
              <Text style={styles.businessName}>{business.name}</Text>
            )}
            <Text style={styles.value}>{business.address?.street}</Text>
            <Text style={styles.value}>
              {business.address?.city} {business.address?.zipCode}
            </Text>
            <Text style={styles.value}>{business.address?.country}</Text>
          </View>
        </View>

        <View style={[styles.colHalf, styles.colRight]}>
          <Text style={styles.headerTitle}>{invoice.invoiceNumber}</Text>
          <View style={{ marginTop: 20, alignItems: "flex-end" }}>
            <Text style={[styles.value, { marginTop: 4, fontWeight: 600 }]}>
              {t("issueDate")}:{" "}
              {formatDate(
                new Date(invoice.issueDate || invoice.createdAt),
                "MMMM dd, yyyy",
              )}
            </Text>
            {settings.visibility.showDueDate && invoice.dueDate && (
              <Text style={[styles.value, { marginTop: 4, fontWeight: 600 }]}>
                {t("dueDate")}:{" "}
                {formatDate(new Date(invoice.dueDate), "MMMM dd, yyyy")}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.colHalf}>
          <Text style={styles.clientName}>
            {t("billTo")}: {invoice.clientSnapshot.name}
          </Text>
          <Text style={styles.value}>
            {invoice.clientSnapshot.address?.street}
          </Text>
          <Text style={styles.value}>
            {invoice.clientSnapshot.address?.city}{" "}
            {invoice.clientSnapshot.address?.zipCode}
          </Text>
        </View>
      </View>

      <View style={styles.tableContainer}>
        {/* Fixed: Header repeats */}
        <View style={styles.tableHeader} fixed>
          <Text style={[styles.th, styles.colDesc]}>{t("description")}</Text>
          <Text style={[styles.th, styles.colQty]}>{t("qty")}</Text>
          <Text style={[styles.th, styles.colRate]}>{t("rate")}</Text>
          <Text style={[styles.th, styles.colTotal]}>{t("amount")}</Text>
        </View>

        {invoice.items.map((item, i) => (
          <View key={i} style={styles.tableRow} wrap={false}>
            <Text style={[styles.value, styles.colDesc]}>{t(item.name)}</Text>
            <Text style={[styles.value, styles.colQty]}>{item.quantity}</Text>
            <Text style={[styles.value, styles.colRate]}>
              {format(item.price)}
            </Text>
            <Text style={[styles.valueBold, styles.colTotal]}>
              {format(item.total)}
            </Text>
          </View>
        ))}
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
            marginTop: 4,
          }}
        />
      </View>

      {/* Totals - wrap={false} prevents splitting */}
      <View style={styles.totalsContainer} wrap={false}>
        <View style={{ width: "40%" }}>
          <View style={styles.summaryRow}>
            <Text style={styles.value}>{t("subtotal")}</Text>
            <Text style={styles.value}>{format(invoice.subTotal)}</Text>
          </View>
          {settings.visibility.showDiscount && invoice.totalDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.value, styles.textAccent]}>
                {t("discount")}
              </Text>
              <Text style={[styles.value, styles.textAccent]}>
                -{format(invoice.totalDiscount)}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.value}>
              {t("tax")} ({invoice.taxRate}%)
            </Text>
            <Text style={styles.value}>{format(invoice.totalTax)}</Text>
          </View>
          <View style={styles.dividerLight} />
          <View style={[styles.summaryRow, { alignItems: "center" }]}>
            <Text style={styles.grandTotalLabel}>{t("total")}</Text>
            <Text style={styles.grandTotalValue}>
              {format(invoice.grandTotal)}
            </Text>
          </View>
        </View>
      </View>

      {/* Notes - wrap={false} */}
      <View style={styles.footerSection} wrap={false}>
        <View style={styles.row}>
          {settings.visibility.showNotes && invoice.notes && (
            <View style={{ width: "100%" }}>
              <Text style={styles.label}>{t("notes")}</Text>
              <Text style={[styles.value, { fontSize: 8, color: "#666" }]}>
         {t(invoice.notes)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* --- Footer Note (Center, Fixed) --- */}
      {settings.visibility.showFooter && settings.footerNote && (
        <Text style={styles.footerNote} fixed>
          {settings.footerNote}
        </Text> 
      )}

      {/* --- QR Code (Left Footer, Fixed) --- */}
      <View style={styles.qrFooterLeft} fixed>
        <InvoiceQRCode url={qrUrl} size={70} />
      </View>
    </Page>
  );
}