/**
 * @fileoverview Invoice API Service
 * Handles billing operations, financial calculations, boolean status logic,
 * and email dispatch for invoice documents.
 */

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:3040/api";

/**
 * Base endpoint for invoice-related API calls.
 */
const BASE_URL = `${API_ROOT}/invoices`;
 
// ==========================================
// --- Helpers for UI Logic ---
// ==========================================

export const getInvoiceDisplayStatus = (invoice: InvoiceData): "Paid" | "Cancelled" | "Open" => {
  if (invoice.isDeleted) return "Cancelled";
  if (invoice.isPaid) return "Paid";
  return "Open"; 
};

export const STATUS_COLORS: Record<string, "success" | "warning" | "error" | "info" | "light"> = {
  Paid: "success",
  Open: "warning",
  Cancelled: "error",
  Delivered: "success",
  Shipped: "info",
  Pending: "warning",
  Returned: "error",
};

// ==========================================
// --- Interfaces ---
// ==========================================

export type DeliveryStatus = "Pending" | "Shipped" | "Delivered" | "Returned";

export const DELIVERY_STATUS_OPTIONS: DeliveryStatus[] = [
  "Pending",
  "Shipped",
  "Delivered",
  "Returned",
];

export interface InvoiceItem {
  itemId: string;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  costPrice?: number;
  total: number;
}

export interface ClientSnapshot {
  clientId?: string;
  name: string;
  email?: string;
  logo?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: {
    country: string;
    number: string;
  };
}

export interface InvoiceData {
  _id: string;
  businessId: string;
  invoiceNumber: string;
  clientSnapshot: ClientSnapshot;
  items: InvoiceItem[];
  subTotal: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
  totalDiscount: number;
  taxRate: number;
  totalTax: number;
  grandTotal: number;
  isPaid: boolean;
  paidAt?: string | null;
  isDeleted: boolean; 
  deliveryStatus: DeliveryStatus;
  dueDate?: string;
  issueDate: string;
  notes?: string;
  createdBy: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface FilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  deliveryStatus?: string;
  sort?: string;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
}

// --- API Responses ---

