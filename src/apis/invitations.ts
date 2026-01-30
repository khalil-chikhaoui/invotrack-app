/**
 * @fileoverview Invitations API Service
 * Handles the verification and acceptance of team invitations.
 * Manages the transition from an invite token to a full user session.
 */

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:3040/api";

/**
 * Base endpoint for invitation-related operations.
 */
const BASE_URL = `${API_ROOT}/invitations`;

// --- Interfaces ---

/**
 * Response structure for token validation.
 * Used to determine the UI state (e.g., showing a login form vs. a registration form).
 */
export interface InvitationValidationResponse {
  isValid: boolean;
  email: string;
  name?: string;
  role: string;
  business: {
    _id: string;
    name: string;
    logo?: string;
  };
  userExists: boolean;
}

/**
 * Service object containing methods for token validation and invitation acceptance.
 */
export const invitationsApi = {
  /**
   * Verifies the validity of an invitation token.
   * This is typically called on the landing page of the invitation link.
   * @param {string} token - The unique secret token from the invitation URL.
   * @returns {Promise<InvitationValidationResponse>} Data about the invite and the target business.
   */
  validateToken: async (
    token: string,
  ): Promise<InvitationValidationResponse> => {
    const response = await fetch(`${BASE_URL}/${token}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Invalid invitation");
    return data;
  },

  /**
   * For existing users: Validates the token and password, then links the user to the business.
   * @param {object} payload - Contains the invite token and the user's existing password.
   * @returns {Promise<any>} The authenticated user session data.
   */
  acceptAndLogin: async (payload: { token: string; password: string }) => {
    const response = await fetch(`${BASE_URL}/accept-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to accept");
    return data;
  },

  /**
   * For new users: Validates the token, creates a new account, and links it to the business.
   * @param {object} payload - Contains token, user's chosen password, full name, and preferred language.
   * @returns {Promise<any>} The newly created user session data.
   */
  acceptAndRegister: async (payload: {
    token: string;
    password: string;
    name: string;
    language: string; // <--- ADDED THIS FIELD
  }) => {
    const response = await fetch(`${BASE_URL}/accept-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to register");
    return data;
  },
};