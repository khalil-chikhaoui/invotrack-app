/**
 * @fileoverview useModal Hook
 * A specialized state management hook for modals, drawers, and overlays.
 * Utilizes memoized callbacks to maintain high performance in complex UI trees.
 */

import { useState, useCallback } from "react";

/**
 * Custom hook to manage the open/closed state of a modal component.
 * * @param {boolean} initialState - The starting visibility of the modal (defaults to false).
 * @returns {object} An object containing the visibility state and control handlers.
 */
export const useModal = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  /**
   * Sets the modal state to visible.
   * Memoized with useCallback to prevent reference changes on parent re-renders.
   */
  const openModal = useCallback(() => setIsOpen(true), []);

  /**
   * Sets the modal state to hidden.
   * Memoized with useCallback to prevent reference changes on parent re-renders.
   */
  const closeModal = useCallback(() => setIsOpen(false), []);

  /**
   * Switches the modal between visible and hidden.
   */
  const toggleModal = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, openModal, closeModal, toggleModal };
};
