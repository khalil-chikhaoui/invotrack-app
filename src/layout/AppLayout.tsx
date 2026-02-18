/**
 * @fileoverview AppLayout Component
 * Defines the high-level structural grid of the application.
 */

import React from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

/**
 * LayoutContent handles the conditional styling based on Sidebar state.
 */
const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="h-[100dvh] w-full overflow-hidden xl:flex bg-transparent relative">
      {/* --- Sidebar & Mobile Overlay --- */}
      <div className="relative z-20">
        <AppSidebar />
        <Backdrop />
      </div>

      {/* --- Main Content Area --- */}
      <div
        id="main-content"
        // 1. Added 'flex flex-col': This stacks the Header and Content vertically
        className={`relative z-10 flex-1 h-full overflow-y-auto transition-all duration-300 ease-in-out flex flex-col
          ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"} 
          ${isMobileOpen ? "ml-0" : ""}
        `}
      >
        {/* Persistent Header */}
        <AppHeader />

        {/* Dynamic Page Content */}
        {/* 2. Added 'flex-1 flex flex-col': 
               - 'flex-1' forces this div to consume all remaining height (pushing footer down).
               - 'flex flex-col' ensures the <Outlet>'s child (your Members page) 
                 can successfully use 'flex-1' or 'h-full'.
        */}
        <div className="flex-1 flex flex-col py-4 pb-24 md:pb-8 safe-area-bottom p-1 md:px-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

/**
 * AppLayout encapsulates the SidebarProvider.
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