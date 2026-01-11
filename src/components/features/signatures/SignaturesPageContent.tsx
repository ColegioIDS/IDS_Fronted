// src/components/features/signatures/SignaturesPageContent.tsx

'use client';

import React, { useState } from 'react';
import { Plus, Settings2, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  SignaturesGrid,
  SignaturesTable,
  SignatureFilters,
  SignatureFormDialog,
  SignatureDetailDialog,
  DeleteSignatureDialog,
  SignatureStats,
} from './index';

/**
 * 🖊️ Componente principal de la página de Signatures
 */
interface SignaturesPageContentProps {
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canSetDefault?: boolean;
  canExport?: boolean;
}

export function SignaturesPageContent({
  canView = false,
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canSetDefault = false,
  canExport = false,
}: SignaturesPageContentProps) {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: 'active',
  });

  const handleCreateClick = () => {
    if (!canCreate) {
      toast.error('No tienes permisos para crear firmas');
      return;
    }
    setSelectedSignature(null);
    setIsFormOpen(true);
  };

  const handleViewDetail = (signature: any) => {
    if (!canView) {
      toast.error('No tienes permisos para ver detalles');
      return;
    }
    setSelectedSignature(signature);
    setIsDetailOpen(true);
  };

  const handleEdit = (signature: any) => {
    if (!canEdit) {
      toast.error('No tienes permisos para editar firmas');
      return;
    }
    setSelectedSignature(signature);
    setIsFormOpen(true);
  };

  const handleDelete = (signature: any) => {
    if (!canDelete) {
      toast.error('No tienes permisos para eliminar firmas');
      return;
    }
    setSelectedSignature(signature);
    setIsDeleteOpen(true);
  };

  const handleSetDefault = (signature: any) => {
    if (!canSetDefault) {
      toast.error('No tienes permisos para establecer firma por defecto');
      return;
    }
    toast.success(`Firma ${signature.name} establecida como por defecto`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Firmas Digitales</h1>
          <p className="text-gray-500">
            Gestiona las firmas de autoridades escolares para cartas de notas
          </p>
        </div>
        <Button onClick={handleCreateClick} disabled={!canCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Firma
        </Button>
      </div>

      {/* Stats */}
      <SignatureStats />

      {/* Filters y View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <SignatureFilters filters={filters} onFiltersChange={setFilters} />
        <div className="flex gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {view === 'grid' ? (
        <SignaturesGrid
          filters={filters}
          onView={handleViewDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSetDefault={handleSetDefault}
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
          canSetDefault={canSetDefault}
        />
      ) : (
        <SignaturesTable
          filters={filters}
          onView={handleViewDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSetDefault={handleSetDefault}
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
          canSetDefault={canSetDefault}
        />
      )}

      {/* Dialogs */}
      <SignatureFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        signature={selectedSignature}
        canEdit={canEdit}
      />
      <SignatureDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        signature={selectedSignature}
      />
      <DeleteSignatureDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        signature={selectedSignature}
      />
    </div>
  );
}
