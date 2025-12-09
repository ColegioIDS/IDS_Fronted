'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { EricaDimensionColor, EricaDimension } from '@/types/erica-colors.types';
import { ProtectedContent } from '@/components/shared/permissions/ProtectedContent';
import { ERICA_COLORS_PERMISSIONS } from '@/constants/erica-colors.permissions';

interface DimensionsTableProps {
  dimensions: EricaDimensionColor[];
  onEditClick: (dimension: EricaDimension, color: string) => void;
  copiedColor?: string | null;
}

export const DimensionsTable: React.FC<DimensionsTableProps> = ({
  dimensions,
  onEditClick,
  copiedColor = null,
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  return (
    <ProtectedContent {...ERICA_COLORS_PERMISSIONS.MANAGE} hideOnNoPermission>
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.5fr_auto_auto_auto] gap-6 px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          <span>Dimensión</span>
          <span className="w-28 text-center">Color</span>
          <span className="w-40 text-center">Valor Hex</span>
          <span className="w-24 text-center">Acción</span>
        </div>
        {dimensions.map((dim, index) => (
          <div
            key={`dim-${index}-${dim.dimension || dim.id}`}
            className={`grid grid-cols-[1.5fr_auto_auto_auto] gap-6 px-6 py-5 items-center ${
              index !== dimensions.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''
            } hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors duration-150`}
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-semibold text-foreground text-base">
                {dim.name || dim.dimension || 'SIN NOMBRE'}
              </span>
              <span className="text-xs text-muted-foreground leading-relaxed">
                {dim.description || ''}
              </span>
            </div>
            <div className="w-28 flex justify-center">
              <div
                className="w-10 h-10 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                style={{ backgroundColor: dim.hexColor }}
                title={dim.hexColor}
              />
            </div>
            <div className="w-40 flex items-center justify-center gap-2">
              <code className="text-sm font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                {dim.hexColor}
              </code>
              <button
                onClick={() => copyToClipboard(dim.hexColor)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Copiar color"
              >
                {copiedColor === dim.hexColor ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
            <div className="w-24 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditClick(dim.dimension as EricaDimension, dim.hexColor)}
                className="text-xs font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                Editar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ProtectedContent>
  );
};
