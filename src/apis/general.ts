/**
 * @fileoverview General API Service
 * Handles cross-model operations such as global search across
 * Clients, Items, and Invoices.
 */

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:3040/api";

/**
 * Base endpoint for general/utility API calls.
 */
const BASE_URL = `${API_ROOT}/general`;

// ==========================================
// --- Interfaces ---
// ==========================================

export interface SearchClient {
  _id: string;
  name: string;
  clientType: string;
  email?: string;
}

export interface SearchItem {
  _id: string;
  name: string;
  price: number;
  itemType: string;
  sku?: string;
}

export interface SearchInvoice {
  _id: string;
  invoiceNumber: string;
  clientSnapshot: {
    name: string;
  };
  grandTotal: number;
  issueDate: string;
}

export interface SearchResults {
  clients: SearchClient[];
  items: SearchItem[];
  invoices: SearchInvoice[];
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

export const generalApi = {
  /**
   * Performs a global search across multiple collections within a business.
   * @param businessId - The context of the search.
   * @param query - The search string (q).
   */
  search: async (businessId: string, query: string): Promise<SearchResults> => {
    const url = new URL(`${BASE_URL}/search`);
    
    url.searchParams.append("businessId", businessId);
    url.searchParams.append("q", query);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Global search failed to execute.");
    }

    return data;
  },
};