/**
 * @fileoverview TemplateModern (PDF Layout)
 * A contemporary invoice design utilizing full-width header blocks and grid-based summaries.
 * Features:
 * 1. Global Font Support: Integrated Cairo font for broad character support.
 * 2. Branding Engine: Left-aligned logo with dynamic sizing and primary color overlays.
 * 3. Layout Control: Zebra-striped table rows and non-wrapping summary containers.
 * 4. PDF Safety: Prevents orphans by locking summary and notes sections together.
 */

import { useMemo } from "react";
import { Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import { InvoiceTemplateProps } from "./InvoicePDF";
import { formatMoney } from "../../../hooks/formatMoney";
import { DEFAULT_COLORS } from "../../../pages/Business/InvoiceSettings";
import { formatDate } from "date-fns";

// --- 1. CONFIGURATION ---

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

// --- 2. STYLES FACTORY ---
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
      paddingBottom: 65,
    },
    // Header Block with negative margin for full-bleed effect
    headerBlock: {
      backgroundColor: primaryColor,
      marginTop: -2 * PAGE_TOP_PADDING,
      padding: `${PAGE_TOP_PADDING + 20} 30 30 30`,
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

    // Recipient Section
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

    // Items Table Grid
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

    // Bottom Content Arrangement
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

    // Financial Summary
    summarySection: { width: "45%" },
    summaryBox: {
      padding: 15,
      backgroundColor: hexToRgba(secondaryColor, 0.05),
      borderRadius: 8,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    grandTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
      paddingTop: 10,
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
  });
};

// --- 3. MAIN COMPONENT ---
export default function TemplateModern({
  invoice,
  business,
  settings,
}: InvoiceTemplateProps) {
  // Use user-defined colors with global safety fallbacks
  const primary = settings.color.primary || DEFAULT_COLORS.primary;
  const accent = settings.color.accent || DEFAULT_COLORS.accent;
  const secondary = settings.color.secondary || DEFAULT_COLORS.secondary;

  // Initialize styles based on branding settings
  const styles = useMemo(
    () => createStyles(primary, accent, secondary),
    [settings.color],
  );
  const logoDim = getLogoDimensions(settings.logoSize);

  const format = (amount: number) => {
    return formatMoney(amount, business.currency, business.currencyFormat);
  };

  return (
    <Page size="A4" style={styles.page}>
      {/* 1. Header Block - Primary Branding Area */}
      <View style={styles.headerBlock}>
        <View style={styles.headerLeft}>
          {settings.visibility.showLogo && business.logo ? (
            <Image
              src={business.logo}
              style={{
                ...logoDim,
                marginBottom: 10,
                objectFit: "contain",
                objectPosition: "left",
              }}
            />
          ) : null}
          <View>
            <Text
              style={[
                styles.businessName,
                {
                  fontSize: settings.visibility.showLogo ? 14 : 18,
                  marginBottom: settings.visibility.showLogo ? 14 : 18,
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
          <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>

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
              Issued Date
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#FFF",
                marginBottom: 6,
              }}
            >
              {formatDate(
                new Date(invoice.issueDate || invoice.createdAt),
                "MMMM dd, yyyy",
              )}
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
                  Due Date
                </Text>
                <Text style={{ fontSize: 10, fontWeight: 700, color: "#FFF" }}>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* 2. Recipient Information Section */}
      <View style={styles.infoSection}>
        <View style={{ width: "100%" }}>
          <Text style={styles.sectionLabel}>Bill To</Text>
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
          {invoice.clientSnapshot.email && (
            <Text style={{ fontSize: 10, marginTop: 2 }}>
              {invoice.clientSnapshot.email}
            </Text>
          )}
        </View>
      </View>

      {/* 3. Line Items Table */}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader} fixed>
          <Text style={[styles.th, styles.colDesc]}>Description</Text>
          <Text style={[styles.th, styles.colQty]}>Qty</Text>
          <Text style={[styles.th, styles.colRate]}>Rate</Text>
          <Text style={[styles.th, styles.colTotal]}>Amount</Text>
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
              {item.name}
            </Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colRate}>{format(item.price)}</Text>
            <Text style={[styles.colTotal, { fontWeight: 700 }]}>
              {format(item.total)}
            </Text>
          </View>
        ))}
      </View>

      {/* 4. Notes & Summary Distribution */}
      <View style={styles.bottomContentContainer} wrap={false}>
        <View style={styles.notesSection}>
          {settings.visibility.showNotes && invoice.notes && (
            <View style={styles.noteGroup}>
              <Text style={styles.noteLabel}>Notes</Text>
              <Text style={styles.noteText}>{invoice.notes}</Text>
            </View>
          )}
          {settings.visibility.showPaymentTerms && settings.paymentTerms && (
            <View style={styles.noteGroup}>
              <Text style={styles.noteLabel}>Terms & Conditions</Text>
              <Text style={styles.noteText}>{settings.paymentTerms}</Text>
            </View>
          )}
        </View>

        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={{ fontWeight: 500 }}>Subtotal</Text>
              <Text style={{ fontWeight: 700 }}>
                {format(invoice.subTotal)}
              </Text>
            </View>

            {settings.visibility.showDiscount && invoice.totalDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={{ color: accent }}>Discount</Text>
                <Text style={{ fontWeight: 700, color: accent }}>
                  -{format(invoice.totalDiscount)}
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={{ fontWeight: 500 }}>Tax ({invoice.taxRate}%)</Text>
              <Text style={{ fontWeight: 700 }}>
                {format(invoice.totalTax)}
              </Text>
            </View>

            <View style={styles.grandTotalRow}>
              <Text style={{ fontWeight: 700, color: primary }}>TOTAL</Text>
              <Text style={{ fontSize: 16, fontWeight: 900, color: primary }}>
                {format(invoice.grandTotal)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 5. Sticky Legal Footer */}
      {settings.visibility.showFooter && settings.footerNote && (
        <Text style={styles.fixedFooter} fixed>
          {settings.footerNote}
        </Text>
      )}
    </Page>
  );
}
