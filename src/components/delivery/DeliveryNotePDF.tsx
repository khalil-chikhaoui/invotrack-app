import { useMemo } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { enUS, de, fr } from "date-fns/locale";
import { InvoiceData } from "../../apis/invoices";
import { BusinessData } from "../../apis/business";
import { formatMoney } from "../../hooks/formatMoney";
import InvoiceQRCode from "../invoices/InvoiceQRCode";

// --- FONTS ---
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

// --- PDF THEME COLORS (Match app theme) ---
const PDF_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Shipped: { bg: "#EFF6FF", text: "#2563EB" }, // Blue-50 / Blue-600
  Delivered: { bg: "#F0FDF4", text: "#16A34A" }, // Green-50 / Green-600
  Pending: { bg: "#F9FAFB", text: "#6B7280" }, // Gray-50 / Gray-500
  Returned: { bg: "#FEF2F2", text: "#DC2626" }, // Red-50 / Red-600
  Cancelled: { bg: "#FEF2F2", text: "#DC2626" }, // Red-50 / Red-600
};

// --- LOCALIZATION ---
const TRANSLATIONS = {
  en: {
    title: "DELIVERY MANIFEST",
    createdOn: "Created On",
    generatedOn: "Generated On",
    colInvoice: "Invoice #",
    colClient: "Client",
    colDest: "Destination",
    colStatus: "Status",
    colTotal: "Total",
    summaryTitle: "Manifest Summary",
    totalCount: "Total Invoices",
    totalValue: "Total Value",
    notes: "Notes",
    page: "Page",
    of: "of",
    status_pending: "Pending",
    status_shipped: "Shipped",
    status_delivered: "Delivered",
    status_returned: "Returned",
    status_cancelled: "Cancelled",
  },
  fr: {
    title: "BON DE LIVRAISON",
    createdOn: "Créé le",
    generatedOn: "Généré le",
    colInvoice: "Facture N°",
    colClient: "Client",
    colDest: "Destination",
    colStatus: "Statut",
    colTotal: "Total",
    summaryTitle: "Résumé du Manifeste",
    totalCount: "Nb. Factures",
    totalValue: "Valeur Totale",
    notes: "Notes",
    page: "Page",
    of: "sur",
    status_pending: "En attente",
    status_shipped: "Expédié",
    status_delivered: "Livré",
    status_returned: "Retourné",
    status_cancelled: "Annulé",
  },
  de: {
    title: "LIEFERSCHEIN",
    createdOn: "Erstellt am",
    generatedOn: "Generiert am",
    colInvoice: "Rechnung Nr.",
    colClient: "Kunde",
    colDest: "Zielort",
    colStatus: "Status",
    colTotal: "Gesamt",
    summaryTitle: "Zusammenfassung",
    totalCount: "Anzahl Rechnungen",
    totalValue: "Gesamtwert",
    notes: "Hinweise",
    page: "Seite",
    of: "von",
    status_pending: "Ausstehend",
    status_shipped: "Versandt",
    status_delivered: "Zugestellt",
    status_returned: "Retourniert",
    status_cancelled: "Storniert",
  },
};

const DATE_LOCALES: Record<string, any> = { en: enUS, de: de, fr: fr };

