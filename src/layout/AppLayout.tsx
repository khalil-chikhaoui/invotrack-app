/**
 * @fileoverview AppLayout Component
 * Defines the high-level structural grid of the application.
 * Manages the relationship between the Sidebar, Header, and the dynamic
 * Content Area (Outlet), including responsive spacing and background aesthetics.
 */

import React from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

/**
 * LayoutContent handles the conditional styling based on Sidebar state.
 * It must be a child of SidebarProvider to access the context.
 */
const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="h-[100dvh] w-full overflow-hidden xl:flex  bg-white dark:bg-gray-900">
      {/* --- Sidebar & Mobile Overlay --- */}
      <div>
        <AppSidebar />
        <Backdrop />
      </div>

      {/* --- Main Content Area --- */}
      <div
        id="main-content"
        className={`flex-1 h-full overflow-y-auto transition-all duration-300 ease-in-out 
          ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"} 
          ${isMobileOpen ? "ml-0" : ""}
        `}
      >
        {/* Persistent Header */}
        <AppHeader />

        {/* Dynamic Page Content */}
        <div className="py-4 px-2 md:px-4 pb-24 md:pb-8 safe-area-bottom">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

/**
 * AppLayout encapsulates the SidebarProvider to ensure all layout
 * components share the same navigational state.
 */
const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export const scrollToTopAppLayout = () => {
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

export default AppLayout;
