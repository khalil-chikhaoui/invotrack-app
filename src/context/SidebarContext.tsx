/**
 * @fileoverview Sidebar Context Provider
 * Manages the state and behavior of the application's navigation sidebar.
 * Handles desktop expansion, mobile drawer visibility, and submenu orchestration.
 */

import { createContext, useContext, useState, useEffect } from "react";

/**
 * Defines the operational state of the Sidebar.
 */
type SidebarContextType = {
  isExpanded: boolean; // Desktop: Full width vs Mini-sidebar
  isMobileOpen: boolean; // Mobile: Drawer open/close status
  isHovered: boolean; // Logic for expanding on hover when in mini-mode
  activeItem: string | null; // Currently selected navigation path
  openSubmenu: string | null; // Currently expanded parent menu item
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
  setIsMobileOpen: (open: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

/**
 * Custom hook to access Sidebar state.
 * @throws {Error} If consumed outside of a SidebarProvider.
 */
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

/**
 * Provider component for global Sidebar state management.
 */
export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  /**
   * Listen for window resize to sync mobile state and auto-close drawers
   * when transitioning back to desktop view.
   */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768; // Threshold for mobile view
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const toggleSubmenu = (item: string) => {
    setOpenSubmenu((prev) => (prev === item ? null : item));
  };

  return (
    <SidebarContext.Provider
      value={{
        // Desktop sidebar width logic
        isExpanded: isMobile ? false : isExpanded,
        isMobileOpen,
        setIsMobileOpen,
        isHovered,
        activeItem,
        openSubmenu,
        toggleSidebar,
        toggleMobileSidebar,
        setIsHovered,
        setActiveItem,
        toggleSubmenu,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
