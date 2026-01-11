// src/components/features/signatures/SignatureStats.tsx

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Signature, CheckCircle2, AlertCircle } from 'lucide-react';

export function SignatureStats() {
  // TODO: Conectar con datos reales
  const stats = {
    total: 0,
    active: 0,
    inactive: 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total de Firmas</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <Signature className="h-8 w-8 text-blue-500 opacity-50" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Firmas Activas</p>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Firmas Inactivas</p>
            <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
          </div>
          <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
        </div>
      </Card>
    </div>
  );
}
