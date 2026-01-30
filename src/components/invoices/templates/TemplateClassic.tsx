/**
 * @fileoverview TemplateClassic (PDF Layout)
 * Updated: Logo alignment set to flex-start (Left).
 */

import { useMemo } from "react";
import { Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import { InvoiceTemplateProps } from "./InvoicePDF";
import { formatMoney } from "../../../hooks/formatMoney";
import { formatDate } from "date-fns";

const getFontSrc = (fontName: string) => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/fonts/${fontName}`;
  }
  return `/fonts/${fontName}`;
};

// Register localized Cairo font weights
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

// --- 1. STYLES FACTORY ---
const createStyles = (primaryColor: string) =>
  StyleSheet.create({
    page: {
      padding: "20 30 60 30",
      fontFamily: "Cairo",
      fontSize: 10,
      lineHeight: 1.5,
      color: "#111827",
    },
    row: { flexDirection: "row" },
    colLeft: { width: "50%", alignItems: "flex-start" },
    colRight: { width: "50%", alignItems: "flex-end" },
    section: { marginBottom: 15 },
    headerBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 8,
      backgroundColor: primaryColor,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#F3F4F6",
    },
    title: {
      fontSize: 36,
      fontWeight: 800,
      color: primaryColor,
      textTransform: "uppercase",
      lineHeight: 1,
      marginBottom: 15,
    },
    h2: {
      fontSize: 12,
      fontWeight: 700,
      color: primaryColor,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    h3: {
      fontSize: 18,
      fontWeight: 800,
      color: primaryColor,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    text: { fontSize: 10, fontWeight: 400, color: "#333" },
    label: {
      fontSize: 11,
      fontWeight: 500,
      color: primaryColor,
      marginRight: 8,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "rgba(0,0,0,0.02)",
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: "#E5E7EB",
      paddingVertical: 8,
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#F3F4F6",
    },
    th: {
      fontSize: 9,
      fontWeight: 700,
      color: primaryColor,
      textTransform: "uppercase",
    },
    colDesc: { width: "45%", paddingLeft: 8 },
    colQty: { width: "15%", textAlign: "center" },
    colRate: { width: "20%", textAlign: "right" },
    colTotal: { width: "20%", textAlign: "right", paddingRight: 8 },
    summaryBox: {
      width: "48%",
      padding: 10,
      backgroundColor: "rgba(0,0,0,0.02)",
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    grandTotal: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 2,
      borderTopColor: primaryColor,
    },
    footerNote: {
      position: "absolute",
      bottom: 20,
      left: 0,
      right: 0,
      textAlign: "center",
      fontSize: 8,
      color: "#444",
    },
  });

// --- 2. MAIN COMPONENT ---

export default function TemplateClassic({
  invoice,
  business,
  settings,
}: InvoiceTemplateProps) {
  const styles = useMemo(
    () => createStyles(settings.color.primary),
    [settings.color.primary],
  );

  const getLogoDimensions = (size: string) => {
    switch (size) {
      case "Small":
        return { width: 100, height: 50 };
      case "Large":
        return { width: 200, height: 100 };
      default:
        return { width: 140, height: 70 };
    }
  };

  const logoDim = getLogoDimensions(settings.logoSize);
  const format = (amt: number) =>
    formatMoney(amt, business.currency, business.currencyFormat);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.headerBar} />

      {/* 1. Header & Identity */}
      <View style={styles.headerContainer}>
        {/* LEFT COLUMN: Logo and Business Details */}
        <View style={styles.colLeft}>
          {settings.visibility.showLogo && business.logo ? (
            <Image
              src={business.logo}
              style={{
                ...logoDim,
                marginBottom: 8,
                objectFit: "contain",
                objectPosition: "left", // Ensures image anchors to the left
              }}
            />
          ) : (
            <Text style={styles.h3}>{business.name}</Text>
          )}

          <View style={{ alignItems: "flex-start" }}>
            {/* Business Name shown below logo if logo exists */}
            {settings.visibility.showLogo && business.logo && (
              <Text style={[styles.text, { fontWeight: 700, marginBottom: 2 }]}>
                {business.name}
              </Text>
            )}
            <Text style={styles.text}>{business.address?.street}</Text>
            <Text style={styles.text}>
              {business.address?.city} {business.address?.zipCode}
            </Text>
            <Text style={styles.text}>{business.address?.country}</Text>
          </View>
        </View>

        {/* RIGHT COLUMN: Invoice Meta Data */}
        <View style={styles.colRight}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={[styles.h3, { fontSize: 16 }]}>
            #{invoice.invoiceNumber}
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Issue Date:</Text>
            <Text>
              {formatDate(
                new Date(invoice.issueDate || invoice.createdAt),
                "MMMM dd, yyyy",
              )}
            </Text>
          </View>
          {settings.visibility.showDueDate && invoice.dueDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Due Date:</Text>
              <Text>
                {formatDate(new Date(invoice.dueDate), "MMMM dd, yyyy")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 2. Client Identity */}
      <View style={styles.section}>
        <Text style={styles.h2}>Bill to</Text>
        <Text style={[styles.text, { fontWeight: 700, fontSize: 11 }]}>
          {invoice.clientSnapshot.name}
        </Text>
        <Text style={styles.text}>
          {invoice.clientSnapshot.address?.street}
        </Text>
        <Text style={styles.text}>{invoice.clientSnapshot.address?.city}</Text>
        {invoice.clientSnapshot.email && (
          <Text style={styles.text}>{invoice.clientSnapshot.email}</Text>
        )}
      </View>

      {/* 3. Items Table */}
      <View style={styles.section}>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.colDesc]}>Description</Text>
          <Text style={[styles.th, styles.colQty]}>Qty</Text>
          <Text style={[styles.th, styles.colRate]}>Rate</Text>
          <Text style={[styles.th, styles.colTotal]}>Amount</Text>
        </View>
        {invoice.items.map((item, i) => (
          <View key={i} style={styles.tableRow} wrap={false}>
            <Text style={styles.colDesc}>{item.name}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colRate}>{format(item.price)}</Text>
            <Text style={[styles.colTotal, { fontWeight: 700 }]}>
              {format(item.total)}
            </Text>
          </View>
        ))}
      </View>

      {/* 4. Financial Summary */}
      <View style={[styles.row, { justifyContent: "flex-end" }]} wrap={false}>
        <View style={styles.summaryBox}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{format(invoice.subTotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax ({invoice.taxRate}%)</Text>
            <Text>{format(invoice.totalTax)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={{ fontWeight: 700 }}>TOTAL DUE</Text>
            <Text style={{ fontSize: 14, fontWeight: 800 }}>
              {format(invoice.grandTotal)}
            </Text>
          </View>
        </View>
      </View>

      {/* 5. Footer Notes */}
      <View style={{ marginTop: "auto", paddingTop: 20 }}>
        {settings.visibility.showNotes && invoice.notes && (
          <View style={{ marginBottom: 10 }}>
            <Text
              style={[
                styles.text,
                { fontWeight: 700, textTransform: "uppercase", fontSize: 8 },
              ]}
            >
              Notes
            </Text>
            <Text style={styles.text}>{invoice.notes}</Text>
          </View>
        )}
        {settings.visibility.showPaymentTerms && settings.paymentTerms && (
          <View>
            <Text
              style={[
                styles.text,
                { fontWeight: 700, textTransform: "uppercase", fontSize: 8 },
              ]}
            >
              Payment Terms
            </Text>
            <Text style={styles.text}>{settings.paymentTerms}</Text>
          </View>
        )}
      </View>

      {settings.visibility.showFooter && settings.footerNote && (
        <Text style={styles.footerNote} fixed>
          {settings.footerNote}
        </Text>
      )}
    </Page>
  );
}
