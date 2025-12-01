'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ParentDetails, UpdateParentDetailsDto } from '@/types/users.types';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mail,
  Phone,
  Briefcase,
  Building2,
  MapPin,
  Shield,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

// Validation schema
const updateParentDetailsSchema = z.object({
  dpiIssuedAt: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  workPhone: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  workplace: z.string().optional().nullable(),
  isSponsor: z.boolean().optional(),
  sponsorInfo: z.string().optional().nullable(),
});

type UpdateParentDetailsFormData = z.infer<typeof updateParentDetailsSchema>;

interface ParentDetailsFormProps {
  parentDetails?: ParentDetails | null;
  userId: number;
  isLoading?: boolean;
  onSubmit: (data: UpdateParentDetailsDto) => Promise<void>;
  onCancel?: () => void;
}

export function ParentDetailsForm({
  parentDetails,
  userId,
  isLoading,
  onSubmit,
  onCancel,
}: ParentDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateParentDetailsFormData>({
    resolver: zodResolver(updateParentDetailsSchema),
    defaultValues: {
      dpiIssuedAt: parentDetails?.dpiIssuedAt || undefined,
      email: parentDetails?.email || undefined,
      workPhone: parentDetails?.workPhone || undefined,
      occupation: parentDetails?.occupation || undefined,
      workplace: parentDetails?.workplace || undefined,
      isSponsor: parentDetails?.isSponsor,
      sponsorInfo: parentDetails?.sponsorInfo || undefined,
    },
  });

  const handleFormSubmit = async (data: UpdateParentDetailsFormData) => {
    setIsSubmitting(true);
    try {
      // Remove empty strings and null values
      const cleanData: UpdateParentDetailsDto = {
        ...(data.dpiIssuedAt && { dpiIssuedAt: data.dpiIssuedAt }),
        ...(data.email && { email: data.email }),
        ...(data.workPhone && { workPhone: data.workPhone }),
        ...(data.occupation && { occupation: data.occupation }),
        ...(data.workplace && { workplace: data.workplace }),
        isSponsor: data.isSponsor,
        ...(data.sponsorInfo && { sponsorInfo: data.sponsorInfo }),
      };

      await onSubmit(cleanData);
      toast.success('Detalles del padre actualizados correctamente');
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Header */}
        <Card className="border border-blue-200/30 dark:border-blue-800/30 bg-gradient-to-br from-blue-50/50 to-blue-50/30 dark:from-blue-950/20 dark:to-blue-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Shield className="w-5 h-5" />
              Detalles del Padre/Tutor
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Información adicional del padre o tutor del estudiante
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Contact Information */}
        <Card className="border border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              Información de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* DPI Issued At */}
              <FormField
                control={form.control}
                name="dpiIssuedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-slate-300 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      Lugar de Emisión del DPI
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Guatemala"
                        {...field}
                        value={field.value || ''}
                        disabled={isLoading || isSubmitting}
                        className="dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-white dark:placeholder-slate-400 transition-all duration-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-slate-300 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      Email Alternativo
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="padre@ejemplo.com"
                        type="email"
                        {...field}
                        value={field.value || ''}
                        disabled={isLoading || isSubmitting}
                        className="dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-white dark:placeholder-slate-400 transition-all duration-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Work Phone */}
              <FormField
                control={form.control}
                name="workPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-slate-300 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-500" />
                      Teléfono de Trabajo
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="87654321"
                        {...field}
                        value={field.value || ''}
                        disabled={isLoading || isSubmitting}
                        className="dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-white dark:placeholder-slate-400 transition-all duration-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="border border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-500" />
              Información Profesional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Occupation */}
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-slate-300 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-500" />
                      Ocupación
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingeniero"
                        {...field}
                        value={field.value || ''}
                        disabled={isLoading || isSubmitting}
                        className="dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-white dark:placeholder-slate-400 transition-all duration-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Workplace */}
              <FormField
                control={form.control}
                name="workplace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-slate-300 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-500" />
                      Lugar de Trabajo
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Empresa ABC"
                        {...field}
                        value={field.value || ''}
                        disabled={isLoading || isSubmitting}
                        className="dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-white dark:placeholder-slate-400 transition-all duration-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sponsor Information */}
        <Card className="border border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              Información del Encargado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Is Sponsor */}
            <FormField
              control={form.control}
              name="isSponsor"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 border border-red-200/30 dark:border-red-800/30 rounded-lg bg-gradient-to-br from-red-50/50 to-red-50/30 dark:from-red-950/20 dark:to-red-950/10">
                  <div className="space-y-0.5">
                    <FormLabel className="dark:text-slate-300 font-semibold">
                      ¿Es encargado del estudiante?
                    </FormLabel>
                    <FormDescription className="dark:text-slate-400">
                      {field.value ? 'Sí, es el encargado' : 'No es el encargado'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isLoading || isSubmitting}
                      className="w-6 h-6 rounded dark:bg-slate-800 dark:border-slate-600 cursor-pointer transition-all duration-300"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Sponsor Info */}
            <FormField
              control={form.control}
              name="sponsorInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-slate-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    Información Adicional del Encargado
                  </FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Información adicional sobre la relación con el estudiante..."
                      {...field}
                      value={field.value || ''}
                      disabled={isLoading || isSubmitting}
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-white dark:placeholder-slate-400 transition-all duration-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert className="border border-blue-200/50 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20">
          <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="dark:text-slate-300 text-slate-700">
            <strong>Nota:</strong> Los detalles del padre se crean automáticamente cuando un usuario se asigna el rol de PARENT.
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-slate-200/30 dark:border-slate-700/30">
          <Button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white font-bold transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading || isSubmitting}
              className="flex-1 h-11 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300/80 dark:hover:border-slate-600/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 font-bold transition-all duration-300 rounded-lg"
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