// --- STYLES ---
const createStyles = (primaryColor: string) =>
  StyleSheet.create({
    page: {
      fontFamily: "Cairo",
      fontSize: 9,
      color: "#333",
      padding: 30,
      paddingBottom: 60,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      borderBottomWidth: 2,
      borderBottomColor: primaryColor,
      paddingBottom: 15,
    },
    logo: { width: 100, height: 50, objectFit: "contain", marginBottom: 5 },
    brandName: { fontSize: 14, fontWeight: 700, textTransform: "uppercase" },
    brandInfo: { fontSize: 8, color: "#666", marginTop: 2 },
    titleBlock: { alignItems: "flex-end" },
    docTitle: {
      fontSize: 20,
      fontWeight: 800,
      color: primaryColor,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    metaRow: { flexDirection: "row", marginBottom: 2 },
    metaLabel: { fontSize: 8, color: "#666", marginRight: 5 },
    metaValue: { fontSize: 8, fontWeight: 700 },

    table: { marginTop: 10 },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#F3F4F6",
      paddingVertical: 6,
      paddingHorizontal: 5,
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
      alignItems: "center",
    },
    th: {
      fontSize: 7,
      fontWeight: 700,
      color: primaryColor,
      textTransform: "uppercase",
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 8,
      paddingHorizontal: 5,
      borderBottomWidth: 1,
      borderBottomColor: "#F3F4F6",
      alignItems: "center",
      minHeight: 55,
    },
    td: { fontSize: 8, color: "#444" },
    invDate: { fontSize: 7, color: "#666", marginTop: 2 },

    // --- COLUMN WIDTHS ---
    colQR: { width: "12%" },
    colInv: { width: "12%" },
    colClient: { width: "18%" },
    colDest: { width: "36%" },
    colStatus: { width: "12%", alignItems: "flex-start" },
    colTotal: { width: "10%", textAlign: "right" },

    summaryContainer: {
      marginTop: 20,
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    summaryBox: {
      width: "40%",
      backgroundColor: "#F9FAFB",
      padding: 10,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },
    summaryTitle: {
      fontSize: 9,
      fontWeight: 700,
      color: primaryColor,
      marginBottom: 8,
      textTransform: "uppercase",
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
      paddingBottom: 4,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    summaryLabel: { fontSize: 8, color: "#666" },
    summaryValue: { fontSize: 9, fontWeight: 700 },

    notesContainer: {
      marginTop: 20,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: "#E5E7EB",
    },
    notesLabel: {
      fontSize: 8,
      fontWeight: 700,
      color: primaryColor,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    notesText: {
      fontSize: 9,
      color: "#4B5563",
      lineHeight: 1.4,
    },

    footer: {
      position: "absolute",
      bottom: 20,
      left: 30,
      right: 30,
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: "#E5E7EB",
      paddingTop: 10,
    },
    pageNumber: { fontSize: 8, color: "#9CA3AF" },

    // Base Status Style (Color will be injected dynamically)
    statusBase: {
      fontSize: 7,
      fontWeight: 700,
      textTransform: "uppercase",
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 4,
    },
  });

interface DeliveryNotePDFProps {
  invoices: InvoiceData[];
  business: BusinessData;
  user?: { name: string; email: string };
  deliveryNumber?: string;
  createdDate?: string;
  notes?: string; 
}

export default function DeliveryNotePDF({
  invoices,
  business,
  deliveryNumber,
  createdDate,
  notes,
}: DeliveryNotePDFProps) {
  const primaryColor = business.invoiceSettings?.color?.primary || "#231f70";
  const styles = useMemo(() => createStyles(primaryColor), [primaryColor]);

  const lang = (business.language as "en" | "fr" | "de") || "en";
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const locale = DATE_LOCALES[lang] || enUS;

  const totalValue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  const formattedCreatedDate = createdDate
    ? format(new Date(createdDate), "PPP p", { locale })
    : format(new Date(), "PPP p", { locale });

  const formattedGeneratedDate = format(new Date(), "PPP p", { locale });

  const getInvoiceUrl = (invoiceId: string) => {
      return `${window.location.origin}/invoice/${invoiceId}/view?lang=${lang}`;
  };

  return (
    <Document title={`Delivery_Note_${deliveryNumber || "Draft"}`}>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            {business.logo ? (
              <Image src={business.logo} style={styles.logo} />
            ) : (
              <Text style={styles.brandName}>{business.name}</Text>
            )}
            <Text style={styles.brandInfo}>{business.address?.street}</Text>
            <Text style={styles.brandInfo}>
              {business.address?.city}, {business.address?.country}
            </Text>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.docTitle}>{deliveryNumber || t.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>{t.createdOn}:</Text>
              <Text style={styles.metaValue}>{formattedCreatedDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>{t.generatedOn}:</Text>
              <Text style={styles.metaValue}>{formattedGeneratedDate}</Text>
            </View>
          </View>
        </View>

        {/* MANIFEST TABLE */}
        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.th, styles.colQR]}>{}</Text>
            <Text style={[styles.th, styles.colInv]}>{t.colInvoice}</Text>
            <Text style={[styles.th, styles.colClient]}>{t.colClient}</Text>
            <Text style={[styles.th, styles.colDest]}>{t.colDest}</Text>
            <Text style={[styles.th, styles.colStatus]}>{t.colStatus}</Text>
            <Text style={[styles.th, styles.colTotal]}>{t.colTotal}</Text>
          </View>

          {invoices.map((inv, index) => {
            const statusKey = `status_${(inv.deliveryStatus || "pending").toLowerCase()}`;
            const statusLabel = (t as any)[statusKey] || inv.deliveryStatus;

            // Get Colors based on status
            const theme =
              PDF_STATUS_COLORS[inv.deliveryStatus] ||
              PDF_STATUS_COLORS.Pending;

            return (
              <View
                key={inv._id}
                style={[
                  styles.tableRow,
                  { backgroundColor: index % 2 === 0 ? "white" : "#F9FAFB" },
                ]}
                wrap={false}
              >
                <View style={styles.colQR}>
                  <InvoiceQRCode url={getInvoiceUrl(inv._id)} size={45} />
                </View>

                <View style={styles.colInv}>
                  <Text style={[styles.td, { fontWeight: 700 }]}>
                    {inv.invoiceNumber}
                  </Text>
                  <Text style={styles.invDate}>
                    {format(new Date(inv.issueDate), "dd/MM/yy")}
                  </Text>
                </View>

                <Text style={[styles.td, styles.colClient]}>
                  {inv.clientSnapshot.name}
                </Text>

                <Text style={[styles.td, styles.colDest]}>
                  {[
                    inv.clientSnapshot.address?.street,
                    inv.clientSnapshot.address?.city,
                  ]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </Text>

                {/* Status with Dynamic Colors */}
                <View style={[styles.td, styles.colStatus]}>
                  <Text
                    style={[
                      styles.statusBase,
                      { backgroundColor: theme.bg, color: theme.text },
                    ]}
                  >
                    {statusLabel}
                  </Text>
                </View>

                <Text style={[styles.td, styles.colTotal, { fontWeight: 700 }]}>
                  {formatMoney(
                    inv.grandTotal,
                    business.currency,
                    business.currencyFormat,
                  )}
                </Text>
              </View>
            );
          })}
        </View>

        {/* SUMMARY SECTION */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>{t.summaryTitle}</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t.totalCount}:</Text>
              <Text style={styles.summaryValue}>{invoices.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t.totalValue}:</Text>
              <Text
                style={[
                  styles.summaryValue,
                  { fontSize: 11, color: primaryColor },
                ]}
              >
                {formatMoney(
                  totalValue,
                  business.currency,
                  business.currencyFormat,
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* --- Notes--- */}
        {notes && (
          <View style={styles.notesContainer} wrap={false}>
            <Text style={styles.notesLabel}>{t.notes}</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={{ fontSize: 8, color: "#ccc" }}>
            {business.name} — {t.title}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `${t.page} ${pageNumber} ${t.of} ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
