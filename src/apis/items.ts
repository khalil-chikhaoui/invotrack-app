/**
 * @fileoverview Items API Service
 * Manages the product and service catalog, including inventory adjustments,
 * image assets, and detailed sales performance analytics.
 */

import { InvoiceData, InvoicePaginationMeta } from "./invoices";

// ✅ FIX: Use the Environment Variable for the API URL
const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:3040/api";

/**
 * Base endpoint for item and inventory management.
 */
const BASE_URL = `${API_ROOT}/items`;

// --- Interfaces ---

/**
 * Core data structure for an Item (Product or Service).
 */
export interface ItemData {
  _id: string;
  businessId: string;
  itemType: "Product" | "Service";
  name: string;
  sku?: string;
  description?: string;
  image?: string;
  isArchived: boolean; 

  // Pricing & Tax
  price: number;
  cost?: number;
  taxRate?: number;

  // Inventory logic
  currentStock: number;
  lowStockThreshold: number;
  unit: string; // e.g., pcs, kg, hrs

  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Metadata for item list pagination.
 */
export interface ItemPaginationMeta {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

/**
 * Standardized response for fetching multiple items.
 */
export interface GetItemsResponse {
  items: ItemData[];
  meta: ItemPaginationMeta;
}

/**
 * Comprehensive response for item-specific deep dives.
 */
export interface ItemDetailsResponse {
  item: ItemData;
  invoices: InvoiceData[];
  stats: {
    totalRevenue: number;
    totalSold: number;
    invoiceCount: number;
  };
  meta: InvoicePaginationMeta;
}

/**
 * Helper utility to construct authenticated request headers.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

/**
 * Service object containing methods for interacting with Item and Inventory endpoints.
 */
export const itemApi = {
  /**
   * Retrieves a paginated list of items for a specific business.
   */
  getItems: async (
    businessId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      type?: "Product" | "Service";
      stockStatus?: "low" | "all";
      sort?: string;
      isArchived?: boolean; 
    } = {},
  ): Promise<GetItemsResponse> => {
    // ✅ FIX: Removed window.location.origin
    const url = new URL(`${BASE_URL}/business/${businessId}`);

    if (params.page) url.searchParams.append("page", params.page.toString());
    if (params.limit) url.searchParams.append("limit", params.limit.toString());
    if (params.search) url.searchParams.append("search", params.search);
    if (params.type) url.searchParams.append("type", params.type);
    if (params.stockStatus)
      url.searchParams.append("stockStatus", params.stockStatus);
    if (params.sort) url.searchParams.append("sort", params.sort);

    if (params.isArchived !== undefined) {
      url.searchParams.append("isArchived", params.isArchived.toString());
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch items");
    return data;
  },

  /**
   * Registers a new item in the catalog.
   */
  createItem: async (payload: any): Promise<ItemData> => {
    const response = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create item");
    return data;
  },

  /**
   * Updates an existing item's profile or pricing.
   */
  updateItem: async (id: string, payload: any): Promise<ItemData> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update item");
    return data;
  },

  /**
   * Uploads or updates the display image for a product or service.
   */
  uploadImage: async (
    id: string,
    formData: FormData,
  ): Promise<{ message: string; image: string }> => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${BASE_URL}/${id}/image`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Image upload failed");
    return data;
  },

  /**
   * Permanently removes an item from the registry.
   */
  deleteItem: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete item");
    return data;
  },

  /**
   * Reactivates an archived item record.
   */
  restoreItem: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/${id}/restore`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to restore item");
    return data;
  },

  /**
   * Manually adjusts the stock levels.
   */
  adjustStock: async (
    id: string,
    payload: { quantity: number; reason?: string },
  ): Promise<{ currentStock: number }> => {
    const response = await fetch(`${BASE_URL}/${id}/stock`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to adjust stock");
    return data;
  },

  /**
   * Fetches basic data for a single item by its ID.
   */
  getItemById: async (id: string): Promise<ItemData> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Item not found");
    return data;
  },

  /**
   * Retrieves the full transaction ledger and performance metrics for an item.
   */
  getItemDetails: async (
    id: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<ItemDetailsResponse> => {
    // ✅ FIX: Removed window.location.origin
    const url = new URL(`${BASE_URL}/${id}/details`);

    if (params.page) url.searchParams.append("page", params.page.toString());
    if (params.limit) url.searchParams.append("limit", params.limit.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to fetch item analytics");
    return data;
  },

  /**
   * Permanently removes an item's current display image.
   */
  deleteImage: async (
    id: string,
  ): Promise<{ message: string; image: string }> => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${BASE_URL}/${id}/image`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Delete failed");
    return data;
  },

  /**
   * Lean search for Invoice Item selection.
   */
  pickerSearch: async (businessId: string, query: string): Promise<ItemData[]> => {
    // ✅ FIX: Removed window.location.origin
    const url = new URL(`${BASE_URL}/business/${businessId}/search`);
    url.searchParams.append("q", query);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Item search failed");
    return data; 
  },
};