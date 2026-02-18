import { InvoiceData } from "./invoices";

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:3040/api";
const BASE_URL = `${API_ROOT}/deliveries`;


export interface DeliveryStatusCounts {
  Pending: number;
  Shipped: number;
  Delivered: number;
  Returned: number;
}

export interface DeliveryNoteData {
  _id: string;
  businessId: string;
  deliveryNumber: string;
  invoices: InvoiceData[] | string[];
  statusCounts: DeliveryStatusCounts;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetDeliveryNotesResponse {
  notes: DeliveryNoteData[];
  meta: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

export const deliveryApi = {
  /**
   * Get delivery note history with filters and pagination
   */
  getDeliveryNotes: async (
    businessId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      dateRange?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<GetDeliveryNotesResponse> => {
    const url = new URL(`${BASE_URL}/business/${businessId}`);
    
    if (params.page) url.searchParams.append("page", params.page.toString());
    if (params.limit) url.searchParams.append("limit", params.limit.toString());
    if (params.search) url.searchParams.append("search", params.search);
    if (params.dateRange) url.searchParams.append("dateRange", params.dateRange);
    if (params.startDate) url.searchParams.append("startDate", params.startDate);
    if (params.endDate) url.searchParams.append("endDate", params.endDate);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch delivery history");
    return data;
  },

  /**
   * Get full details of a single Delivery Note (for PDF re-generation)
   */
  getDeliveryNoteById: async (id: string): Promise<DeliveryNoteData> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch delivery note");
    return data;
  },

  /**
   * Delete a delivery note (Smart Revert logic is handled by backend)
   */
  deleteDeliveryNote: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete delivery note");
    return data;
  },

  /**
   * Remove a single invoice from the manifest
   */
  removeInvoiceFromDelivery: async (noteId: string, invoiceId: string): Promise<any> => {
    const response = await fetch(`${BASE_URL}/${noteId}/invoices/${invoiceId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to remove invoice");
    return data;
  },

  /**
   * Update specific fields of a delivery note (e.g. notes)
   */
  updateDeliveryNote: async (id: string, data: { notes?: string }): Promise<DeliveryNoteData> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update delivery note");
    return result;
  }

};