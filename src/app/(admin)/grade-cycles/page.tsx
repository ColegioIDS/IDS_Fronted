// src/app/(admin)/grade-cycles/page.tsx
'use client';

import React, { useState } from 'react';
import { GradeCycleWizard, GradeCycleList } from '@/components/features/grade-cycles';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function GradeCyclesPage() {
  const [showWizard, setShowWizard] = useState(false);

  if (showWizard) {
    return (
      <div className="container mx-auto py-8 px-4">
        {/* Botón para volver */}
        <Button
          variant="ghost"
          onClick={() => setShowWizard(false)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la lista
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Configurar Ciclo Escolar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Asigna grados disponibles para el ciclo escolar
          </p>
        </div>

        <GradeCycleWizard
          onSuccess={() => {
            setShowWizard(false);
          }}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestión de Ciclos y Grados
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra qué grados están disponibles en cada ciclo escolar
        </p>
      </div>

      <GradeCycleList onCreateNew={() => setShowWizard(true)} />
    </div>
  );
}
