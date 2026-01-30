/**
 * @fileoverview Authentication API Service
 * Handles all user-related network requests including login, registration,
 * profile management, and security flows.
 */

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:3040/api";

/**
 * Base endpoint for user-related authentication and profile actions.
 */
const BASE_URL = `${API_ROOT}/users`;

/**
 * Helper utility to retrieve the current JWT and construct standard headers.
 * @returns {Record<string, string>} Headers including Content-Type and Authorization.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Service object containing methods for interacting with the Auth API.
 */
export const authApi = {
  /**
   * Authenticates a user and retrieves an access token.
   * @param {object} credentials - { email, password, language }
   * @returns {Promise<any>} The user session data.
   */
  signIn: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${BASE_URL}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.message || "Invalid credentials");
    return data;
  },

  /**
   * Registers a new user account.
   * @param {object} credentials - { name, email, password, language }
   * @returns {Promise<any>} The newly created user data.
   */
  signUp: async (credentials: { name: string; email: string; password: string; language: string }) => {
    const response = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Registration failed");
    return data;
  },

  /**
   * Verifies the user's email address using the OTP code.
   * @param {object} payload - { email: string, code: string }
   * @returns {Promise<any>} Success message and user token.
   */
  verifyEmail: async (payload: { email: string; code: string }) => {
    const response = await fetch(`${BASE_URL}/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) 
      throw new Error(data.message || "Verification failed");
    return data;
  },

  /**
   * Resends the verification OTP to the user's email.
   * @param {string} email - The user's email address.
   * @returns {Promise<any>} Confirmation message.
   */
  resendVerification: async (email: string) => {
    const response = await fetch(`${BASE_URL}/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) 
      throw new Error(data.message || "Failed to resend code");
    return data;
  },

  // --------------------------------

  /**
   * Fetches the profile data of the currently authenticated user.
   * @returns {Promise<any>} The user profile object.
   */
  getProfile: async () => {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to fetch profile");
    return data;
  },

  /**
   * Updates user account information.
   * @param {object} payload - The updated profile fields.
   * @returns {Promise<any>} The updated user object.
   */
  updateProfile: async (payload: object) => {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to update profile");
    return data;
  },

  /**
   * Initiates the password recovery flow.
   * @param {string} email - The user's registered email address.
   * @returns {Promise<any>} Confirmation message.
   */
  forgotPassword: async (email: string) => {
    const response = await fetch(`${BASE_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to send reset link");
    return data;
  },

  /**
   * Resets the user's password using a verification token.
   * @param {object} payload - Object containing the token and new password.
   * @returns {Promise<any>} Confirmation of password update.
   */
  resetPassword: async (payload: object) => {
    const response = await fetch(`${BASE_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to update password");
    return data;
  },

  /**
   * Uploads a new avatar image to the server.
   * @param {FormData} formData - Multipart data containing the image file.
   * @returns {Promise<any>} The updated image URL metadata.
   */
  uploadAvatar: async (formData: FormData) => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${BASE_URL}/upload-avatar`, {
      method: "POST",
      // Content-Type is omitted to allow the browser to set the boundary for FormData
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to upload avatar");
    return data;
  },

  /**
   * Removes the user's current avatar.
   * @returns {Promise<any>} Confirmation of deletion.
   */
  deleteAvatar: async () => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${BASE_URL}/avatar`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to delete avatar");
    return data;
  },
};