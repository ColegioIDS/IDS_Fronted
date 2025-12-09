'use client';

import React from 'react';
import { EricaDimensionColor, EricaStateColor } from '@/types/erica-colors.types';

const calculateTextColor = (hexColor: string): string => {
  const rgb = hexColor.substring(1).match(/\w\w/g)?.map(x => parseInt(x, 16)) || [150, 150, 150];
  const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

interface ColorPreviewProps {
  dimensions: EricaDimensionColor[];
  states: EricaStateColor[];
}

export const ColorPreview: React.FC<ColorPreviewProps> = ({ dimensions, states }) => {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-foreground mb-8">Vista Previa</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Dimensiones Preview */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
          <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-6 uppercase tracking-widest">
            Dimensiones de ERICA
          </h3>
          <div className="flex gap-4 flex-wrap">
            {dimensions.map((dim) => {
              const dimensionCode = dim.dimension || 'D';
              const hexColor = dim.hexColor || '#CCCCCC';
              const textColor = calculateTextColor(hexColor);

              return (
                <div
                  key={`preview-dim-${dim.dimension || dim.id}`}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="h-16 w-16 rounded-lg flex items-center justify-center text-sm font-bold shadow-md border border-border/50"
                    style={{
                      backgroundColor: hexColor,
                      color: textColor,
                    }}
                    title={dim.name || dimensionCode}
                  >
                    {dimensionCode}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{dim.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estados Preview */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
          <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-6 uppercase tracking-widest">
            Estados de Desempeño
          </h3>
          <div className="flex gap-4 flex-wrap">
            {states.map((state) => {
              const stateCode = state.state || 'E';
              const hexColor = state.hexColor || '#999999';
              const textColor = calculateTextColor(hexColor);

              return (
                <div
                  key={`preview-state-${state.state || state.id}`}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className="h-16 w-16 rounded-lg flex items-center justify-center text-sm font-bold shadow-md border border-slate-200 dark:border-slate-700"
                    style={{
                      backgroundColor: hexColor,
                      color: textColor,
                    }}
                    title={state.name || stateCode}
                  >
                    {stateCode}
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center">
                    {state.points}pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
