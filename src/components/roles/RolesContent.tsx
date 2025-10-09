// src/components/roles/RolesContent.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Lock, AlertTriangle, ShieldX, KeyRound } from 'lucide-react';
import RolesList from './RolesList';
import RoleForm from './RoleForm';

export default function RolesContent() {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [editingRoleId, setEditingRoleId] = useState<number | undefined>();

  const handleEdit = (id: number) => {
    setEditingRoleId(id);
    setActiveTab('form');
  };

  const handleCreateNew = () => {
    setEditingRoleId(undefined);
    setActiveTab('form');
  };

  const handleFormSuccess = () => {
    setEditingRoleId(undefined);
    setActiveTab('list');
  };

  const handleCancelForm = () => {
    setEditingRoleId(undefined);
    setActiveTab('list');
  };

  // ✅ Verificar permisos
  const canRead = hasPermission('role', 'read');
  const canCreate = hasPermission('role', 'create');
  const canUpdate = hasPermission('role', 'update');

  // ✅ Si no tiene permiso de lectura, mostrar pantalla de acceso denegado
  if (!canRead) {
    return (
      <div className="min-h-[600px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-red-200 dark:border-red-800 p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Animación del candado con llave que se aleja */}
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 bg-red-500/20 dark:bg-red-400/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative bg-red-100 dark:bg-red-900/30 rounded-full p-6 shadow-lg">
                  <Lock className="w-16 h-16 text-red-600 dark:text-red-400 animate-shake" strokeWidth={2.5} />
                  <KeyRound className="absolute -right-2 -top-2 w-8 h-8 text-red-500 dark:text-red-400 animate-key-escape" strokeWidth={2} />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full animate-float-1"></div>
              <div className="absolute bottom-4 left-2 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-2"></div>
              <div className="absolute top-6 left-0 w-1 h-1 bg-red-500 rounded-full animate-float-3"></div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <ShieldX className="w-6 h-6 text-red-600 dark:text-red-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Acceso Denegado
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                No tienes permisos para ver esta sección
              </p>
            </div>

            <div className="w-full bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-left space-y-2 flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Permiso requerido:
                  </p>
                  <code className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/40 px-3 py-1 rounded-md text-xs font-mono text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                    <span className="font-semibold">role</span>
                    <span className="text-red-400">.</span>
                    <span className="font-semibold">read</span>
                  </code>
                  <div className="pt-2 border-t border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-600 dark:text-red-500">
                      Tu rol actual:{' '}
                      <span className="font-semibold bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded">
                        {user?.role?.name || 'Sin rol asignado'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Volver atrás
              </Button>
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Ir al Dashboard
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 w-full">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                💡 Si crees que deberías tener acceso, contacta al administrador
              </p>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: rotate(0deg); }
            10%, 30%, 50%, 70%, 90% { transform: rotate(-3deg); }
            20%, 40%, 60%, 80% { transform: rotate(3deg); }
          }
          @keyframes keyEscape {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
            50% { transform: translate(20px, -20px) rotate(45deg); opacity: 0.5; }
            100% { transform: translate(40px, -40px) rotate(90deg); opacity: 0; }
          }
          @keyframes float1 {
            0%, 100% { transform: translate(0, 0); opacity: 0; }
            50% { transform: translate(10px, -30px); opacity: 1; }
          }
          @keyframes float2 {
            0%, 100% { transform: translate(0, 0); opacity: 0; }
            50% { transform: translate(-15px, -25px); opacity: 1; }
          }
          @keyframes float3 {
            0%, 100% { transform: translate(0, 0); opacity: 0; }
            50% { transform: translate(12px, -20px); opacity: 1; }
          }
          .animate-shake { animation: shake 2s ease-in-out infinite; }
          .animate-key-escape { animation: keyEscape 2s ease-in-out infinite; }
          .animate-float-1 { animation: float1 3s ease-in-out infinite; }
          .animate-float-2 { animation: float2 3.5s ease-in-out infinite 0.5s; }
          .animate-float-3 { animation: float3 2.5s ease-in-out infinite 1s; }
        `}</style>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
        <TabsTrigger 
          value="list"
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
        >
          Lista de Roles
        </TabsTrigger>
        
        {/* ✅ Tab de formulario - solo si puede crear O editar */}
        {(canCreate || canUpdate) && (
          <TabsTrigger 
            value="form"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            {editingRoleId ? 'Editar Rol' : 'Crear Rol'}
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="list" className="space-y-6">
        <RolesList onEdit={handleEdit} onCreateNew={handleCreateNew} />
      </TabsContent>

      <TabsContent value="form" className="space-y-6">
        {/* ✅ Verificar permiso según el modo */}
        {((editingRoleId && canUpdate) || (!editingRoleId && canCreate)) ? (
          <RoleForm
            editingId={editingRoleId}
            onSuccess={handleFormSuccess}
            onCancel={handleCancelForm}
          />
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center">
            <p className="text-yellow-800 dark:text-yellow-300">
              No tienes permisos para {editingRoleId ? 'editar' : 'crear'} roles
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}