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

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getLogoDimensions = (size: string) => {
  switch (size) {
    case "Small":
      return { width: 100, height: 50 };
    case "Large":
      return { width: 250, height: 125 };
    default:
      return { width: 150, height: 75 };
  }
};

const createStyles = (
  primaryColor: string,
  accentColor: string,
  secondaryColor: string,
) => {
  const PAGE_TOP_PADDING = 40;
  return StyleSheet.create({
    page: {
      fontFamily: "Cairo",
      fontSize: 10,
      lineHeight: 1.4,
      color: "#333",
      paddingTop: PAGE_TOP_PADDING,
      paddingBottom: 110, // Increased to ensure no overlap with footer
    },
    headerBlock: {
      backgroundColor: primaryColor,
      marginTop: -1 * PAGE_TOP_PADDING, // Fixed potential double-offset
      padding: `20 30 30 30`,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      color: "#FFFFFF",
    },
    headerLeft: { width: "55%", alignItems: "flex-start" },
    headerRight: {
      width: "45%",
      alignItems: "flex-end",
      justifyContent: "center",
    },
    businessName: {
      fontWeight: 700,
      color: "#FFF",
      marginBottom: 4,
      textTransform: "uppercase",
    },
    businessText: { fontSize: 9, color: "#FFF", opacity: 0.9, fontWeight: 300 },
    invoiceNumber: {
      fontSize: 24,
      fontWeight: 900,
      color: "#FFF",
      marginTop: -10,
      marginBottom: 5,
    },
    infoSection: {
      padding: "20 30",
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#F3F4F6",
    },
    sectionLabel: {
      fontSize: 9,
      fontWeight: 700,
      color: secondaryColor,
      textTransform: "uppercase",
      marginBottom: 5,
    },
    tableContainer: { padding: "0 30" },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#F9FAFB",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
    },
    th: {
      fontSize: 9,
      fontWeight: 700,
      color: primaryColor,
      textTransform: "uppercase",
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#F3F4F6",
    },
    colDesc: { width: "50%", paddingLeft: 10 },
    colQty: { width: "15%", textAlign: "center" },
    colRate: { width: "17.5%", textAlign: "right" },
    colTotal: { width: "17.5%", textAlign: "right", paddingRight: 10 },
    bottomContentContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: "20 30 0 30",
      marginTop: 10,
    },
    notesSection: { width: "55%", paddingRight: 20 },
    noteGroup: { marginBottom: 12 },
    noteLabel: {
      fontSize: 9,
      fontWeight: 700,
      color: primaryColor,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    noteText: {
      fontSize: 9,
      color: "#6B7280",
      lineHeight: 1.4,
      textAlign: "justify",
    },
    summarySection: { width: "45%" },
    summaryBox: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: hexToRgba(secondaryColor, 0.02),
      borderRadius: 8,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    deliveryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
      color: primaryColor,
      fontWeight: 700,
    },
    grandTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
      paddingVertical: 10,
      borderTopWidth: 2,
      borderTopColor: primaryColor,
    },
    fixedFooter: {
      position: "absolute",
      bottom: 20,
      left: 40,
      right: 40,
      textAlign: "center",
      fontSize: 8,
      color: "#444",
    },
    qrFooterLeft: {
      position: "absolute",
      bottom: 20,
      left: 30,
      alignItems: "flex-start",
    },
    generatedDate: {
      fontSize: 7.5,
      color: "#222222",
      marginTop: 2,
      fontFamily: "Cairo",
      fontWeight: 700,
    },
  });
};

