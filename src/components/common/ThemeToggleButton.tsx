/**
 * @fileoverview ThemeToggleButton Component
 * Provides a UI control to switch the application between Light and Dark modes.
 * Utilizes ThemeContext for global state management and Tailwind's 'dark' variant for styling.
 */

import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";

export const ThemeToggleButton: React.FC = () => {
  const { toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle Dark Mode"
      className="relative flex items-center justify-center h-11 w-11 transition-all duration-300 bg-white 
      border border-gray-200 rounded-full hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-900 dark:border-gray-800
       dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white group"
    >
      {/* Sun Icon (Visible in Dark Mode) */}
      <div className="hidden dark:block group-hover:rotate-12 transition-transform">
        <HiOutlineSun className="w-5 h-5 text-gray-100" />
      </div>

      {/* Moon Icon (Visible in Light Mode) */}
      <div className="block dark:hidden group-hover:-rotate-12 transition-transform">
        <HiOutlineMoon className="w-5 h-5 text-gray-500" />
      </div>
    </button>
  );
};
