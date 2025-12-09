'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEricaColors } from '@/hooks/useEricaColors';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { ERICA_COLORS_PERMISSIONS } from '@/constants/erica-colors.permissions';
import { EricaDimension, EricaState } from '@/types/erica-colors.types';
import {
  EricaColorsHeader,
  DimensionsTable,
  StatesTable,
  ColorPreview,
  ColorEditDialogs,
} from '@/components/features/erica-colors';

export default function EricaColorsPage() {
  const {
    colors,
    loading,
    error,
    updateDimensionColor,
    updateStateColor,
    fetchColors,
  } = useEricaColors();

  // Dialog states
  const [editingDimension, setEditingDimension] = useState<EricaDimension | null>(null);
  const [editingState, setEditingState] = useState<EricaState | null>(null);
  const [newColor, setNewColor] = useState('#000000');
  const [updating, setUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'dimension' | 'state'>('dimension');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dimensions');

  const handleEditDimensionClick = (dimension: EricaDimension, color: string) => {
    setEditingDimension(dimension);
    setNewColor(color);
    setConfirmType('dimension');
    setShowConfirm(false);
  };

  const handleEditStateClick = (state: EricaState, color: string) => {
    setEditingState(state);
    setNewColor(color);
    setConfirmType('state');
    setShowConfirm(false);
  };

  const handleConfirmUpdate = async () => {
    try {
      setUpdating(true);
      if (confirmType === 'dimension' && editingDimension) {
        await updateDimensionColor(editingDimension, newColor);
        toast.success('Color de dimensión actualizado');
      } else if (confirmType === 'state' && editingState) {
        await updateStateColor(editingState, newColor);
        toast.success('Color de estado actualizado');
      }
      setShowConfirm(false);
      setEditingDimension(null);
      setEditingState(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar';
      toast.error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ProtectedPage {...ERICA_COLORS_PERMISSIONS.READ}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50">
        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <EricaColorsHeader onRefresh={fetchColors} isLoading={loading} />

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center flex-shrink-0">
                <span className="text-red-700 dark:text-red-200 font-bold text-xs">!</span>
              </div>
              <div>
                <p className="font-semibold mb-1">Error al cargar colores</p>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
              <p className="text-muted-foreground">Cargando paleta de colores...</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 h-auto rounded-lg shadow-sm">
                  <TabsTrigger
                    value="dimensions"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-foreground data-[state=active]:shadow-sm px-6 py-2.5 text-sm font-medium rounded-md transition-all"
                  >
                    Dimensiones
                  </TabsTrigger>
                  <TabsTrigger
                    value="states"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-foreground data-[state=active]:shadow-sm px-6 py-2.5 text-sm font-medium rounded-md transition-all"
                  >
                    Estados de Desempeño
                  </TabsTrigger>
                </TabsList>

                {/* Dimensiones Tab */}
                <TabsContent value="dimensions" className="mt-8">
                  {colors?.dimensions && (
                    <DimensionsTable
                      dimensions={colors.dimensions}
                      onEditClick={handleEditDimensionClick}
                      copiedColor={copiedColor}
                    />
                  )}
                </TabsContent>

                {/* Estados Tab */}
                <TabsContent value="states" className="mt-8">
                  {colors?.states && (
                    <StatesTable
                      states={colors.states}
                      onEditClick={handleEditStateClick}
                      copiedColor={copiedColor}
                    />
                  )}
                </TabsContent>
              </Tabs>

              {/* Color Preview */}
              {colors?.dimensions && colors?.states && (
                <ColorPreview dimensions={colors.dimensions} states={colors.states} />
              )}
            </>
          )}
        </main>

        {/* Color Edit Dialogs */}
        <ColorEditDialogs
          editingDimension={editingDimension}
          editingState={editingState}
          newColor={newColor}
          showConfirm={showConfirm}
          updating={updating}
          confirmType={confirmType}
          onNewColorChange={setNewColor}
          onShowConfirmChange={setShowConfirm}
          onEditingDimensionChange={setEditingDimension}
          onEditingStateChange={setEditingState}
          onConfirmUpdate={handleConfirmUpdate}
        />
      </div>
    </ProtectedPage>
  );
}
