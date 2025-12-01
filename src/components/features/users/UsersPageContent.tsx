// src/components/features/users/UsersPageContent.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUsers } from '@/hooks/data/useUsers';
import { useRoles } from '@/hooks/data/useRoles';
import { User, UserWithRelations } from '@/types/users.types';
import { CreateUserFormData, UpdateUserFormData } from '@/schemas/users.schema';
import { UserStats } from './UserStats';
import { UserFilters } from './UserFilters';
import { UsersGrid } from './UsersGrid';
import { UserTable } from './UserTable';
import { UserForm } from './UserForm';
import { DeleteUserDialog } from './DeleteUserDialog';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { UserDetailDialog } from './UserDetailDialog';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { ProtectedButton } from '@/components/shared/permissions/ProtectedButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  RefreshCw,
  List,
  Grid3x3,
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface ViewMode {
  type: 'grid' | 'table';
}

export function UsersPageContent() {
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [viewMode, setViewMode] = useState<ViewMode['type']>('grid');
  const [editingUserId, setEditingUserId] = useState<number | undefined>(undefined);

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDetailUser, setSelectedDetailUser] = useState<User | UserWithRelations | null>(null);

  const {
    data,
    stats,
    isLoading,
    error,
    permissionError,
    query,
    updateQuery,
    refresh,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    changePassword,
    uploadPicture,
  } = useUsers({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Get roles for filtering
  const { data: rolesData } = useRoles({ limit: 100 });
  const roles = rolesData?.data || [];

  // Fetch editing user data
  const fetchEditingUser = async (userId: number) => {
    try {
      return await getUserById(userId);
    } catch (error) {
      return null;
    }
  };

  const handleReset = () => {
    updateQuery({
      page: 1,
      limit: 12,
      search: undefined,
      isActive: undefined,
      canAccessPlatform: undefined,
      roleId: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const handlePageChange = (page: number) => {
    updateQuery({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateNew = () => {
    setEditingUserId(undefined);
    setActiveTab('form');
  };

  const handleEdit = (user: User) => {
    setEditingUserId(user.id);
    setActiveTab('form');
  };

  const handleFormSuccess = () => {
    refresh();
    setActiveTab('list');
    setEditingUserId(undefined);
  };

  const handleFormCancel = () => {
    setActiveTab('list');
    setEditingUserId(undefined);
  };

  const handleFormSubmit = async (
    formData: CreateUserFormData | UpdateUserFormData,
    file?: File
  ) => {
    try {
      // Helper function to convert Date objects to ISO strings
      const convertDatesToISO = (data: any) => {
        const converted = { ...data };
        if (converted.teacherDetails?.hiredDate instanceof Date) {
          converted.teacherDetails = {
            ...converted.teacherDetails,
            hiredDate: converted.teacherDetails.hiredDate.toISOString(),
          };
        }
        if (converted.parentDetails?.dpiIssuedAt instanceof Date) {
          converted.parentDetails = {
            ...converted.parentDetails,
            dpiIssuedAt: converted.parentDetails.dpiIssuedAt.toISOString(),
          };
        }
        return converted;
      };

      // Helper function to filter details based on role
      const filterDetailsByRole = (data: any, roleId: string) => {
        const filtered = { ...data };
        
        if (!roleId || !roles || roles.length === 0) {
          // If no roles available, return data as is
          return filtered;
        }
        
        // Find the role name to determine type
        const roleObj = roles.find((r) => r.id.toString() === roleId);
        const roleName = roleObj?.name?.toLowerCase() || '';
        
        // More precise role detection - match exact role names or clear keywords
        const isParentRole = 
          roleName === 'padre' || 
          roleName === 'madre' || 
          roleName === 'tutor' ||
          roleName === 'parent' || 
          roleName === 'apoderado' ||
          (roleName.includes('padre') && !roleName.includes('padrenot'));
        
        const isTeacherRole = 
          roleName === 'maestro' || 
          roleName === 'profesor' || 
          roleName === 'docente' ||
          roleName === 'teacher' ||
          roleName === 'instructor' ||
          (roleName.includes('maestro') || roleName.includes('profesor') || roleName.includes('docente'));
        
        // Remove teacher details if not a teacher
        if (!isTeacherRole) {
          delete filtered.teacherDetails;
        }
        
        // Remove parent details if not a parent
        if (!isParentRole) {
          delete filtered.parentDetails;
        }
        
        return filtered;
      };

      const processedData = convertDatesToISO(formData);
      const roleId = processedData.roleId || '';
      const filteredData = filterDetailsByRole(processedData, roleId);

      if (editingUserId) {
        // Update mode
        await updateUser(editingUserId, filteredData);
        // Upload picture if provided
        if (file) {
          try {
            await uploadPicture(editingUserId, file, 'profile');
          } catch (error) {
            // Continuar aunque falle la foto
          }
        }
      } else {
        // Create mode
        const createData = filteredData as CreateUserFormData;
        await createUser(createData);
        
        // Get the latest user (should be the one just created)
        const latestUsers = await refresh();
        
        // Upload picture if provided - use the first user from the latest list
        if (file && data?.data && data.data.length > 0) {
          try {
            const newUser = data.data[0];
            await uploadPicture(newUser.id, file, 'profile');
          } catch (error) {
            // Nota: En este caso no eliminamos el usuario si falla la foto
            // ya que refresh() es async y el usuario ya existe
          }
        }
      }
      handleFormSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido al procesar el formulario';
      console.error('Form submission error:', error);
      toast.error(`Error: ${message}`);
    }
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.id);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setPasswordDialogOpen(true);
  };

  const handleConfirmChangePassword = async (data: any) => {
    if (selectedUser) {
      await changePassword(selectedUser.id, data);
      setPasswordDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleViewDetails = async (user: User) => {
    try {
      const detailUser = await getUserById(user.id);
      setSelectedDetailUser(detailUser);
    } catch (error) {
      setSelectedDetailUser(user);
    }
    setDetailDialogOpen(true);
  };

  const hasActiveFilters = !!(
    query.search ||
    query.isActive !== undefined ||
    query.canAccessPlatform !== undefined ||
    query.roleId !== undefined
  );

  const users = data?.data || [];
  const totalUsers = data?.meta.total || 0;
  const totalPages = data?.meta.totalPages || 1;
  const currentPage = data?.meta.page || 1;

  return (
    <ProtectedPage module="user" action="read">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Usuarios</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Gestiona los usuarios del sistema
            </p>
          </div>
          <ProtectedButton
            module="user"
            action="create"
            onClick={handleCreateNew}
            disabled={isLoading}
            className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Usuario
          </ProtectedButton>
        </div>

        {/* Stats */}
        <UserStats stats={stats} isLoading={isLoading} permissionError={permissionError} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'list' | 'form')}>
          <TabsList className="grid w-full grid-cols-2 max-w-md dark:bg-slate-800 dark:border-slate-700">
            <TabsTrigger value="list" className="dark:data-[state=active]:bg-slate-700">
              <List className="w-4 h-4 mr-2" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="form" className="dark:data-[state=active]:bg-slate-700">
              <Plus className="w-4 h-4 mr-2" />
              {editingUserId ? 'Editar' : 'Nuevo'}
            </TabsTrigger>
          </TabsList>

          {/* List Tab */}
          <TabsContent value="list" className="space-y-6">
            {error && (
              <Alert variant="destructive" className="dark:bg-red-950/20 dark:border-red-900/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="dark:text-red-400">
                  {error.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Filters */}
            <Card className="dark:bg-slate-900 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm dark:text-white">Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <UserFilters
                  query={query}
                  onQueryChange={updateQuery}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            {/* View Toggle */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  disabled={isLoading}
                  className={
                    viewMode === 'grid'
                      ? 'dark:bg-blue-600 dark:text-white'
                      : 'dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
                  }
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  disabled={isLoading}
                  className={
                    viewMode === 'table'
                      ? 'dark:bg-blue-600 dark:text-white'
                      : 'dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
                  }
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
                className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Content */}
            {isLoading && users.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : viewMode === 'grid' ? (
              <UsersGrid
                users={users}
                onEdit={handleEdit}
                onDelete={handleDeleteUser}
                onViewDetails={handleViewDetails}
                isLoading={isLoading}
              />
            ) : (
              <UserTable
                users={users}
                onEdit={handleEdit}
                onDelete={handleDeleteUser}
                onViewDetails={handleViewDetails}
                onChangePassword={handleChangePassword}
                isLoading={isLoading}
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Anterior
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Form Tab */}
          <TabsContent value="form">
            <Card className="dark:bg-slate-900 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  {editingUserId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingUserId ? (
                  <EditingUserFormWrapper
                    userId={editingUserId}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    isLoading={isLoading}
                    getUserById={fetchEditingUser}
                  />
                ) : (
                  <UserForm
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    isLoading={isLoading}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <DeleteUserDialog
          user={selectedUser}
          isOpen={deleteDialogOpen}
          isLoading={isLoading}
          onConfirm={handleConfirmDelete}
          onOpenChange={setDeleteDialogOpen}
        />

        <ChangePasswordDialog
          user={selectedUser}
          isOpen={passwordDialogOpen}
          isLoading={isLoading}
          onSubmit={handleConfirmChangePassword}
          onOpenChange={setPasswordDialogOpen}
        />

        <UserDetailDialog
          user={selectedDetailUser}
          isOpen={detailDialogOpen}
          isLoading={isLoading}
          onOpenChange={setDetailDialogOpen}
        />
      </div>
    </ProtectedPage>
  );
}

// Helper component for editing user
function EditingUserFormWrapper({
  userId,
  onSubmit,
  onCancel,
  isLoading,
  getUserById,
}: {
  userId: number;
  onSubmit: (data: CreateUserFormData | UpdateUserFormData, file?: File) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  getUserById: (id: number) => Promise<any>;
}) {
  const [user, setUser] = useState<User | UserWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById(userId);
        setUser(userData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, getUserById]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <UserForm
      user={user || undefined}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
}

// Add React import for the hook
import React from 'react';