export interface InvoicePaginationMeta {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface GetInvoicesResponse {
  invoices: InvoiceData[];
  meta: InvoicePaginationMeta;
}

export interface ClientInvoiceResponse {
  invoices: InvoiceData[];
  stats: { lifetimeValue: number; openBalance: number };
  meta: InvoicePaginationMeta;
}

export interface ItemInvoiceResponse {
  invoices: InvoiceData[];
  stats: {
    totalRevenue: number;
    totalSold: number;
    currentStock: number;    
    avgSalePrice: number;     
    salesVelocity: number;   
  };
  meta: InvoicePaginationMeta;
}

// --- Analytics Interfaces  ---

export interface ClientStatPoint { 
  label: string; 
  revenue: number; 
  count: number; 
}

export interface MonthlySalesResponse { 
  sales: number[]; 
  years: number[]; 
}

export interface DeliveryStatsResponse { 
  Pending: number; 
  Shipped: number; 
  Delivered: number; 
  Returned: number; 
}

export interface TopBuyerStat {
  label: string; 
  value: number; 
  quantity: number;
}

export interface TopBuyersResponse { 
  buyers: TopBuyerStat[]; 
  years: number[]; 
}

export interface ProfitStat { 
  label: string; 
  revenue: number; 
  cost: number; 
  profit: number; 
}

export interface ProfitStatsResponse { 
  stats: ProfitStat[]; 
  years: number[]; 
}

export interface ProductStat {
  label: string; 
  value: number;
}

export interface ClientProductsResponse { 
  products: ProductStat[]; 
  years: number[]; 
}

export interface InvoiceStatusStats { 
  Open: number; 
  Paid: number; 
  Cancelled: number; 
}

// ==========================================
// --- API Implementation ---
// ==========================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const invoiceApi = {
  getInvoices: async (
    businessId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: "Paid" | "Unpaid" | "Cancelled" | ""; 
      deliveryStatus?: DeliveryStatus;
      sort?: string;
      dateRange?: string;
      startDate?: string;
      endDate?: string;
    } = {},
  ): Promise<GetInvoicesResponse> => {
    const url = new URL(`${BASE_URL}/business/${businessId}`);

    if (params.page) url.searchParams.append("page", params.page.toString());
    if (params.limit) url.searchParams.append("limit", params.limit.toString());
    if (params.search) url.searchParams.append("search", params.search);
    if (params.status) url.searchParams.append("status", params.status);
    if (params.deliveryStatus) url.searchParams.append("deliveryStatus", params.deliveryStatus);
    if (params.sort) url.searchParams.append("sort", params.sort);
    if (params.dateRange) url.searchParams.append("dateRange", params.dateRange);
    if (params.startDate) url.searchParams.append("startDate", params.startDate);
    if (params.endDate) url.searchParams.append("endDate", params.endDate);
    
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch invoices");
    return data;
  },

  createInvoice: async (payload: Partial<InvoiceData>): Promise<InvoiceData> => {
    const response = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create invoice");
    return data;
  },

  deleteInvoice: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to void invoice");
    return data;
  },

  getInvoiceById: async (id: string): Promise<InvoiceData> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch invoice");
    return data;
  },

  togglePayment: async (id: string): Promise<InvoiceData> => {
    const response = await fetch(`${BASE_URL}/${id}/payment`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to toggle payment status");
    return data;
  },

  updateInvoice: async (id: string, payload: Partial<InvoiceData>): Promise<InvoiceData> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update invoice");
    return data;
  },

  getClientInvoices: async (
    clientId: string,
    params: FilterParams = {}
  ): Promise<ClientInvoiceResponse> => {
    const url = new URL(`${BASE_URL}/client/${clientId}`);
    
    Object.keys(params).forEach(key => {
        if (params[key as keyof FilterParams]) {
            url.searchParams.append(key, params[key as keyof FilterParams]!.toString());
        }
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch client invoices");
    return data;
  },

  getItemInvoices: async (
    itemId: string,
    params: FilterParams = {}
  ): Promise<ItemInvoiceResponse> => {
    const url = new URL(`${BASE_URL}/item/${itemId}`);
    
    Object.keys(params).forEach(key => {
        if (params[key as keyof FilterParams]) {
            url.searchParams.append(key, params[key as keyof FilterParams]!.toString());
        }
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch item invoices");
    return data;
  },
 
  // --- Analytics Methods ---

  getClientStats: async (clientId: string, mode: string, customRange?: any) => {
    const url = new URL(`${API_ROOT}/client-stats/${clientId}`);
    url.searchParams.append("mode", mode);
    if (mode === "custom" && customRange) {
      url.searchParams.append("startDate", customRange.start.toISOString());
      url.searchParams.append("endDate", customRange.end.toISOString());
    }
    const response = await fetch(url.toString(), { method: "GET", headers: getAuthHeaders() });
    return response.json();
  },
  
  updateClientSnapshot: async (id: string, data: any) => {
    const response = await fetch(`${BASE_URL}/${id}/client`, { 
      method: "PATCH", 
      headers: getAuthHeaders(), 
      body: JSON.stringify(data) 
    });
    return response.json();
  },

  getMonthlySales: async (clientId: string, year: number): Promise<MonthlySalesResponse> => {
    const response = await fetch(`${API_ROOT}/client-stats/${clientId}/sales?year=${year}`, { 
      headers: getAuthHeaders() 
    });
    return response.json();
  },

  getItemStats: async (itemId: string, mode: string, customRange?: any): Promise<ClientStatPoint[]> => {
    const url = new URL(`${API_ROOT}/item-stats/${itemId}`);
    url.searchParams.append("mode", mode);
    if (mode === "custom" && customRange) {
      url.searchParams.append("startDate", customRange.start.toISOString());
      url.searchParams.append("endDate", customRange.end.toISOString());
    }
    const response = await fetch(url.toString(), { method: "GET", headers: getAuthHeaders() });
    return response.json(); 
  },

  getItemMonthlySales: async (itemId: string, year: number): Promise<MonthlySalesResponse> => {
    const response = await fetch(`${API_ROOT}/item-stats/${itemId}/sales?year=${year}`, { 
      headers: getAuthHeaders() 
    });
    return response.json();
  },

  getItemDeliveryStats: async (itemId: string): Promise<DeliveryStatsResponse> => {
    const response = await fetch(`${API_ROOT}/item-stats/${itemId}/delivery`, { 
      headers: getAuthHeaders() 
    });
    return response.json();
  },

  getItemTopBuyers: async (itemId: string, year: number, month?: number): Promise<TopBuyersResponse> => {
    let url = `${API_ROOT}/item-stats/${itemId}/top-buyers?year=${year}`;
    if (month !== undefined && month !== -1) url += `&month=${month}`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    return response.json();
  },

  getItemProfitStats: async (itemId: string, year: number, month?: number): Promise<ProfitStatsResponse> => {
    let url = `${API_ROOT}/item-stats/${itemId}/profit?year=${year}`;
    if (month !== undefined && month !== -1) url += `&month=${month}`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    return response.json();
  },

  getClientTopProducts: async (clientId: string, year: number): Promise<ClientProductsResponse> => {
    const response = await fetch(`${API_ROOT}/client-stats/${clientId}/products?year=${year}`, { 
      headers: getAuthHeaders() 
    });
    return response.json();
  },

  getClientInvoiceStatus: async (clientId: string): Promise<InvoiceStatusStats> => {
    const response = await fetch(`${API_ROOT}/client-stats/${clientId}/status`, { 
      headers: getAuthHeaders() 
    });
    return response.json();
  },

  getClientAOV: async (clientId: string) => {
    const res = await fetch(`${API_ROOT}/client-stats/${clientId}/aov`, { 
      headers: getAuthHeaders() 
    });
    return res.json();
  },

  getClientHealth: async (clientId: string) => {
    const res = await fetch(`${API_ROOT}/client-stats/${clientId}/health`, { 
      headers: getAuthHeaders() 
    });
    return res.json();
  },

  restoreInvoice: async (id: string): Promise<InvoiceData> => {
    const response = await fetch(`${BASE_URL}/${id}/restore`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to restore invoice");
    return data.invoice;
  },
};