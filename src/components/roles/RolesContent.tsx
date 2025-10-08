// src/components/roles/RolesContent.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RolesList from './RolesList';
import RoleForm from './RoleForm';

export default function RolesContent() {
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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
        <TabsTrigger 
          value="list"
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
        >
          Lista de Roles
        </TabsTrigger>
        <TabsTrigger 
          value="form"
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
        >
          {editingRoleId ? 'Editar Rol' : 'Crear Rol'}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="space-y-6">
        <RolesList onEdit={handleEdit} onCreateNew={handleCreateNew} />
      </TabsContent>

      <TabsContent value="form" className="space-y-6">
        <RoleForm
          editingId={editingRoleId}
          onSuccess={handleFormSuccess}
          onCancel={handleCancelForm}
        />
      </TabsContent>
    </Tabs>
  );
}