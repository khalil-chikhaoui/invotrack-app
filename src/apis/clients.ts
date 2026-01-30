/**
 * @fileoverview Client API Service
 * Facilitates all client-related operations including customer profiling,
 * sophisticated filtering/pagination, and asset management.
 */

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:3040/api";

/**
 * Base endpoint for client management.
 */
const BASE_URL = `${API_ROOT}/clients`;

// --- Interfaces ---

/**
 * Geographic address details for a specific client.
 */
export interface ClientAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string; 
}

/**
 * Core data structure for a Client entity.
 */
export interface ClientData {
  _id: string;
  businessId: string;
  clientType: "Individual" | "Business";
  name: string;
  email?: string;
  
  phone?: {
    country: string;
    number: string;
  };

  logo?: string;
  address?: ClientAddress;
  isArchived: boolean;
  taxId?: string;
  website?: string;
  metrics?: {
    paidCount: number;
    paidTotal: number;
    unpaidCount: number;
    unpaidTotal: number;
  };
  createdBy: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Metadata for paginated client responses.
 */
export interface ClientPaginationMeta {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

/**
 * Standardized response for fetching multiple clients.
 */
export interface GetClientsResponse {
  clients: ClientData[];
  meta: ClientPaginationMeta;
}

/**
 * Helper utility to construct authenticated request headers.
 * @returns {Record<string, string>} Headers with JSON content-type and JWT.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Service object containing methods for interacting with Client endpoints.
 */
export const clientApi = {
  /**
   * Retrieves a paginated list of clients for a specific business.
   */
  getClients: async (
    businessId: string, 
    params: {
      page?: number;
      limit?: number;
      search?: string;
      sort?: string;
      clientType?: "Business" | "Individual";
      isArchived?: boolean;
    } = {},
  ): Promise<GetClientsResponse> => {
    const url = new URL(`${BASE_URL}/business/${businessId}`);

    if (params.page) url.searchParams.append("page", params.page.toString());
    if (params.limit) url.searchParams.append("limit", params.limit.toString());
    if (params.search) url.searchParams.append("search", params.search);
    if (params.sort) url.searchParams.append("sort", params.sort);
    if (params.clientType)
      url.searchParams.append("clientType", params.clientType);

    if (params.isArchived !== undefined) {
      url.searchParams.append("isArchived", params.isArchived.toString());
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to fetch clients");
    return data;
  },

  /**
   * Registers a new client for the business.
   */
  createClient: async (payload: any): Promise<ClientData> => {
    const response = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to create client");
    return data;
  },

  /**
   * Updates an existing client's information.
   */
  updateClient: async (id: string, payload: any): Promise<ClientData> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to update client");
    return data;
  },

  /**
   * Uploads a logo or profile image for a specific client.
   */
  uploadLogo: async (
    id: string,
    formData: FormData,
  ): Promise<{ message: string; logo: string }> => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${BASE_URL}/${id}/logo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Upload failed");
    return data;
  },

  /**
   * Fetches full details for a single client by their ID.
   */
  getClientById: async (id: string): Promise<ClientData> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to fetch client details");
    return data;
  },

  /**
   * Deletes a client.
   */
  deleteClient: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to delete client");
    return data;
  },

  /**
   * Reactivates an archived client record.
   */
  restoreClient: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/${id}/restore`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to restore client");
    return data;
  },

  /**
   * Permanently removes a client's current logo asset.
   */
  deleteLogo: async (id: string) => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${BASE_URL}/${id}/logo`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Delete failed");
    return data;
  },

  /**
   * Lean search for Invoice Creation picker.
   */
  pickerSearch: async (businessId: string, query: string): Promise<ClientData[]> => {
    const url = new URL(`${BASE_URL}/business/${businessId}/search`);
    url.searchParams.append("q", query);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Picker search failed");
    return data; 
  },
};