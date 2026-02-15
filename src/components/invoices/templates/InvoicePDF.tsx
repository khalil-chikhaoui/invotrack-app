/**
 * @fileoverview InvoicePDF Dispatcher
 * Handles orchestration, normalization, and LOCALIZATION of the PDF.
 */

import { Document } from "@react-pdf/renderer";
import { BusinessData, InvoiceSettings } from "../../../apis/business";
import { InvoiceData } from "../../../apis/invoices";
import TemplateMinimal from "./TemplateMinimal";
import TemplateModern from "./TemplateModern";
import TemplateClassic from "./TemplateClassic";
import { enUS, de, fr } from "date-fns/locale";

const DATE_LOCALES: Record<string, any> = {
  en: enUS,
  de: de,
  fr: fr,
};

const PDF_TRANSLATIONS: any = {
  en: {
    invoice: "INVOICE",
    billTo: "Bill To",
    issueDate: "Issue Date",
    dueDate: "Due Date",
    description: "Description",
    qty: "Qty",
    rate: "Rate",
    amount: "Amount",
    subtotal: "Subtotal",
    tax: "Tax",
    discount: "Discount",
    total: "TOTAL",
    totalDue: "TOTAL DUE",
    notes: "Notes",
    page: "Page",
    of: "of",
    preview: {
      client_name: "Acme Corp Ltd.",
      items: {
        consulting: "Strategic Consulting",
        ui_ux: "UI/UX Design Phase",
        maintenance: "Server Maintenance",
        product: "Product Design",
        development: "Web Development",
      },
      notes:
        "This section displays the specific remarks or payment instructions provided during the creation of this invoice. If no specific note is added, this area remains blank.",
    },
  },
  de: {
    invoice: "RECHNUNG",
    billTo: "Rechnung an",
    issueDate: "Ausstellungsdatum",
    dueDate: "Fälligkeitsdatum",
    description: "Beschreibung",
    qty: "Menge",
    rate: "Preis",
    amount: "Betrag",
    subtotal: "Zwischensumme",
    tax: "Steuer",
    discount: "Rabatt",
    total: "GESAMT",
    totalDue: "GESAMTBETRAG",
    notes: "Hinweise",
    page: "Seite",
    of: "von",
    preview: {
      client_name: "Musterfirma GmbH",
      items: {
        consulting: "Strategische Beratung",
        ui_ux: "UI/UX Design-Phase",
        maintenance: "Server-Wartung",
        product: "Produktdesign",
        development: "Web-Entwicklung",
      },
      notes:
        "In diesem Abschnitt werden die spezifischen Anmerkungen oder Zahlungsanweisungen angezeigt, die bei der Erstellung dieser Rechnung angegeben wurden. Wenn kein Hinweis hinzugefügt wird, bleibt dieser Bereich leer.",
    },
  },
  fr: {
    invoice: "FACTURE",
    billTo: "Facturé à",
    issueDate: "Date d'émission",
    dueDate: "Date d'échéance",
    description: "Description",
    qty: "Qté",
    rate: "Prix",
    amount: "Montant",
    subtotal: "Sous-total",
    tax: "TVA",
    discount: "Remise",
    total: "TOTAL",
    totalDue: "TOTAL DÛ",
    notes: "Notes",
    page: "Page",
    of: "sur",
    preview: {
      client_name: "Société Acme SAS",
      items: {
        consulting: "Conseil Stratégique",
        ui_ux: "Phase de Design UI/UX",
        maintenance: "Maintenance Serveur",
        product: "Design Produit",
        development: "Développement Web",
      },
      notes:
        "Cette section affiche les remarques spécifiques ou les instructions de paiement fournies lors de la création de cette facture. Si aucune note n'est ajoutée, cette zone restera vide.",
    },
  },
};

export interface InvoiceTemplateProps {
  invoice: InvoiceData;
  business: BusinessData;
  settings: InvoiceSettings;
  t: (key: string) => string;
  locale: any;
}

export default function InvoicePDF({
  invoice,
  business,
}: {
  invoice: InvoiceData;
  business: BusinessData;
}) {
  /**
   * Settings Normalization
   */
  const settings =
    business.invoiceSettings ||
    ({
      template: "Classic",
      color: { primary: "#231f70", secondary: "#5c16b1" },
      visibility: {
        showLogo: true,
        showTaxId: true,
        showDueDate: true,
        showNotes: false,
        showFooter: false,
      },
      logoSize: "Medium",
      footerNote: "",
    } as InvoiceSettings);

  // Determine Language & Locale
  // Determine Language & Locale
  const langCode =
    business.language && PDF_TRANSLATIONS[business.language]
      ? business.language
      : "en";

  const t = (key: string) => {
    if (!key) return "";

    const keys = key.split(".");
    let value = PDF_TRANSLATIONS[langCode];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    return typeof value === "string" ? value : key;
  };
  /**
   * Template Dispatcher
   */
  // Select the date-fns locale object (defaults to enUS)
  const selectedLocale = DATE_LOCALES[langCode] || enUS;

  const renderTemplate = () => {
    const props: InvoiceTemplateProps = {
      invoice,
      business,
      settings,
      t,
      locale: selectedLocale,
    };

    switch (settings.template) {
      case "Minimal":
        return <TemplateMinimal {...props} />;
      case "Modern":
        return <TemplateModern {...props} />;
      default:
        return <TemplateClassic {...props} />;
    }
  };

  return (
    <Document title={`Invoice_${invoice.invoiceNumber}`} author={business.name}>
      {renderTemplate()}
    </Document>
  );
}
