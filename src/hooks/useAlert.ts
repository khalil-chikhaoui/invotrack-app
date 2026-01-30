import { useState, useEffect } from "react";

type AlertType = {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
} | null;

export function useAlert(timeout = 3000) {
  const [alert, setAlert] = useState<AlertType>(null);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [alert, timeout]);

  return { alert, setAlert };
}