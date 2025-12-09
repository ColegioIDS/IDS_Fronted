// src/context/EricaColorsContext.tsx

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useEricaColors } from '@/hooks/useEricaColors';
import {
  EricaColorsResponse,
  EricaDimension,
  EricaState,
  EricaDimensionColor,
  EricaStateColor,
} from '@/types/erica-colors.types';

interface EricaColorsContextType {
  colors: EricaColorsResponse | null;
  loading: boolean;
  error: string | null;
  getDimensionColor: (dimension: EricaDimension) => string;
  getStateColor: (state: EricaState) => string;
  getStateLabel: (state: EricaState) => string;
  getDimension: (dimension: EricaDimension) => EricaDimensionColor | undefined;
  getState: (state: EricaState) => EricaStateColor | undefined;
  updateDimensionColor: (dimension: EricaDimension, colorHex: string) => Promise<EricaDimensionColor>;
  updateStateColor: (state: EricaState, colorHex: string) => Promise<EricaStateColor>;
  fetchColors: () => Promise<void>;
}

const EricaColorsContext = createContext<EricaColorsContextType | undefined>(
  undefined
);

export function EricaColorsProvider({ children }: { children: ReactNode }) {
  const ericaColors = useEricaColors();

  return (
    <EricaColorsContext.Provider value={ericaColors}>
      {children}
    </EricaColorsContext.Provider>
  );
}

export function useEricaColorsContext() {
  const context = useContext(EricaColorsContext);
  if (context === undefined) {
    throw new Error(
      'useEricaColorsContext debe ser usado dentro de EricaColorsProvider'
    );
  }
  return context;
}
