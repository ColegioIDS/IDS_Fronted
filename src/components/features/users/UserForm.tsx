// src/components/features/users/UserForm.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, updateUserSchema, CreateUserFormData, UpdateUserFormData } from '@/schemas/users.schema';
import { User, UserWithRelations } from '@/types/users.types';
import { useRoles } from '@/hooks/data/useRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Upload,
  X,
  User as UserIcon,
  FileText,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Shield,
  Lock,
  Users,
  IdCard,
  CheckCircle2,
  Camera,
  Check,
  Circle,
  GraduationCap,
  Calendar,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserFormProps {
  user?: User | UserWithRelations;
  isLoading?: boolean;
  onSubmit: (data: CreateUserFormData | UpdateUserFormData, file?: File) => Promise<void>;
  onCancel?: () => void;
}

export function UserForm({
  user,
  isLoading,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const isEditMode = !!user;
  const { data: rolesData } = useRoles({ limit: 100 });
  const roles = rolesData?.data || [];

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const schema = isEditMode ? updateUserSchema : createUserSchema;
  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: isEditMode
      ? {
          givenNames: user?.givenNames || '',
          lastNames: user?.lastNames || '',
          phone: user?.phone || '',
          gender: user?.gender || 'M',
          roleId: user && 'role' in user ? user.role?.id.toString() : user?.roleId?.toString() || '',
          isActive: user?.isActive ?? true,
          canAccessPlatform: user?.canAccessPlatform ?? false,
          // Include parent/teacher details if available
          parentDetails: user && 'parentDetails' in user ? {
            dpiIssuedAt: user.parentDetails?.dpiIssuedAt || '',
            email: user.parentDetails?.email || '',
            workPhone: user.parentDetails?.workPhone || '',
            occupation: user.parentDetails?.occupation || '',
            workplace: user.parentDetails?.workplace || '',
            isSponsor: user.parentDetails?.isSponsor ?? false,
            sponsorInfo: user.parentDetails?.sponsorInfo || '',
          } : {
            dpiIssuedAt: '',
            email: '',
            workPhone: '',
            occupation: '',
            workplace: '',
            isSponsor: false,
            sponsorInfo: '',
          },
          teacherDetails: user && 'teacherDetails' in user ? {
            hiredDate: user.teacherDetails?.hiredDate ? new Date(user.teacherDetails.hiredDate) : undefined,
            academicDegree: user.teacherDetails?.academicDegree || '',
            isHomeroomTeacher: user.teacherDetails?.isHomeroomTeacher ?? false,
          } : {
            hiredDate: undefined,
            academicDegree: '',
            isHomeroomTeacher: false,
          },
        }
      : {
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          givenNames: '',
          lastNames: '',
          dpi: '',
          phone: '',
          gender: 'M',
          roleId: '',
          isActive: true,
          canAccessPlatform: false,
          parentDetails: {
            dpiIssuedAt: '',
            email: '',
            workPhone: '',
            occupation: '',
            workplace: '',
            isSponsor: false,
            sponsorInfo: '',
          },
          teacherDetails: {
            hiredDate: '',
            academicDegree: '',
            isHomeroomTeacher: false,
          },
        },
    mode: 'onChange',
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes (JPG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > maxSize) {
      toast.error('La imagen no debe exceder 5MB');
      return;
    }

    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data, uploadedFile || undefined);
    } catch (error) {
      // Error is already handled in toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInitials = () => {
    const given = form.watch('givenNames')?.split(' ')[0]?.[0] || '';
    const last = form.watch('lastNames')?.split(' ')[0]?.[0] || '';
    return `${given}${last}`.toUpperCase();
  };

  const getExistingProfilePicture = () => {
    if (user && 'pictures' in user) {
      return user.pictures?.find((p) => p.kind === 'profile')?.url;
    }
    return undefined;
  };

  // Reset form when user data changes
  useEffect(() => {
    if (isEditMode && user) {
      form.reset({
        givenNames: user?.givenNames || '',
        lastNames: user?.lastNames || '',
        phone: user?.phone || '',
        gender: user?.gender || 'M',
        roleId: user && 'role' in user ? user.role?.id.toString() : user?.roleId?.toString() || '',
        isActive: user?.isActive ?? true,
        canAccessPlatform: user?.canAccessPlatform ?? false,
        parentDetails: user && 'parentDetails' in user ? {
          dpiIssuedAt: user.parentDetails?.dpiIssuedAt || '',
          email: user.parentDetails?.email || '',
          workPhone: user.parentDetails?.workPhone || '',
          occupation: user.parentDetails?.occupation || '',
          workplace: user.parentDetails?.workplace || '',
          isSponsor: user.parentDetails?.isSponsor ?? false,
          sponsorInfo: user.parentDetails?.sponsorInfo || '',
        } : {
          dpiIssuedAt: '',
          email: '',
          workPhone: '',
          occupation: '',
          workplace: '',
          isSponsor: false,
          sponsorInfo: '',
        },
        teacherDetails: user && 'teacherDetails' in user ? {
          hiredDate: user.teacherDetails?.hiredDate ? new Date(user.teacherDetails.hiredDate) : undefined,
          academicDegree: user.teacherDetails?.academicDegree || '',
          isHomeroomTeacher: user.teacherDetails?.isHomeroomTeacher ?? false,
        } : {
          hiredDate: undefined,
          academicDegree: '',
          isHomeroomTeacher: false,
        },
      });
    }
  }, [user, isEditMode, form]);

  const currentPictureUrl = preview || getExistingProfilePicture();

  // Get the selected role to show parent/teacher fields
  const selectedRoleId = form.watch('roleId');
  const selectedRole = roles.find((r) => r.id.toString() === selectedRoleId);
  const roleName = selectedRole?.name?.toLowerCase() || '';
  
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="
            grid w-full grid-cols-2 gap-1
            bg-slate-100/50 dark:bg-slate-800/50
            border border-slate-200/30 dark:border-slate-700/30
            rounded-lg p-1
          ">
            <TabsTrigger
              value="info"
              className="
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20
                data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400
                data-[state=active]:border data-[state=active]:border-blue-200/50 dark:data-[state=active]:border-blue-700/50
                transition-all duration-300
                rounded-md
              "
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Información
            </TabsTrigger>
            <TabsTrigger
              value="photo"
              className="
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20
                data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400
                data-[state=active]:border data-[state=active]:border-blue-200/50 dark:data-[state=active]:border-blue-700/50
                transition-all duration-300
                rounded-md
              "
            >
              <Camera className="w-4 h-4 mr-2" />
              Foto
            </TabsTrigger>
          </TabsList>

          {/* Información Tab */}
          <TabsContent value="info" className="space-y-6 mt-6">
            {/* Email y Username (Solo crear) */}
            {!isEditMode && (
              <>
                <div className="
                  p-4 rounded-lg
                  bg-gradient-to-br from-blue-50/50 to-blue-50/30
                  dark:from-blue-950/20 dark:to-blue-950/10
                  border border-blue-200/30 dark:border-blue-800/30
                ">
                  <h3 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Credenciales de Acceso
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-slate-300 flex items-center gap-2 mb-2">
                            <Mail className="w-4 h-4 text-blue-500" />
                            Email *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="usuario@colegioids.com"
                              type="email"
                              {...field}
                              disabled={isLoading || isSubmitting}
                              className="
                                dark:bg-slate-900/80 dark:border-slate-700/60
                                dark:text-white dark:placeholder-slate-400
                                focus:ring-blue-500/20 dark:focus:ring-blue-500/20
                                transition-all duration-300
                              "
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-slate-300 flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-purple-500" />
                            Usuario *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="usuario_prueba"
                              {...field}
                              disabled={isLoading || isSubmitting}
                              className="
                                dark:bg-slate-900/80 dark:border-slate-700/60
                                dark:text-white dark:placeholder-slate-400
                                focus:ring-blue-500/20 dark:focus:ring-blue-500/20
                                transition-all duration-300
                              "
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* DPI */}
                <FormField
                  control={form.control}
                  name="dpi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-slate-300 flex items-center gap-2 mb-2">
                        <IdCard className="w-4 h-4 text-amber-500" />
                        DPI (Documento Personal de Identidad) *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1234567890123"
                          maxLength={13}
                          {...field}
                          disabled={isLoading || isSubmitting}
                          className="
                            dark:bg-slate-900/80 dark:border-slate-700/60
                            dark:text-white dark:placeholder-slate-400
                            focus:ring-blue-500/20 dark:focus:ring-blue-500/20
                            transition-all duration-300
                          "
                        />
                      </FormControl>
                      <FormDescription className="dark:text-slate-400">
                        13 dígitos
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contraseña */}
                <div className="
                  p-4 rounded-lg
                  bg-gradient-to-br from-red-50/50 to-red-50/30
                  dark:from-red-950/20 dark:to-red-950/10
                  border border-red-200/30 dark:border-red-800/30
                ">
                  <h3 className="text-sm font-bold text-red-700 dark:text-red-300 mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Contraseña Segura
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-slate-300 flex items-center gap-2 mb-2">
                            <Lock className="w-4 h-4 text-red-500" />
                            Contraseña *
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="••••••••"
                                type={showPassword ? 'text' : 'password'}
                                {...field}
                                disabled={isLoading || isSubmitting}
                                className="
                                  dark:bg-slate-900/80 dark:border-slate-700/60
                                  dark:text-white dark:placeholder-slate-400
                                  focus:ring-blue-500/20 dark:focus:ring-blue-500/20
                                  transition-all duration-300 pr-10
                                "
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="
                                  absolute right-3 top-1/2 -translate-y-1/2
                                  text-slate-500 dark:text-slate-400
                                  hover:text-slate-700 dark:hover:text-slate-200
                                  transition-colors
                                "
                              >
                                {showPassword ? (
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
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-slate-300 flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Confirmar *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="••••••••"
                              type="password"
                              {...field}
                              disabled={isLoading || isSubmitting}
                              className="
                                dark:bg-slate-900/80 dark:border-slate-700/60
                                dark:text-white dark:placeholder-slate-400
                                focus:ring-blue-500/20 dark:focus:ring-blue-500/20
                                transition-all duration-300
                              "
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Nombres y Apellidos */}
            <div className="
              p-4 rounded-lg
              bg-gradient-to-br from-slate-50/50 to-slate-50/30
              dark:from-slate-900/30 dark:to-slate-900/10
              border border-slate-200/30 dark:border-slate-700/30
            ">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="givenNames"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-slate-300 flex items-center gap-2 mb-2">
                        <UserIcon className="w-4 h-4 text-blue-500" />
                        Nombres *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Juan Carlos"
                          {...field}
                          disabled={isLoading || isSubmitting}
                          className="
                            dark:bg-slate-900/80 dark:border-slate-700/60
                            dark:text-white dark:placeholder-slate-400
                            focus:ring-blue-500/20 dark:focus:ring-blue-500/20
                            transition-all duration-300
                          "
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastNames"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-slate-300 flex items-center gap-2 mb-2">
                        <UserIcon className="w-4 h-4 text-purple-500" />
                        Apellidos *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Pérez García"
                          {...field}
                          disabled={isLoading || isSubmitting}
                          className="
                            dark:bg-slate-900/80 dark:border-slate-700/60
                            dark:text-white dark:placeholder-slate-400
                            focus:ring-blue-500/20 dark:focus:ring-blue-500/20
                            transition-all duration-300
                          "
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Teléfono, Género, Rol */}
            <div className="
              p-4 rounded-lg
              bg-gradient-to-br from-slate-50/50 to-slate-50/30
              dark:from-slate-900/30 dark:to-slate-900/10
              border border-slate-200/30 dark:border-slate-700/30
              space-y-4
            ">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Configuración Adicional
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-slate-300 flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4 text-emerald-500" />
                        Teléfono
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+50212345678"
                          {...field}
                          disabled={isLoading || isSubmitting}
                          className="
                            dark:bg-slate-900/80 dark:border-slate-700/60
                            dark:text-white dark:placeholder-slate-400
                            focus:ring-blue-500/20 dark:focus:ring-blue-500/20
                            transition-all duration-300
                            w-full
                          "
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-slate-300 flex items-center gap-2 mb-2">
                        <UserIcon className="w-4 h-4 text-pink-500" />
                        Género *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading || isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="
                            dark:bg-slate-900/80 dark:border-slate-700/60
                            dark:text-white
                            focus:ring-blue-500/20 dark:focus:ring-blue-500/20
                            transition-all duration-300
                            w-full
                          ">
                            <SelectValue placeholder="Seleccionar género..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="
                          dark:bg-slate-900 dark:border-slate-700/50
                          shadow-lg rounded-lg
                        ">
                          <SelectItem value="M" className="hover:bg-blue-50 dark:hover:bg-blue-950/30">
                            <span className="flex items-center gap-2">👨 Masculino</span>
                          </SelectItem>
                          <SelectItem value="F" className="hover:bg-pink-50 dark:hover:bg-pink-950/30">
                            <span className="flex items-center gap-2">👩 Femenino</span>
                          </SelectItem>
                          <SelectItem value="O" className="hover:bg-purple-50 dark:hover:bg-purple-950/30">
                            <span className="flex items-center gap-2">⭐ Otro</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-slate-300 flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-indigo-500" />
                        Rol *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value?.toString() ?? ''}
                        disabled={isLoading || isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="
                            dark:bg-slate-900/80 dark:border-slate-700/60
                            dark:text-white
                            focus:ring-blue-500/20 dark:focus:ring-blue-500/20
                            transition-all duration-300
                            w-full
                          ">
                            <SelectValue placeholder="Seleccionar rol..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="
                          dark:bg-slate-900 dark:border-slate-700/50
                          shadow-lg rounded-lg
                        ">
                          {roles.map((role) => (
                            <SelectItem
                              key={role.id}
                              value={role.id.toString()}
                              className="hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                            >
                              <span className="flex items-center gap-2">
                                <Shield className="w-3 h-3" />
                                {role.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Estado y Acceso */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="
                    flex items-center justify-between p-4
                    border border-emerald-200/30 dark:border-emerald-800/30
                    rounded-lg
                    bg-gradient-to-br from-emerald-50/50 to-emerald-50/30
                    dark:from-emerald-950/20 dark:to-emerald-950/10
                  ">
                    <div className="space-y-0.5 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <div>
                        <FormLabel className="dark:text-slate-300 font-semibold">Estado</FormLabel>
                        <FormDescription className="dark:text-slate-400 text-xs flex items-center gap-1">
                          {field.value ? (<><Check className="w-3 h-3" /> Activo</>) : (<><Circle className="w-3 h-3" /> Inactivo</>)}
                        </FormDescription>
                      </div>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={isLoading || isSubmitting}
                        className="
                          w-6 h-6 rounded
                          dark:bg-slate-800 dark:border-slate-600
                          cursor-pointer
                          transition-all duration-300
                        "
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="canAccessPlatform"
                render={({ field }) => (
                  <FormItem className="
                    flex items-center justify-between p-4
                    border border-blue-200/30 dark:border-blue-800/30
                    rounded-lg
                    bg-gradient-to-br from-blue-50/50 to-blue-50/30
                    dark:from-blue-950/20 dark:to-blue-950/10
                  ">
                    <div className="space-y-0.5 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-500" />
                      <div>
                        <FormLabel className="dark:text-slate-300 font-semibold">Acceso Plataforma</FormLabel>
                        <FormDescription className="dark:text-slate-400 text-xs">
                          {field.value ? 'Permitido' : 'Bloqueado'}
                        </FormDescription>
                      </div>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={isLoading || isSubmitting}
                        className="
                          w-6 h-6 rounded
                          dark:bg-slate-800 dark:border-slate-600
                          cursor-pointer
                          transition-all duration-300
                        "
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Parent Details Section - Shows when parent role is selected */}
            {isParentRole && (
              <div className="
                p-6 rounded-lg
                bg-gradient-to-br from-emerald-50/50 to-emerald-50/30
                dark:from-emerald-950/20 dark:to-emerald-950/10
                border border-emerald-200/50 dark:border-emerald-800/50
                space-y-4
              ">
                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Detalles del Padre/Tutor (Opcional)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* DPI Issued At */}
                  <FormField
                    control={form.control}
                    name="parentDetails.dpiIssuedAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300">Lugar de Emisión DPI</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="ej: Guatemala"
                            className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="parentDetails.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Alterno
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="email@ejemplo.com"
                            className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Work Phone */}
                  <FormField
                    control={form.control}
                    name="parentDetails.workPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Teléfono de Trabajo
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="12345678"
                            className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Occupation */}
                  <FormField
                    control={form.control}
                    name="parentDetails.occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300">Ocupación</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="ej: Ingeniero, Médico"
                            className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Workplace */}
                  <FormField
                    control={form.control}
                    name="parentDetails.workplace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Lugar de Trabajo
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="ej: Empresa ABC"
                            className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Is Sponsor */}
                  <FormField
                    control={form.control}
                    name="parentDetails.isSponsor"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base text-emerald-700 dark:text-emerald-300">¿Es Encargado?</FormLabel>
                          <FormDescription className="text-xs">
                            Marcar si es responsable legal del estudiante
                          </FormDescription>
                        </div>
                        <FormControl>
                          <input
                            {...field}
                            type="checkbox"
                            checked={field.value === true || field.value === 'true'}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="
                              w-6 h-6 rounded
                              dark:bg-slate-800 dark:border-slate-600
                              cursor-pointer
                              transition-all duration-300
                            "
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Sponsor Info */}
                <FormField
                  control={form.control}
                  name="parentDetails.sponsorInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">Información del Encargado</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          placeholder="Información adicional sobre el encargado..."
                          rows={3}
                          className="
                            flex min-h-[80px] w-full rounded-md border border-slate-200/50 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2
                            text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                            dark:focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50
                          "
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Teacher Details Section - Shows when teacher role is selected */}
            {isTeacherRole && (
              <div className="
                p-6 rounded-lg
                bg-gradient-to-br from-purple-50/50 to-purple-50/30
                dark:from-purple-950/20 dark:to-purple-950/10
                border border-purple-200/50 dark:border-purple-800/50
                space-y-4
              ">
                <h3 className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Detalles del Docente (Opcional)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hired Date */}
                  <FormField
                    control={form.control}
                    name="teacherDetails.hiredDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Fecha de Contratación
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            disabled={isSubmitting}
                            placeholder="Seleccionar fecha de contratación"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Academic Degree */}
                  <FormField
                    control={form.control}
                    name="teacherDetails.academicDegree"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          Grado Académico
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="ej: Licenciatura, Maestría"
                            disabled={isSubmitting}
                            className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Is Homeroom Teacher */}
                <FormField
                  control={form.control}
                  name="teacherDetails.isHomeroomTeacher"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-200/30 dark:border-purple-800/30 p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base text-purple-700 dark:text-purple-300">¿Es Maestro Guía?</FormLabel>
                        <FormDescription className="text-xs">
                          Marcar si es director/a de grado o maestro/a guía
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          {...field}
                          type="checkbox"
                          checked={field.value === true || field.value === 'true'}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="
                            w-6 h-6 rounded
                            dark:bg-slate-800 dark:border-slate-600
                            cursor-pointer
                            transition-all duration-300
                          "
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </TabsContent>

          {/* Foto Tab */}
          <TabsContent value="photo" className="space-y-6 mt-6">
            <Card className="
              border border-slate-200/50 dark:border-slate-700/50
              bg-gradient-to-br from-white/50 to-slate-50/50
              dark:from-slate-800/40 dark:to-slate-900/30
              shadow-lg
            ">
              <CardHeader>
                <CardTitle className="
                  text-lg font-bold
                  bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400
                  bg-clip-text text-transparent
                  flex items-center gap-2
                ">
                  <Camera className="w-5 h-5 text-blue-500" />
                  Foto de Perfil
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Carga una imagen profesional para el perfil del usuario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preview */}
                {currentPictureUrl ? (
                  <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/30 dark:to-slate-900/20 border border-slate-200/30 dark:border-slate-700/30">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-500/30 dark:to-purple-500/30 blur-lg" />
                      <Avatar className="
                        h-32 w-32 border-4 border-white dark:border-slate-800
                        ring-4 ring-blue-500/20 dark:ring-blue-500/20
                        relative
                      ">
                        <AvatarImage src={currentPictureUrl} />
                        <AvatarFallback className="
                          bg-gradient-to-br from-blue-100 to-purple-100
                          dark:from-blue-900/50 dark:to-purple-900/50
                          text-slate-700 dark:text-slate-100 text-3xl font-bold
                        ">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSubmitting}
                        className="
                          bg-gradient-to-r from-blue-500 to-blue-600
                          hover:from-blue-600 hover:to-blue-700
                          dark:from-blue-600 dark:to-blue-700
                          text-white font-semibold
                          transition-all duration-300
                        "
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Cambiar foto
                      </Button>
                      {preview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveFile}
                          disabled={isSubmitting}
                          className="
                            border-red-200/50 dark:border-red-800/50
                            text-red-700 dark:text-red-400
                            hover:bg-red-50 dark:hover:bg-red-950/20
                            transition-all duration-300
                          "
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar cambio
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className="
                      border-2 border-dashed border-slate-300 dark:border-slate-600
                      rounded-xl p-12 text-center cursor-pointer
                      hover:border-slate-400 dark:hover:border-slate-500
                      hover:bg-slate-50/50 dark:hover:bg-slate-800/30
                      transition-all duration-300
                      group
                    "
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex justify-center mb-3">
                      <div className="
                        p-4 rounded-full
                        bg-gradient-to-br from-blue-100 to-purple-100/50
                        dark:from-blue-900/30 dark:to-purple-900/20
                        group-hover:from-blue-200 group-hover:to-purple-200/50
                        dark:group-hover:from-blue-900/50 dark:group-hover:to-purple-900/40
                        transition-all duration-300
                      ">
                        <Upload className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Arrastra una foto o haz clic para cargar
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      JPG, PNG, GIF o WebP • Máx. 5MB • 1:1 recomendado
                    </p>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Información */}
                <Alert className="
                  border border-blue-200/50 dark:border-blue-800/50
                  bg-blue-50/50 dark:bg-blue-950/20
                  rounded-lg
                ">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="dark:text-slate-300 text-slate-700">
                    <strong>Nota importante:</strong> La foto se cargará automáticamente cuando se guarde el usuario. Si la carga falla, se eliminará al crear/actualizar.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-slate-200/30 dark:border-slate-700/30">
          <Button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="
              flex-1 h-11
              bg-gradient-to-r from-blue-500 to-blue-600
              hover:from-blue-600 hover:to-blue-700
              dark:from-blue-600 dark:to-blue-700
              dark:hover:from-blue-700 dark:hover:to-blue-800
              text-white font-bold
              transition-all duration-300
              shadow-lg hover:shadow-xl
              rounded-lg
            "
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {isEditMode ? 'Actualizar' : 'Crear'} Usuario
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading || isSubmitting}
              className="
                flex-1 h-11
                border border-slate-200/60 dark:border-slate-700/60
                hover:border-slate-300/80 dark:hover:border-slate-600/80
                text-slate-700 dark:text-slate-300
                hover:bg-slate-50/80 dark:hover:bg-slate-800/50
                font-bold
                transition-all duration-300
                rounded-lg
              "
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}