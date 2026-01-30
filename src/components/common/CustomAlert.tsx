/**
 * @fileoverview CustomAlert Component
 * A high-level wrapper for the UI Alert component.
 * Provides conditional rendering, entry animations, and standardizes
 * notification data structures across the application.
 */

import React from "react";
import Alert from "../ui/alert/Alert";

/**
 * Prop Definition for CustomAlert
 * @property {object | null} data - The notification payload. If null, component remains hidden.
 * @property {function} onClose - Callback for manual dismissal of the alert.
 */
interface CustomAlertProps {
  data: {
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null;
  onClose?: () => void;
}

/**
 * Global Notification Wrapper
 */
const CustomAlert: React.FC<CustomAlertProps> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="mb-6 animate-fadeIn">
      <Alert
        variant={data.type}
        title={data.title}
        message={data.message}
        onClose={onClose}
        showLink={false}
      />
    </div>
  );
};

export default CustomAlert;
