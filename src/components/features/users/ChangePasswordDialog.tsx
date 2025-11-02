// src/components/features/users/ChangePasswordDialog.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, ChangePasswordFormData } from '@/schemas/users.schema';
import { User } from '@/types/users.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface ChangePasswordDialogProps {
  user: User | null;
  isOpen: boolean;
  isLoading?: boolean;
  onSubmit: (data: ChangePasswordFormData) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({
  user,
  isOpen,
  isLoading,
  onSubmit,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="dark:bg-slate-900 dark:border-slate-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Cambiar Contraseña</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            Actualizar la contraseña de {user?.givenNames} {user?.lastNames}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Current Password */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-slate-300">Contraseña Actual *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPasswords.current ? 'text' : 'password'}
                        {...field}
                        disabled={isLoading || isSubmitting}
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-slate-300">Nueva Contraseña *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPasswords.new ? 'text' : 'password'}
                        {...field}
                        disabled={isLoading || isSubmitting}
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormDescription className="dark:text-slate-400 text-xs">
                    Mín. 8 caracteres, mayúscula, número, especial
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-slate-300">Confirmar *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        {...field}
                        disabled={isLoading || isSubmitting}
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="flex-1 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Cambiar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading || isSubmitting}
                className="flex-1 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
