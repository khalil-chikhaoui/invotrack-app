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
    // 1. Updated Base Background Colors & Added relative positioning for children
    <div className="h-[100dvh] w-full overflow-hidden xl:flex bg-transparent relative ">
      {/* --- Sidebar & Mobile Overlay --- */}
      {/* Added relative z-20 to ensure Sidebar sits ABOVE the background blobs */}
      <div className="relative z-20">
        <AppSidebar />
        <Backdrop />
      </div>

      {/* --- Main Content Area --- */}
      {/* Added relative z-10 to ensure content sits ABOVE background */}
      <div
        id="main-content"
        className={`relative z-10 flex-1 h-full overflow-y-auto transition-all duration-300 ease-in-out 
          ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"} 
          ${isMobileOpen ? "ml-0" : ""}
        `}
      >
        {/* Persistent Header */}
        <AppHeader />

        {/* Dynamic Page Content */}
        <div className="py-4 pb-24 md:pb-8 safe-area-bottom px-4 md:px-2">
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
