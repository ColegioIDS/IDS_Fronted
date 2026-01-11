// src/components/features/signatures/SignaturesGrid.tsx

'use client';

import React from 'react';
import { SignatureCard } from './SignatureCard';
import { AlertCircle } from 'lucide-react';

interface SignaturesGridProps {
  filters: any;
  onView?: (signature: any) => void;
  onEdit?: (signature: any) => void;
  onDelete?: (signature: any) => void;
  onSetDefault?: (signature: any) => void;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canSetDefault?: boolean;
}

export function SignaturesGrid({
  filters,
  onView,
  onEdit,
  onDelete,
  onSetDefault,
  canView = false,
  canEdit = false,
  canDelete = false,
  canSetDefault = false,
}: SignaturesGridProps) {
  // TODO: Conectar con useSignatures hook
  const signatures: any[] = [];
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (signatures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-300 mb-2" />
        <p className="text-gray-500">No hay firmas digitales registradas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {signatures.map((signature) => (
        <SignatureCard
          key={signature.id}
          signature={signature}
          onView={() => onView?.(signature)}
          onEdit={() => onEdit?.(signature)}
          onDelete={() => onDelete?.(signature)}
          onSetDefault={() => onSetDefault?.(signature)}
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
          canSetDefault={canSetDefault}
        />
      ))}
    </div>
  );
}
