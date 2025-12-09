"use client";

import React, { createContext, useContext, useState } from 'react';

type SelectorMode = 'popover' | 'dropdown';

interface StateSelectorContextType {
  mode: SelectorMode;
  setMode: (mode: SelectorMode) => void;
}

const StateSelectorContext = createContext<StateSelectorContextType | undefined>(undefined);

export function StateSelectorProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<SelectorMode>('popover');

  return (
    <StateSelectorContext.Provider value={{ mode, setMode }}>
      {children}
    </StateSelectorContext.Provider>
  );
}

export function useStateSelectorMode() {
  const context = useContext(StateSelectorContext);
  if (!context) {
    throw new Error('useStateSelectorMode must be used within StateSelectorProvider');
  }
  return context;
}
