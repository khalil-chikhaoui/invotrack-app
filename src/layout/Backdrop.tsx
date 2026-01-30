/**
 * @fileoverview Backdrop Component
 * Provides a semi-transparent overlay that appears behind the mobile sidebar.
 * Functions as a global click-listener to dismiss the mobile drawer when
 * the user clicks outside the navigation area.
 */

import { useSidebar } from "../context/SidebarContext";

/**
 * Mobile Overlay Component
 * @returns {JSX.Element | null} The backdrop overlay or null if sidebar is closed.
 */
const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  // 1. Logic: Only render when the mobile sidebar is active
  if (!isMobileOpen) return null;

  return (
    <div
      /**
       * Styling & Positioning:
       * - fixed inset-0: Covers the entire viewport.
       * - z-40: Positioned above main content but below the Sidebar (z-50).
       * - lg:hidden: Ensures the backdrop never appears on desktop resolutions.
       */
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      /**
       * Accessibility & Interaction:
       * Clicking the backdrop triggers the toggle function to close the drawer.
       */
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
