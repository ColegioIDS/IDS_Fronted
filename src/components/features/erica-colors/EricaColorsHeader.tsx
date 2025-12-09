'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Palette } from 'lucide-react';

interface EricaColorsHeaderProps {
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

export const EricaColorsHeader: React.FC<EricaColorsHeaderProps> = ({ 
  onRefresh, 
  isLoading = false 
}) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="mb-12 flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Paleta de Colores</h1>
        </div>
        <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
          Personaliza los colores para dimensiones y estados de desempeño del sistema ERICA. Cada dimensión representa una habilidad cognitiva y cada estado indica el nivel de desempeño alcanzado.
        </p>
      </div>
      <Button
        variant="outline"
        size="lg"
        onClick={handleRefresh}
        disabled={refreshing || isLoading}
        className="gap-2 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 h-12 px-6"
      >
        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        <span className="font-medium">Recargar</span>
      </Button>
    </div>
  );
};
