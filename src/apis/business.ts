/**
 * @fileoverview Business API Service
 * Handles all business-related operations including profile management,
 * specialized invoice settings, and team/member orchestration.
 */

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:3040/api";

/**
 * Base endpoint for business-related API calls.
 */
const BASE_URL = `${API_ROOT}/businesses`;

// --- Interfaces ---

/**
 * Configuration for localized currency rendering.
 */
export interface CurrencyFormat {
  display: "symbol" | "code";
  position: "left" | "right";
  digits: number;
  groupSep: string;
  decimalSep: string;
}

/**
 * Geographic address details for a business entity.
 */
export interface BusinessAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

/**
 * Default discount configuration for business-wide billing.
 */
export interface DefaultDiscount {
  value: number;
  type: "percentage" | "fixed";
}

/**
 * Branding and UI visibility settings for generated invoices.
 */
export interface InvoiceSettings {
  template: "Classic" | "Minimal" | "Modern";
  color: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logoSize: "Small" | "Medium" | "Large";
  visibility: {
    showLogo: boolean;
    showTaxId: boolean;
    showDueDate: boolean;
    showDiscount: boolean;
    showNotes: boolean;
    showPaymentTerms: boolean;
    showFooter: boolean;
  };
  paymentTerms: string;
  footerNote: string;
}

/**
 * Comprehensive data structure for a Business entity.
 */
export interface BusinessData {
  _id: string;
  name: string;
  legalName?: string;
  description?: string;
  logo?: string;
  website?: string;
  status: "Active" | "Pending" | "Suspended";
  taxId?: string;
  registrationNumber?: string;
  email: string;
  phoneNumber?: string;
  address?: BusinessAddress;
  defaultTaxRate?: number;
  defaultDiscount?: DefaultDiscount;
  language: string;
  currency: string;
  currencyFormat?: CurrencyFormat;
  invoiceSettings?: InvoiceSettings;
  timezone: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

/**
 * Helper utility to construct authenticated request headers.
 * @returns {Record<string, string>} Request headers.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Service object containing methods for interacting with Business and Team endpoints.
 */
export const businessApi = {
  /**
   * Creates a new business and associates it with the current user.
   * @param {any} payload - Initial business data.
   * @returns {Promise<{ business: BusinessData, user: any }>}
   */
  createBusiness: async (
    payload: any,
  ): Promise<{ business: BusinessData; user: any }> => {
    const response = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to create business");
    return data;
  },

  /**
   * Retrieves full details for a specific business.
   * @param {string} id - Business ID.
   * @returns {Promise<BusinessData>}
   */
  getBusiness: async (id: string): Promise<BusinessData> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to fetch business");
    return data;
  },

  /**
   * Updates core business profile information.
   * @param {string} id - Business ID.
   * @param {Partial<BusinessData>} payload - Fields to update.
   * @returns {Promise<BusinessData>}
   */
  updateBusiness: async (
    id: string,
    payload: Partial<BusinessData>,
  ): Promise<BusinessData> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to update business");
    return data;
  },

  /**
   * Specialized update for invoice-specific branding and visibility settings.
   * @param {string} id - Business ID.
   * @param {Partial<InvoiceSettings>} payload - Updated settings.
   * @returns {Promise<InvoiceSettings>}
   */
  updateInvoiceSettings: async (
    id: string,
    payload: Partial<InvoiceSettings>,
  ): Promise<InvoiceSettings> => {
    const response = await fetch(`${BASE_URL}/${id}/invoice-settings`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to update invoice settings");

    return data.settings;
  },

  /**
   * Allows the current user to leave a business organization.
   * @param {string} businessId - ID of the business to leave.
   * @returns {Promise<any>}
   */
  leaveBusiness: async (businessId: string): Promise<any> => {
    const response = await fetch(`${BASE_URL}/${businessId}/leave`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to leave business");
    return data;
  },

  /**
   * Uploads a business logo file.
   * @param {string} id - Business ID.
   * @param {FormData} formData - Multipart file data.
   */
  uploadLogo: async (id: string, formData: FormData) => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${BASE_URL}/${id}/upload-logo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Upload failed");
    return data;
  },

  /**
   * Deletes the current business logo.
   * @param {string} id - Business ID.
   */
  deleteLogo: async (id: string) => {
    const response = await fetch(`${BASE_URL}/${id}/logo`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Delete failed");
    return data;
  },

  /**
   * Fetches the list of active members and pending invitations.
   * @param {string} id - Business ID.
   * @param {string} search - Optional search query for names/emails.
   */
  getMembers: async (id: string, search: string = "") => {
    const token = localStorage.getItem("accessToken");
    const url = new URL(`${BASE_URL}/${id}/members`);

    if (search) url.searchParams.append("search", search);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to fetch members");
    return data;
  },

  /**
   * Sends an email invitation to a prospective team member.
   * @param {string} businessId - Business ID.
   * @param {object} payload - Invitee details and role.
   */
  inviteMember: async (
    businessId: string,
    payload: { email: string; name: string; role: string; title: string },
  ) => {
    const response = await fetch(`${BASE_URL}/${businessId}/invite`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to send invitation");
    return data;
  },

  /**
   * Removes a member from the team or cancels a pending invitation.
   * @param {string} businessId - Business ID.
   * @param {string} memberId - ID of the member or invitation record.
   */
  removeMember: async (businessId: string, memberId: string) => {
    const response = await fetch(
      `${BASE_URL}/${businessId}/members/${memberId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      },
    );
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to remove member");
    return data;
  },

  /**
   * Updates the access level (role) for an existing member.
   * @param {string} businessId - Business ID.
   * @param {string} memberId - Member ID.
   * @param {string} role - New role name.
   */
  updateMemberRole: async (
    businessId: string,
    memberId: string,
    role: string,
  ) => {
    const response = await fetch(
      `${BASE_URL}/${businessId}/members/${memberId}/role`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ role }),
      },
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update role");
    return data;
  },
};