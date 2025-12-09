"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ActiveSelectorContextType {
  activeSelector: string | null;
  setActiveSelector: (id: string | null) => void;
  toggleSelector: (id: string) => void;
}

const ActiveSelectorContext = createContext<ActiveSelectorContextType | undefined>(undefined);

export function ActiveSelectorProvider({ children }: { children: React.ReactNode }) {
  const [activeSelector, setActiveSelector] = useState<string | null>(null);

  const toggleSelector = useCallback((id: string) => {
    setActiveSelector(prev => prev === id ? null : id);
  }, []);

  return (
    <ActiveSelectorContext.Provider value={{ activeSelector, setActiveSelector, toggleSelector }}>
      {children}
    </ActiveSelectorContext.Provider>
  );
}

export function useActiveSelector() {
  const context = useContext(ActiveSelectorContext);
  if (!context) {
    throw new Error('useActiveSelector must be used within ActiveSelectorProvider');
  }
  return context;
}
