// src/app/(admin)/grade-cycles/page.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { GradeCycleWizard, GradeCycleList } from '@/components/features/grade-cycles';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function GradeCyclesPage() {
  const [showWizard, setShowWizard] = useState(false);
  const { hasPermission } = useAuth();

  const canRead = hasPermission(MODULES_PERMISSIONS.GRADE_CYCLE.READ.module, MODULES_PERMISSIONS.GRADE_CYCLE.READ.action);
  const canCreate = hasPermission(MODULES_PERMISSIONS.GRADE_CYCLE.CREATE.module, MODULES_PERMISSIONS.GRADE_CYCLE.CREATE.action);
  const canUpdate = hasPermission(MODULES_PERMISSIONS.GRADE_CYCLE.UPDATE.module, MODULES_PERMISSIONS.GRADE_CYCLE.UPDATE.action);
  const canDelete = hasPermission(MODULES_PERMISSIONS.GRADE_CYCLE.DELETE.module, MODULES_PERMISSIONS.GRADE_CYCLE.DELETE.action);

  if (showWizard) {
    return (
      <ProtectedPage module="grade-cycle" action="read">
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
            canCreate={canCreate}
            canUpdate={canUpdate}
          />
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage module="grade-cycle" action="read">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gestión de Ciclos y Grados
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra qué grados están disponibles en cada ciclo escolar
          </p>
        </div>

        <GradeCycleList 
          onCreateNew={() => setShowWizard(true)}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      </div>
    </ProtectedPage>
  );
}
