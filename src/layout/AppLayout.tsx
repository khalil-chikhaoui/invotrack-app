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
    // FIX 1: Use h-[100dvh] instead of h-screen.
    // This ensures the outer wrapper respects the iPhone address bar/toolbar size.
    <div className="h-[100dvh] w-full overflow-hidden xl:flex bg-gray-50 dark:bg-gray-900">
      
      {/* --- Sidebar & Mobile Overlay --- */}
      <div>
        <AppSidebar />
        <Backdrop />
      </div>

      {/* --- Main Content Area --- */}
      <div
        id="main-content"
        // FIX 2: Changed h-screen to h-full. 
        // It must fit inside the 100dvh parent, not force a new screen height.
        className={`flex-1 h-full overflow-y-auto transition-all duration-300 ease-in-out 
          ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"} 
          ${isMobileOpen ? "ml-0" : ""}
          
          /* Aesthetic Grid Pattern */
          bg-[radial-gradient(#d1d5db_1px,transparent_1px)] 
          dark:bg-[radial-gradient(#ffffff15_1px,transparent_1px)] 
          [background-size:20px_20px]
        `}
      >
        {/* Persistent Header */}
        <AppHeader /> 

        {/* Dynamic Page Content */}
        {/* FIX 3: Added pb-20 and safe-area padding to ensure bottom content clears the iPhone Home indicator */}
        <div className="py-4 px-2 md:px-4  pb-24 md:pb-8 safe-area-bottom">
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
    window.scrollTo({ top: 0, behavior: "smooth" }); // Fallback
  }
};

export default AppLayout;