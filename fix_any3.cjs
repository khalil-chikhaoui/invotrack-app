/**
 * Phase 3: Fix the last 10 no-explicit-any violations
 */
const fs = require('fs');
const path = require('path');

function readFile(relPath) {
  return fs.readFileSync(path.join(__dirname, relPath), 'utf8');
}

function writeFile(relPath, content) {
  fs.writeFileSync(path.join(__dirname, relPath), content);
}

let count = 0;

// 1. ClientAOVChart: useState<any[]>
{
  let c = readFile('src/components/clients/charts/ClientAOVChart.tsx');
  c = c.replace('useState<any[]>([])', 'useState<{ label: string; value: number }[]>([])');
  writeFile('src/components/clients/charts/ClientAOVChart.tsx', c);
  count++;
}

// 2. ClientHealthMetrics: useState<any>(null)
{
  let c = readFile('src/components/clients/charts/ClientHealthMetrics.tsx');
  c = c.replace(
    'useState<any>(null)',
    'useState<Record<string, number> | null>(null)'
  );
  writeFile('src/components/clients/charts/ClientHealthMetrics.tsx', c);
  count++;
}

// 3. DeliveryNotePDF: Record<string, any>
{
  let c = readFile('src/components/delivery/DeliveryNotePDF.tsx');
  c = c.replace(
    /Record<string, any>/g,
    'Record<string, Record<string, string>>'
  );
  writeFile('src/components/delivery/DeliveryNotePDF.tsx', c);
  count++;
}

// 4. EditClientModal: (invoice.clientSnapshot as any).phone
{
  let c = readFile('src/components/invoices/details/EditClientModal.tsx');
  c = c.replace(
    '(invoice.clientSnapshot as any).phone',
    '(invoice.clientSnapshot as unknown as { phone?: { country: string; number: string } }).phone'
  );
  writeFile('src/components/invoices/details/EditClientModal.tsx', c);
  count++;
}

// 5. InvoicePDF: DATE_LOCALES: Record<string, any>
{
  let c = readFile('src/components/invoices/templates/InvoicePDF.tsx');
  c = c.replace(
    /DATE_LOCALES: Record<string, any>/g,
    'DATE_LOCALES: Record<string, Locale>'
  );
  // Ensure Locale is imported from date-fns
  if (!c.includes('import type { Locale }') && !c.includes('import { Locale }')) {
    // Check if there's already a date-fns import we can extend
    if (c.includes('from "date-fns/locale"')) {
      c = c.replace(
        'from "date-fns/locale"',
        'from "date-fns/locale";\nimport type { Locale } from "date-fns"'
      );
    } else if (c.includes('from "date-fns"')) {
      // Already imports from date-fns, add Locale
      c = c.replace(
        /import \{([^}]+)\} from "date-fns"/,
        'import {$1, Locale } from "date-fns"'
      );
    }
  }
  writeFile('src/components/invoices/templates/InvoicePDF.tsx', c);
  count++;
}

// 6 & 7. CreateInvoice: useState<any[]>([]) and useState<any>(null)
{
  let c = readFile('src/pages/Invoices/CreateInvoice.tsx');
  c = c.replace(
    'useState<any[]>([])',
    'useState<InvoiceItem[]>([])'
  );
  c = c.replace(
    /useState<any>\(null\)/g,
    'useState<InvoiceItem | null>(null)'
  );
  // Ensure InvoiceItem is imported
  if (!c.includes('InvoiceItem')) {
    c = c.replace(
      'import { InvoiceData',
      'import { InvoiceData, InvoiceItem'
    );
  }
  writeFile('src/pages/Invoices/CreateInvoice.tsx', c);
  count++;
}

// 8 & 9. InvoiceDetails: useState<any>(null) for selectedItem, and price line
{
  let c = readFile('src/pages/Invoices/InvoiceDetails.tsx');
  // selectedItem
  c = c.replace(
    /useState<any>\(null\)/g,
    'useState<InvoiceItem | null>(null)'
  );
  // Ensure InvoiceItem is imported
  if (!c.includes('InvoiceItem')) {
    c = c.replace(
      'import { InvoiceData',
      'import { InvoiceData, InvoiceItem'
    );
  }
  writeFile('src/pages/Invoices/InvoiceDetails.tsx', c);
  count++;
}

console.log(`✅ Phase 3 done! Applied ${count} fixes.`);
