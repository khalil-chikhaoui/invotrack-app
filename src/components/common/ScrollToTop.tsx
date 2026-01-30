import { useEffect } from "react";
import { useLocation } from "react-router";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Scroll the window (for Auth pages)
    window.scrollTo(0, 0);

    // 2. Scroll the Dashboard container (target the ID )
    const container = document.getElementById("main-content");
    if (container) {
      container.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto", // iOS works better with 'auto' than 'instant'
      });
    }
  }, [pathname]);

  return null;
}
