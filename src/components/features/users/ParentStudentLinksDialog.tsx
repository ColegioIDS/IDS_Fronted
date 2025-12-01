'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ParentStudentLink, CreateParentStudentLinkDto, UpdateParentStudentLinkDto } from '@/types/users.types';
import { useParentStudentLinks } from '@/hooks/data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Link as LinkIcon,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Heart,
  Shield,
  Home,
  DollarSign,
  AlertTriangle,
  Bell,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

// Validation schema
const createParentStudentLinkSchema = z.object({
  relationshipType: z.string().min(2, 'Tipo de relación requerido'),
  isPrimaryContact: z.boolean().optional(),
  hasLegalCustody: z.boolean().optional(),
  canAccessInfo: z.boolean().optional(),
  livesWithStudent: z.boolean().optional(),
  financialResponsible: z.boolean().optional(),
  emergencyContactPriority: z.number().int().min(1).optional(),
  receivesSchoolNotices: z.boolean().optional(),
});

const updateParentStudentLinkSchema = createParentStudentLinkSchema.omit({});

type CreateParentStudentLinkFormData = z.infer<typeof createParentStudentLinkSchema>;
type UpdateParentStudentLinkFormData = z.infer<typeof updateParentStudentLinkSchema>;

interface ParentStudentLinksDialogProps {
  parentId: number;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function ParentStudentLinksDialog({
  parentId,
  onSuccess,
  trigger,
}: ParentStudentLinksDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<ParentStudentLink | null>(null);
  
  const {
    links,
    isLoading,
    createLink,
    updateLink,
    deleteLink,
    fetchParentChildren,
  } = useParentStudentLinks(parentId);

  useEffect(() => {
    if (isOpen && parentId) {
      fetchParentChildren(parentId);
    }
  }, [isOpen, parentId, fetchParentChildren]);

  const form = useForm<CreateParentStudentLinkFormData>({
    resolver: zodResolver(createParentStudentLinkSchema),
    defaultValues: {
      relationshipType: '',
      isPrimaryContact: undefined,
      hasLegalCustody: undefined,
      canAccessInfo: undefined,
      livesWithStudent: undefined,
      financialResponsible: undefined,
      emergencyContactPriority: 1,
      receivesSchoolNotices: undefined,
    },
  });

  const handleCreateSubmit = async (data: CreateParentStudentLinkFormData) => {
    try {
      // For now, we'll need to get studentId from somewhere
      // This might need to be enhanced with a student selector
      await createLink({
        parentId,
        studentId: 0, // TODO: Add student selector
        ...data,
      } as CreateParentStudentLinkDto);
      form.reset();
      setEditingLinkId(null);
      onSuccess?.();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteClick = (link: ParentStudentLink) => {
    setLinkToDelete(link);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!linkToDelete) return;
    
    try {
      await deleteLink(linkToDelete.id);
      setDeleteConfirmOpen(false);
      setLinkToDelete(null);
      onSuccess?.();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const relationshipTypes = [
    'Padre',
    'Madre',
    'Tutor',
    'Abuelo',
    'Abuela',
    'Hermano',
    'Hermana',
    'Tío',
    'Tía',
    'Otro',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-blue-200/50 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
          >
            <LinkIcon className="w-4 h-4" />
            Ver Vínculos
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5 text-blue-500" />
            Vínculos Padre-Estudiante
          </DialogTitle>
          <DialogDescription>
            Gestiona las relaciones entre este padre y sus estudiantes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Link Form */}
          <Card className="border border-emerald-200/30 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50/50 to-emerald-50/30 dark:from-emerald-950/20 dark:to-emerald-950/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" />
                Crear Nuevo Vínculo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Relationship Type */}
                    <FormField
                      control={form.control}
                      name="relationshipType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-slate-300 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            Tipo de Relación
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isLoading || form.formState.isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger className="dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-white">
                                <SelectValue placeholder="Seleccionar relación..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="dark:bg-slate-900 dark:border-slate-700/50">
                              {relationshipTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Emergency Contact Priority */}
                    <FormField
                      control={form.control}
                      name="emergencyContactPriority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-slate-300 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            Prioridad de Emergencia
                          </FormLabel>
                          <Select
                            onValueChange={(v) => field.onChange(parseInt(v))}
                            value={field.value?.toString() || '1'}
                            disabled={isLoading || form.formState.isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger className="dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-white">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="dark:bg-slate-900 dark:border-slate-700/50">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <SelectItem key={n} value={n.toString()}>
                                  {n === 1 ? `Prioridad ${n} (Más importante)` : `Prioridad ${n}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Checkboxes Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="isPrimaryContact"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 p-3 border border-blue-200/30 dark:border-blue-800/30 rounded-lg bg-blue-50/30 dark:bg-blue-950/10">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              disabled={isLoading || form.formState.isSubmitting}
                              className="w-5 h-5 rounded dark:bg-slate-800 dark:border-slate-600"
                            />
                          </FormControl>
                          <FormLabel className="dark:text-slate-300 mb-0 cursor-pointer flex-1">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-blue-500" />
                              Contacto Principal
                            </div>
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hasLegalCustody"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 p-3 border border-purple-200/30 dark:border-purple-800/30 rounded-lg bg-purple-50/30 dark:bg-purple-950/10">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              disabled={isLoading || form.formState.isSubmitting}
                              className="w-5 h-5 rounded dark:bg-slate-800 dark:border-slate-600"
                            />
                          </FormControl>
                          <FormLabel className="dark:text-slate-300 mb-0 cursor-pointer flex-1">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-purple-500" />
                              Custodia Legal
                            </div>
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="canAccessInfo"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 p-3 border border-indigo-200/30 dark:border-indigo-800/30 rounded-lg bg-indigo-50/30 dark:bg-indigo-950/10">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              disabled={isLoading || form.formState.isSubmitting}
                              className="w-5 h-5 rounded dark:bg-slate-800 dark:border-slate-600"
                            />
                          </FormControl>
                          <FormLabel className="dark:text-slate-300 mb-0 cursor-pointer flex-1">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-indigo-500" />
                              Acceso a Información
                            </div>
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="livesWithStudent"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 p-3 border border-emerald-200/30 dark:border-emerald-800/30 rounded-lg bg-emerald-50/30 dark:bg-emerald-950/10">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              disabled={isLoading || form.formState.isSubmitting}
                              className="w-5 h-5 rounded dark:bg-slate-800 dark:border-slate-600"
                            />
                          </FormControl>
                          <FormLabel className="dark:text-slate-300 mb-0 cursor-pointer flex-1">
                            <div className="flex items-center gap-2">
                              <Home className="w-4 h-4 text-emerald-500" />
                              Vive con Estudiante
                            </div>
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="financialResponsible"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 p-3 border border-amber-200/30 dark:border-amber-800/30 rounded-lg bg-amber-50/30 dark:bg-amber-950/10">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              disabled={isLoading || form.formState.isSubmitting}
                              className="w-5 h-5 rounded dark:bg-slate-800 dark:border-slate-600"
                            />
                          </FormControl>
                          <FormLabel className="dark:text-slate-300 mb-0 cursor-pointer flex-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-amber-500" />
                              Responsable Financiero
                            </div>
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="receivesSchoolNotices"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 p-3 border border-sky-200/30 dark:border-sky-800/30 rounded-lg bg-sky-50/30 dark:bg-sky-950/10">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              disabled={isLoading || form.formState.isSubmitting}
                              className="w-5 h-5 rounded dark:bg-slate-800 dark:border-slate-600"
                            />
                          </FormControl>
                          <FormLabel className="dark:text-slate-300 mb-0 cursor-pointer flex-1">
                            <div className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-sky-500" />
                              Notificaciones Escolares
                            </div>
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || form.formState.isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 text-white font-bold transition-all duration-300"
                  >
                    {form.formState.isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Vínculo
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Existing Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-500" />
              Vínculos Actuales ({links.length})
            </h3>

            {links.length === 0 ? (
              <Alert className="border border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
                <AlertCircle className="h-4 w-4 text-slate-400" />
                <AlertDescription className="dark:text-slate-400">
                  No hay vínculos creados aún. Crea uno nuevo usando el formulario anterior.
                </AlertDescription>
              </Alert>
            ) : (
              links.map((link) => (
                <Card key={link.id} className="border border-slate-200/50 dark:border-slate-700/50">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-700/50">
                              {link.relationshipType}
                            </Badge>
                            {link.isPrimaryContact && (
                              <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-700/50">
                                Contacto Principal
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm dark:text-slate-400">
                            <span className="font-semibold dark:text-slate-300">Estudiante:</span> {link.student?.givenNames} {link.student?.lastNames}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingLinkId(link.id)}
                            className="gap-2 border-blue-200/50 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(link)}
                            className="gap-2 border-red-200/50 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Attributes Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {link.hasLegalCustody && (
                          <Badge variant="secondary" className="justify-center gap-1">
                            <Shield className="w-3 h-3" />
                            Custodia
                          </Badge>
                        )}
                        {link.canAccessInfo && (
                          <Badge variant="secondary" className="justify-center gap-1">
                            <Eye className="w-3 h-3" />
                            Acceso
                          </Badge>
                        )}
                        {link.livesWithStudent && (
                          <Badge variant="secondary" className="justify-center gap-1">
                            <Home className="w-3 h-3" />
                            Convive
                          </Badge>
                        )}
                        {link.financialResponsible && (
                          <Badge variant="secondary" className="justify-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Finanzas
                          </Badge>
                        )}
                        {link.receivesSchoolNotices && (
                          <Badge variant="secondary" className="justify-center gap-1">
                            <Bell className="w-3 h-3" />
                            Avisos
                          </Badge>
                        )}
                      </div>

                      {link.emergencyContactPriority && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Prioridad de emergencia: <span className="font-semibold">{link.emergencyContactPriority}</span>
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Eliminar Vínculo
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el vínculo entre este padre y el estudiante {linkToDelete?.student?.givenNames}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <AlertDialogCancel disabled={form.formState.isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={form.formState.isSubmitting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {form.formState.isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