export default function TemplateModern({
  invoice,
  business,
  settings,
  t,
  locale,
  generatedAt,
}: InvoiceTemplateProps) {
  const primary = settings.color.primary || DEFAULT_COLORS.primary;
  const accent = settings.color.accent || DEFAULT_COLORS.accent;
  const secondary = settings.color.secondary || DEFAULT_COLORS.secondary;
  const styles = useMemo(
    () => createStyles(primary, accent, secondary),
    [primary, accent, secondary],
  );
  const logoDim = getLogoDimensions(settings.logoSize);
  const format = (amt: number) =>
    formatMoney(amt, business.currency, business.currencyFormat);

  const renderDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const formatStr =
      business.language === "en" ? "MMMM dd, yyyy" : "dd MMMM yyyy";
    return formatDate(date, formatStr, { locale });
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrUrl = `${baseUrl}/invoice/${invoice._id}/view?style=Modern&lang=${business.language}`;

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.headerBlock}>
        <View style={styles.headerLeft}>
          {settings.visibility.showLogo && business.logo && (
            <Image
              src={business.logo}
              style={{
                ...logoDim,
                marginBottom: 10,
                objectFit: "contain",
                objectPosition: "left",
              }}
            />
          )}
          <View>
            <Text
              style={[
                styles.businessName,
                {
                  fontSize: settings.visibility.showLogo ? 14 : 18,
                  marginBottom: 10,
                },
              ]}
            >
              {business.name}
            </Text>
            <Text style={styles.businessText}>{business.address?.street}</Text>
            <Text style={styles.businessText}>
              {business.address?.city} {business.address?.zipCode}{" "}
              {business.address?.country}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.invoiceNumber}>
            {t("invoice")} {invoice.invoiceNumber}
          </Text>

          <View style={{ marginTop: 12, alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 9,
                opacity: 0.8,
                fontWeight: 400,
                color: "#FFF",
                textTransform: "uppercase",
                marginTop: 10,
              }}
            >
              {t("issueDate")}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#FFF",
                marginBottom: 6,
              }}
            >
              {renderDate(invoice.issueDate || invoice.createdAt)}
            </Text>
            {settings.visibility.showDueDate && invoice.dueDate && (
              <>
                <Text
                  style={{
                    fontSize: 9,
                    opacity: 0.8,
                    fontWeight: 400,
                    color: "#FFF",
                    textTransform: "uppercase",
                  }}
                >
                  {t("dueDate")}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: 700, color: "#FFF" }}>
                  {renderDate(invoice.dueDate)}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={{ width: "100%" }}>
          <Text style={styles.sectionLabel}>{t("billTo")}</Text>
          <Text style={{ fontWeight: 700, fontSize: 13, marginBottom: 5 }}>
            {invoice.clientSnapshot.name}
          </Text>
          <Text style={{ fontSize: 10 }}>
            {invoice.clientSnapshot.address?.street}
          </Text>
          <Text style={{ fontSize: 10 }}>
            {invoice.clientSnapshot.address?.city}{" "}
            {invoice.clientSnapshot.address?.zipCode}
          </Text>
        </View>
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.tableHeader} fixed>
          <Text style={[styles.th, styles.colDesc]}>{t("description")}</Text>
          <Text style={[styles.th, styles.colQty]}>{t("qty")}</Text>
          <Text style={[styles.th, styles.colRate]}>{t("rate")}</Text>
          <Text style={[styles.th, styles.colTotal]}>{t("amount")}</Text>
        </View>

        {invoice.items.map((item, i) => (
          <View
            key={i}
            style={[
              styles.tableRow,
              {
                backgroundColor:
                  i % 2 !== 0 ? hexToRgba(secondary, 0.08) : "transparent",
              },
            ]}
            wrap={false}
          >
            <Text style={[styles.colDesc, { fontSize: 10, fontWeight: 500 }]}>
              {t(item.name)}
            </Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colRate}>{format(item.price)}</Text>
            <Text style={[styles.colTotal, { fontWeight: 700 }]}>
              {format(item.total)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.bottomContentContainer} wrap={false}>
        <View style={styles.notesSection}>
          {settings.visibility.showNotes && invoice.notes && (
            <View style={styles.noteGroup}>
              <Text style={styles.noteLabel}>{t("notes")}</Text>
              <Text style={styles.noteText}>{t(invoice.notes)}</Text>
            </View>
          )}
        </View>

        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={{ fontWeight: 500 }}>{t("subtotal")}</Text>
              <Text style={{ fontWeight: 700 }}>
                {format(invoice.subTotal)}
              </Text>
            </View>
            {settings.visibility.showDiscount && invoice.totalDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={{ color: accent }}>{t("discount")}</Text>
                <Text style={{ fontWeight: 700, color: accent }}>
                  -{format(invoice.totalDiscount)}
                </Text>
              </View>
            )}
            {invoice.totalTax > 0 && (
              <View style={styles.summaryRow}>
                <Text style={{ fontWeight: 500 }}>
                  {t("tax")} ({invoice.taxRate}%)
                </Text>
                <Text style={{ fontWeight: 700 }}>
                  {format(invoice.totalTax)}
                </Text>
              </View>
            )}

            {/* Delivery Fee Logic: Added after tax to be non-taxable */}
            {invoice.deliveryFee > 0 && (
              <View style={styles.deliveryRow}>
                <Text style={{ fontWeight: 500 }}>{t("delivery")}</Text>
                <Text style={{ fontWeight: 700 }}>
                  +{format(invoice.deliveryFee)}
                </Text>
              </View>
            )}

            <View style={styles.grandTotalRow}>
              <Text style={{ fontSize: 14, fontWeight: 700, color: primary }}>
                {t("totalDue")}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 900, color: primary }}>
                {format(invoice.grandTotal)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Persistent Footers */}
      {settings.visibility.showFooter && settings.footerNote && (
        <Text style={styles.fixedFooter}>{settings.footerNote}</Text>
      )}

      <View style={styles.qrFooterLeft}>
        <InvoiceQRCode url={qrUrl} size={70} />
        <Text style={styles.generatedDate}>{generatedAt}</Text>
      </View>
    </Page>
  );
}
