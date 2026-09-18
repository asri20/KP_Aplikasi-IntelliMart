import { useCallback, useState } from 'react';

/**
 * Custom hook untuk mengelola boolean state (modal, drawer, etc)
 * @param {boolean} initialState - Initial state
 * @returns {Object} Disclosure state and handlers
 * 
 * @example
 * const modal = useDisclosure();
 * // modal.isOpen, modal.open(), modal.close(), modal.toggle()
 */
export function useDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
