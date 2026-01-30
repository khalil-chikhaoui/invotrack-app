/**
 * @fileoverview Dashboard API Service
 * Handles fetching aggregated business intelligence data, financial metrics,
 * and chart visualizations for the main dashboard.
 */

// ✅ FIX: Use the Environment Variable for the API URL
const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:3040/api";

const BASE_URL = `${API_ROOT}/dashboard-stats`;

// ==========================================
// --- Interfaces ---
// ==========================================

/**
 * Represents a single financial metric with comparison data.
 */
export interface DashboardMetric {
  value: number;
  previous: number;
  change: string; // e.g. "12.5" (representing percentage)
  isPositive: boolean;
}

/**
 * The core response structure for the top-level dashboard cards.
 */
export interface DashboardStatsResponse {
  revenue: DashboardMetric;
  profit: DashboardMetric;
  invoices: DashboardMetric;
  clients: DashboardMetric;
  meta: {
    compareStart: string; 
    compareEnd: string;
  };
}

/**
 * Data point for the Revenue vs Profit Area Chart.
 */
export interface DashboardChartPoint {
  label: string; // e.g., "Oct 01" or "2023-10"
  revenue: number;
  profit: number;
}

/**
 * Data structure for top-performing products/services.
 */
export interface TopItemsResponse {
  stats: {
    label: string;
    value: number;
    quantity: number;
  }[];
}

/**
 * Data structure for Delivery Stats.
 */
export interface DeliveryStatsResponse { 
  Pending: number; 
  Shipped: number; 
  Delivered: number; 
  Returned: number; 
}

export interface ProfitStat {
  label: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ClientProfitResponse {
  stats: ProfitStat[];
}

// ==========================================
// --- API Implementation ---
// ==========================================

/**
 * Helper utility to construct authenticated request headers.
 * Fetches a fresh token from localStorage on every execution.
 * @returns {Record<string, string>} Authenticated headers.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

/**
 * Service object containing methods for interacting with Dashboard endpoints.
 */
export const dashboardApi = {
  /**
   * Fetches the 4 Key Cards (Revenue, Profit, Invoices, Clients).
   */
  getStats: async (
    businessId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<DashboardStatsResponse> => {
    // ✅ FIX: Removed window.location.origin
    const url = new URL(`${BASE_URL}/stats`);
    url.searchParams.append("businessId", businessId);
    url.searchParams.append("startDate", startDate.toISOString());
    url.searchParams.append("endDate", endDate.toISOString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch dashboard stats");
    return data;
  },

  /**
   * Fetches the Revenue vs Profit Chart Data.
   */
  getChartData: async (
    businessId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<DashboardChartPoint[]> => {
    // ✅ FIX: Removed window.location.origin
    const url = new URL(`${BASE_URL}/chart`);
    url.searchParams.append("businessId", businessId);
    url.searchParams.append("startDate", startDate.toISOString());
    url.searchParams.append("endDate", endDate.toISOString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch chart data");
    return data;
  },

  /**
   * Retrieves the top-selling items (by revenue) for the selected period.
   */
  getTopSellingItems: async (
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TopItemsResponse> => {
    // ✅ FIX: Removed window.location.origin
    const url = new URL(`${BASE_URL}/top-items`);
    url.searchParams.append("businessId", businessId);
    url.searchParams.append("startDate", startDate.toISOString());
    url.searchParams.append("endDate", endDate.toISOString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch top items");
    return data;
  },


  getDeliveryStats: async (
    businessId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<DeliveryStatsResponse> => {
    // ✅ FIX: Removed window.location.origin
    const url = new URL(`${BASE_URL}/delivery`);
    url.searchParams.append("businessId", businessId);
    url.searchParams.append("startDate", startDate.toISOString());
    url.searchParams.append("endDate", endDate.toISOString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch delivery stats");
    return data;
  },

  getClientProfitability: async (
    businessId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<ClientProfitResponse> => {
    // ✅ FIX: Removed window.location.origin
    const url = new URL(`${BASE_URL}/client-profitability`);
    url.searchParams.append("businessId", businessId);
    url.searchParams.append("startDate", startDate.toISOString());
    url.searchParams.append("endDate", endDate.toISOString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch profit stats");
    return data;
  },
};