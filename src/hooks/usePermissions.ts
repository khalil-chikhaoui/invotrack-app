/**
 * @fileoverview Permissions Hook (RBAC)
 * Centralizes all role-based access logic for the frontend.
 * Mirrors the backend ROLES definition to ensure consistency.
 */

import { useMemo } from "react";
import { useParams } from "react-router";
import { useAuth } from "../context/AuthContext";

// --- Constants (Match Backend) ---
export const ROLES = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  VIEWER: "Viewer",
  DELIVER: "Deliver",
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

/**
 * Hook to derive permissions for the current authenticated user 
 * within the active business context.
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const { businessId } = useParams();

  /**
   * 1. Resolve the Role
   * finds the specific membership for the active businessId in the URL.
   */
  const role = useMemo(() => {
    if (!user || !businessId) return null;
    
    const membership = user.memberships.find((m) => {
      // Handle cases where businessId might be populated object or just string ID
      const mBizId = typeof m.businessId === 'string' ? m.businessId : m.businessId?._id;
      return mBizId === businessId;
    });

    return membership?.role as RoleType | null;
  }, [user, businessId]);

  // --- 2. Base Role Checks ---
  const isAdmin = role === ROLES.ADMIN;
  const isManager = role === ROLES.MANAGER;
  const isViewer = role === ROLES.VIEWER;
  const isDeliver = role === ROLES.DELIVER;

  // --- 3. Semantic Capability Helpers (The "Pro" Logic) ---

  return {
    role,
    isAdmin,
    isManager,
    isViewer,
    isDeliver,

    /** * @property canManage
     * General Operational Access.
     * Allows: Creating/Editing Invoices, Clients, Items.
     * Roles: Admin, Manager
     */
    canManage: isAdmin || isManager,

    /** * @property canManageSettings
     * High-level Business Settings.
     * Allows: Changing Company Name, Logo, Tax Settings, Inviting Users.
     * Roles: Admin Only
     */
    canManageSettings: isAdmin,

    /** * @property canDelete
     * Destructive Actions.
     * Allows: Deleting Invoices, Hard Deleting Clients.
     * Policy: Usually restricted to Admins to prevent data loss.
     */
    canDelete: isAdmin, 

    /** * @property canViewFinancials
     * Read Access to sensitive data.
     * Allows: Viewing dashboards, reports, invoice totals.
     * Roles: Admin, Manager, Viewer (Deliver is excluded)
     */
    canViewFinancials: isAdmin || isManager || isViewer,
    
    /** * @property canManageLogistics
     * Specific to shipping/delivery updates.
     * Roles: Admin, Manager, Deliver
     */
    canManageLogistics: isAdmin || isManager || isDeliver,
  };
};