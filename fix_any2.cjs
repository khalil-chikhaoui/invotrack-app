/**
 * Phase 2: Fix remaining no-explicit-any violations
 * These are mostly prop types, function params, and inline type annotations
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
function fix(relPath, from, to) {
  let content = readFile(relPath);
  if (content.includes(from)) {
    content = content.replace(from, to);
    writeFile(relPath, content);
    count++;
    return true;
  }
  return false;
}

function fixAll(relPath, from, to) {
  let content = readFile(relPath);
  const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const newContent = content.replace(re, to);
  if (newContent !== content) {
    writeFile(relPath, newContent);
    count++;
  }
}

console.log('🔧 Phase 2: Fixing remaining any violations...\n');

// ============================================================
// 1. setAlert: (alert: any) => void  →  proper AlertState type
// This is used across many components. We'll use inline types.
// ============================================================

const alertType = '(alert: { type: string; title: string; message: string }) => void';

// BusinessProfile
fix('src/components/BusinessProfile/BusinessAddressCard.tsx',
  'setAlert: (alert: any) => void;',
  `setAlert: ${alertType};`);
fix('src/components/BusinessProfile/BusinessLegalCard.tsx',
  'setAlert: (alert: any) => void;',
  `setAlert: ${alertType};`);
fix('src/components/BusinessProfile/BusinessMetaCard.tsx',
  'setAlert: (alert: any) => void;',
  `setAlert: ${alertType};`);

// UserProfile
fix('src/components/UserProfile/UserInfoCard.tsx',
  'setAlert: (alert: any) => void;',
  `setAlert: ${alertType};`);
fix('src/components/UserProfile/UserMetaCard.tsx',
  'setAlert: (alert: any) => void;',
  `setAlert: ${alertType};`);

// ClientIdentityCard, ItemIdentityCard
fix('src/components/clients/details/ClientIdentityCard.tsx',
  'setAlert: (a: any) => void;',
  `setAlert: ${alertType};`);
fix('src/components/items/details/ItemIdentityCard.tsx',
  'setAlert: (a: any) => void;',
  `setAlert: ${alertType};`);

// Pages
fix('src/pages/Items/ItemFormModal.tsx',
  'setAlert: (a: any) => void;',
  `setAlert: ${alertType};`);
fix('src/pages/Clients/ClientAddressModal.tsx',
  'setAlert: (a: any) => void;',
  `setAlert: ${alertType};`);
fix('src/pages/Clients/ClientIdentityModal.tsx',
  'setAlert: (a: any) => void;',
  `setAlert: ${alertType};`);

// ============================================================
// 2. locale: any = "default"  →  locale: string | Locale = "default"
// ============================================================

// Need to check what imports are used
fixAll('src/components/charts/GenericStatsChart.tsx',
  'let locale: any = "default";',
  'let locale: string | object = "default";');
fixAll('src/components/home/HomeHeader.tsx',
  'let locale: any = "default";',
  'let locale: string | object = "default";');
fixAll('src/components/invoices/InvoiceFilters.tsx',
  'let locale: any = "default";',
  'let locale: string | object = "default";');
fixAll('src/components/invoices/create/InvoiceDates.tsx',
  'let locale: any = "default";',
  'let locale: string | object = "default";');

// ============================================================
// 3. SignInForm: `as any` in error translation
// ============================================================
fix('src/components/auth/SignInForm.tsx',
  't(`errors.${errorCode}`) || t("errors.GENERIC_ERROR" as any);',
  't(`errors.${errorCode}`) || t("errors.GENERIC_ERROR");');

// ============================================================
// 4. StatusUpdateModal: onValueChange: (val: any)
// ============================================================
fix('src/components/common/StatusUpdateModal.tsx',
  'onValueChange: (val: any) => void;',
  'onValueChange: (val: string) => void;');

// ============================================================
// 5. InvoiceFilters: setStatusFilter/setDeliveryFilter (val: any)
// ============================================================
fix('src/components/invoices/InvoiceFilters.tsx',
  'setStatusFilter: (val: any) => void;',
  'setStatusFilter: (val: string) => void;');
fix('src/components/invoices/InvoiceFilters.tsx',
  'setDeliveryFilter: (val: any) => void;',
  'setDeliveryFilter: (val: string) => void;');

// ============================================================
// 6. ItemManager: items: any[]
// ============================================================
fix('src/components/invoices/create/ItemManager.tsx',
  'items: any[];',
  'items: InvoiceItem[];');
// Need to ensure InvoiceItem is imported
{
  let c = readFile('src/components/invoices/create/ItemManager.tsx');
  if (!c.includes('InvoiceItem')) {
    c = c.replace(
      'import { InvoiceData',
      'import { InvoiceData, InvoiceItem'
    );
    if (!c.includes('InvoiceItem')) {
      // Add import
      const firstImport = c.indexOf('import ');
      const endOfFirstImport = c.indexOf('\n', firstImport);
      c = c.slice(0, endOfFirstImport + 1) + 
          'import { InvoiceItem } from "../../../apis/invoices";\n' + 
          c.slice(endOfFirstImport + 1);
    }
    writeFile('src/components/invoices/create/ItemManager.tsx', c);
  }
}

// ============================================================
// 7. EditClientModal: onSave: (data: any)
// ============================================================
fix('src/components/invoices/details/EditClientModal.tsx',
  'onSave: (data: any) => Promise<void>;',
  'onSave: (data: Partial<ClientSnapshot>) => Promise<void>;');
// Ensure import
{
  let c = readFile('src/components/invoices/details/EditClientModal.tsx');
  if (!c.includes('ClientSnapshot')) {
    c = c.replace(
      "from \"react\"",
      "from \"react\";\nimport { ClientSnapshot } from \"../../../apis/invoices\""
    );
    writeFile('src/components/invoices/details/EditClientModal.tsx', c);
  }
}

// ============================================================
// 8. EditItemModal: item: any
// ============================================================
fix('src/components/invoices/details/EditItemModal.tsx',
  'item: any;',
  'item: InvoiceItem;');
{
  let c = readFile('src/components/invoices/details/EditItemModal.tsx');
  if (!c.includes('InvoiceItem')) {
    c = c.replace(
      "from \"react\"",
      "from \"react\";\nimport { InvoiceItem } from \"../../../apis/invoices\""
    );
    writeFile('src/components/invoices/details/EditItemModal.tsx', c);
  }
}

// ============================================================
// 9. InvoiceLedger: onEditItem: (item: any)
// ============================================================
fix('src/components/invoices/details/InvoiceLedger.tsx',
  'onEditItem: (item: any) => void;',
  'onEditItem: (item: InvoiceItem) => void;');
{
  let c = readFile('src/components/invoices/details/InvoiceLedger.tsx');
  if (!c.includes('InvoiceItem') && !c.includes("InvoiceItem")) {
    c = c.replace(
      'import { InvoiceData',
      'import { InvoiceData, InvoiceItem'
    );
    writeFile('src/components/invoices/details/InvoiceLedger.tsx', c);
  }
}

// ============================================================
// 10. InvoiceModals: handleUpdate: (payload: any)
// ============================================================
fix('src/components/invoices/details/InvoiceModals.tsx',
  'handleUpdate: (payload: any) => void;',
  'handleUpdate: (payload: Partial<InvoiceData>) => void;');
{
  let c = readFile('src/components/invoices/details/InvoiceModals.tsx');
  if (!c.includes('InvoiceData')) {
    c = c.replace(
      "from \"react\"",
      "from \"react\";\nimport { InvoiceData } from \"../../../apis/invoices\""
    );
    writeFile('src/components/invoices/details/InvoiceModals.tsx', c);
  }
}

// ============================================================
// 11. InvoicePDF: PDF_TRANSLATIONS: any, locale: any, addr: any
// ============================================================
fix('src/components/invoices/templates/InvoicePDF.tsx',
  'const PDF_TRANSLATIONS: any = {',
  'const PDF_TRANSLATIONS: Record<string, Record<string, string>> = {');
fix('src/components/invoices/templates/InvoicePDF.tsx',
  'locale: any;',
  'locale: string | object;');
fix('src/components/invoices/templates/InvoicePDF.tsx',
  'const formatAddressLine = (addr: any) => {',
  'const formatAddressLine = (addr: Record<string, string | undefined>) => {');

// ============================================================
// 12. ClientHistoryTab / ItemHistoryTab: filterProps: any
// ============================================================
fix('src/components/clients/details/ClientHistoryTab.tsx',
  'filterProps: any;',
  'filterProps: Record<string, unknown>;');
fix('src/components/items/details/ItemHistoryTab.tsx',
  'filterProps: any;',
  'filterProps: Record<string, unknown>;');

// ============================================================
// 13. ClientProductPieChart: (a: any, b: any)
// ============================================================
fix('src/components/clients/charts/ClientProductPieChart.tsx',
  '(a: any, b: any) => a + b,',
  '(a: number, b: number) => a + b,');

// ============================================================
// 14. Calendar: renderEventContent(eventInfo: any)
// ============================================================
fix('src/pages/Calendar/Calendar.tsx',
  'const renderEventContent = (eventInfo: any) => {',
  'const renderEventContent = (eventInfo: { event: { title: string; extendedProps?: Record<string, unknown> } }) => {');

// ============================================================
// 15. DeliveryNotePDF: (t as (key: string) => string)[ fix
// ============================================================
{
  let c = readFile('src/components/delivery/DeliveryNotePDF.tsx');
  if (c.includes('(t as (key: string) => string)[')) {
    // Already partially fixed, but eslint still sees `any` — let's check the exact line
  }
}

// ============================================================
// 16. BusinessMetaCard: (m: any) => and data: any
// ============================================================
fix('src/components/BusinessProfile/BusinessMetaCard.tsx',
  '(m: any) =>',
  '(m: { businessId?: { _id: string; name: string; logo?: string } }) =>');
fix('src/components/BusinessProfile/BusinessMetaCard.tsx',
  'const data: any = await businessApi.uploadLogo(businessId, fd);',
  'const data = await businessApi.uploadLogo(businessId, fd);');

// ============================================================
// 17. UserMetaCard: (m: any)
// ============================================================
fix('src/components/UserProfile/UserMetaCard.tsx',
  '(m: any) =>',
  '(m: { businessId?: { _id: string } }) =>');

// ============================================================
// 18. BusinessAddressCard: handleSave data/modal params
// ============================================================
fix('src/components/BusinessProfile/BusinessAddressCard.tsx',
  'const handleSave = async (data: any, modal: any) => {',
  'const handleSave = async (data: Record<string, unknown>, modal: { close: () => void }) => {');

// ============================================================
// 19. InvoiceSettings: business: any, invoice: any, template: any
// ============================================================
{
  let c = readFile('src/pages/Business/InvoiceSettings.tsx');
  c = c.replace('business: any;', 'business: string;');
  c = c.replace('invoice: any;', 'invoice: string;');
  // handleTemplateChange(template: any)
  c = c.replace(
    'const handleTemplateChange = (template: any) =>',
    'const handleTemplateChange = (template: string) =>'
  );
  writeFile('src/pages/Business/InvoiceSettings.tsx', c);
}

// ============================================================
// 20. CreateInvoice: handleItemModalSave data: any
// ============================================================
fix('src/pages/Invoices/CreateInvoice.tsx',
  'const handleItemModalSave = async (_ignoredId: string, data: any) => {',
  'const handleItemModalSave = async (_ignoredId: string, data: Partial<InvoiceItem>) => {');

// ============================================================
// 21. InvoiceDetails: areIdsEqual, handleEditItemRequest, handleItemModalSave
// ============================================================
{
  let c = readFile('src/pages/Invoices/InvoiceDetails.tsx');
  c = c.replace(
    'const areIdsEqual = (id1: any, id2: any) => String(id1) === String(id2);',
    'const areIdsEqual = (id1: string | number, id2: string | number) => String(id1) === String(id2);'
  );
  c = c.replace(
    'const handleEditItemRequest = (item: any) => {',
    'const handleEditItemRequest = (item: InvoiceItem) => {'
  );
  c = c.replace(
    'const handleItemModalSave = async (_ignoredId: string, data: any) => {',
    'const handleItemModalSave = async (_ignoredId: string, data: Partial<InvoiceItem>) => {'
  );
  writeFile('src/pages/Invoices/InvoiceDetails.tsx', c);
}

// ============================================================
// 22. Items.tsx: const res: any = await
// ============================================================
fix('src/pages/Items/Items.tsx',
  'const res: any = await itemApi.deleteItem(selectedItem._id);',
  'const res = await itemApi.deleteItem(selectedItem._id);');

// ============================================================
// 23. CreateDeliveryNote: const response: any = await
// ============================================================
fix('src/pages/Delivery/CreateDeliveryNote.tsx',
  'const response: any = await invoiceApi.batchUpdateStatus(',
  'const response = await invoiceApi.batchUpdateStatus(');

console.log(`\n✅ Phase 2 done! Applied ${count} targeted fixes.`);
