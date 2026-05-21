import { useEffect } from "react";
import { useLocation } from "react-router";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Scroll the window (for full-page scrolls)
    window.scrollTo(0, 0);

    // 2. Scroll the specific layout container
    const container = document.getElementById("main-content");
    if (container) {
      container.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto", 
      });
    }
  }, [pathname]);

  return null;
}