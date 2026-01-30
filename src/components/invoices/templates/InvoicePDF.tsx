/**
 * @fileoverview InvoicePDF Dispatcher
 * This component handles the high-level orchestration of PDF generation.
 * It does not contain layout logic itself; instead, it:
 * 1. Normalizes invoice settings with sensible defaults.
 * 2. Determines the visual style (Minimal, Modern, Classic) based on business preferences.
 * 3. Injects the shared Business and Invoice data into the selected template.
 */

import { Document } from "@react-pdf/renderer";
import { BusinessData, InvoiceSettings } from "../../../apis/business";
import { InvoiceData } from "../../../apis/invoices";
import TemplateMinimal from "./TemplateMinimal";
import TemplateModern from "./TemplateModern";
import TemplateClassic from "./TemplateClassic";

/**
 * Shared Interface for all Invoice Templates
 * Ensures strict type safety across different layout implementations.
 */
export interface InvoiceTemplateProps {
  invoice: InvoiceData;
  business: BusinessData;
  settings: InvoiceSettings;
}

export default function InvoicePDF({
  invoice,
  business,
}: {
  invoice: InvoiceData;
  business: BusinessData;
}) {
  /**
   * Settings Normalization:
   * Provides a fallback configuration if the business has not yet
   * customized their invoice branding.
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
        showPaymentTerms: true,
        showFooter: false,
      },
      logoSize: "Medium",
      paymentTerms: "",
      footerNote: "",
    } as InvoiceSettings);

  /**
   * Template Dispatcher:
   * Selects the appropriate React-PDF layout based on the 'settings' object.
   */
  const renderTemplate = () => {
    const props: InvoiceTemplateProps = { invoice, business, settings };

    switch (settings.template) {
      case "Minimal":
        return <TemplateMinimal {...props} />;
      case "Modern":
        return <TemplateModern {...props} />;
      case "Classic":
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
