/**
 * @fileoverview Application Root Entry Point
 * Handles global polyfills, style injections, and the initial
 * rendering of the React component tree within global context providers.
 */
import './i18n';

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// --- Global Styles ---
import "./index.css";
import "swiper/swiper-bundle.css"; // Slider/Carousel styles
import "flatpickr/dist/flatpickr.css"; // Date picker styles

// --- Core Application ---
import App from "./App.tsx";

// --- Context Providers & Wrappers ---
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";

/**
 * Renders the React application into the 'root' DOM element.
 * * Hierarchy:
 * - ThemeProvider: Manages light/dark mode state.
 * - AppWrapper: Handles page metadata, SEO, and document structure.
 * - App: Contains the routing and main logic.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AppWrapper>
        <App />
      </AppWrapper>
    </ThemeProvider>
  </StrictMode>,
);
