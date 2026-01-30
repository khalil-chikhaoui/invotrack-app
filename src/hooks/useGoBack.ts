/**
 * @fileoverview useGoBack Hook
 * Provides a safe navigation utility to return to the previous screen.
 * Prevents application exit by falling back to the dashboard if no internal
 * history exists.
 */

import { useNavigate } from "react-router";

/**
 * Custom hook for smart "Back" button functionality.
 * * @returns {Function} goBack - Function to trigger the navigation logic.
 */
const useGoBack = () => {
  const navigate = useNavigate();

 
  const goBack = () => {
   
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1); // Navigate one step back in the stack
    } else {
      navigate("/"); // Safe fallback to the home/root directory
    }
  };

  return goBack;
};

export default useGoBack;
