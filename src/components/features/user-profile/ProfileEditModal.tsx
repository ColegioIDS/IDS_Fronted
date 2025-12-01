'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { User, Camera, GraduationCap, Loader2, Calendar as CalendarIcon, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/user-profile';
import { locationsService, type Department, type Municipality } from '@/services/locations.service';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

const EditFormSchema = z.object({
  givenNames: z.string().min(2, 'El nombre es requerido'),
  lastNames: z.string().min(2, 'El apellido es requerido'),
  phone: z.string().min(8, 'Teléfono inválido'),
  birthDate: z.date({
    required_error: 'Selecciona una fecha',
  }),
  gender: z.enum(['Masculino', 'Femenino']),
  address: z.object({
    street: z.string().optional(),
    zone: z.string().optional(),
    municipality: z.object({
      id: z.number().optional(),
      name: z.string().optional(),
    }).optional(),
    department: z.object({
      id: z.number().optional(),
      name: z.string().optional(),
    }).optional(),
  }),
  teacherDetails: z
    .object({
      hiredDate: z.date().optional(),
      isHomeroomTeacher: z.boolean().optional(),
      academicDegree: z.string().optional(),
    })
    .optional(),
  parentDetails: z
    .object({
      occupation: z.string().optional(),
      workplace: z.string().optional(),
      workPhone: z.string().optional(),
      isSponsor: z.boolean().optional(),
      sponsorInfo: z.string().optional(),
    })
    .optional(),
});

type EditFormData = z.infer<typeof EditFormSchema>;

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(profile?.profilePicture?.url);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(
    profile?.address?.municipality?.department?.id || null
  );
  const [loadingLocations, setLoadingLocations] = useState(false);
  const { updateProfile } = useUserProfile();

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
      if (profile?.address?.municipality?.department?.id) {
        loadMunicipalities(profile.address.municipality.department.id);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDepartmentId) {
      loadMunicipalities(selectedDepartmentId);
    }
  }, [selectedDepartmentId]);

  const loadDepartments = async () => {
    try {
      setLoadingLocations(true);
      const data = await locationsService.getAllDepartments();
      setDepartments(data);
    } catch (error: any) {
      console.error('Error al cargar departamentos:', error);
      toast.error('Error al cargar departamentos');
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadMunicipalities = async (departmentId: number) => {
    try {
      setLoadingLocations(true);
      const data = await locationsService.getMunicipalities(departmentId);
      setMunicipalities(data);
    } catch (error: any) {
      console.error('Error al cargar municipios:', error);
      toast.error('Error al cargar municipios');
    } finally {
      setLoadingLocations(false);
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(EditFormSchema),
    defaultValues: {
      givenNames: profile?.givenNames || '',
      lastNames: profile?.lastNames || '',
      phone: profile?.phone || '',
      birthDate: profile?.birthDate ? new Date(profile.birthDate) : new Date(),
      gender: profile?.gender || 'Femenino',
      address: {
        street: profile?.address?.street || '',
        zone: profile?.address?.zone || '',
        municipality: profile?.address?.municipality
          ? {
              id: profile.address.municipality.id,
              name: profile.address.municipality.name,
            }
          : undefined,
        department: profile?.address?.municipality?.department
          ? {
              id: profile.address.municipality.department.id,
              name: profile.address.municipality.department.name,
            }
          : undefined,
      },
      teacherDetails: profile?.teacherDetails
        ? {
            hiredDate: profile.teacherDetails.hiredDate ? new Date(profile.teacherDetails.hiredDate) : undefined,
            isHomeroomTeacher: profile.teacherDetails.isHomeroomTeacher || false,
            academicDegree: profile.teacherDetails.academicDegree || '',
          }
        : undefined,
      parentDetails: profile?.parentDetails
        ? {
            occupation: profile.parentDetails.occupation || '',
            workplace: profile.parentDetails.workplace || '',
            workPhone: profile.parentDetails.workPhone || '',
            isSponsor: profile.parentDetails.isSponsor || false,
            sponsorInfo: profile.parentDetails.sponsorInfo || '',
          }
        : undefined,
    },
  });

  const birthDate = watch('birthDate');
  const gender = watch('gender');
  const isHomeroomTeacher = watch('teacherDetails.isHomeroomTeacher');
  const isSponsor = watch('parentDetails.isSponsor');
  const municipalityId = watch('address.municipality')?.id;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: EditFormData) => {
    try {
      setIsLoading(true);

      let profileData: any = {
        ...data,
        birthDate: format(data.birthDate, 'yyyy-MM-dd'),
      };

      if (data.teacherDetails?.hiredDate) {
        profileData.teacherDetails.hiredDate = format(data.teacherDetails.hiredDate, 'yyyy-MM-dd');
      }

      if (selectedFile) {
        profileData.profilePicture = selectedFile;
      } else {
        delete profileData.profilePicture;
      }

      await updateProfile(profileData);
      toast.success('Perfil actualizado correctamente');
      setSelectedFile(null);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (givenNames: string, lastNames: string) => {
    return `${givenNames?.charAt(0) || ''}${lastNames?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-2xl">
        <DialogHeader className="pb-6 border-b-2 border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50/50 via-transparent to-blue-50/50 dark:from-blue-950/30 dark:via-transparent dark:to-blue-950/30 -mx-6 -mt-6 px-6 pt-6 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform duration-300">
              <User className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Editar Perfil
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Actualiza tu información personal
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 gap-3 mb-8 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 p-2 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700">
              <TabsTrigger
                value="personal"
                className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 font-semibold"
              >
                <User className="mr-2 h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger
                value="photo"
                className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 font-semibold"
              >
                <Camera className="mr-2 h-4 w-4" />
                Foto
              </TabsTrigger>
              {profile?.role?.roleType === 'TEACHER' && (
                <TabsTrigger
                  value="teacher"
                  className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 col-span-2 sm:col-span-1 font-semibold"
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Docente
                </TabsTrigger>
              )}
              {profile?.role?.roleType === 'PARENT' && (
                <TabsTrigger
                  value="parent"
                  className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-rose-600 dark:data-[state=active]:text-rose-400 data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 col-span-2 sm:col-span-1 font-semibold"
                >
                  <User className="mr-2 h-4 w-4" />
                  Familia
                </TabsTrigger>
              )}
            </TabsList>

            {/* Personal Tab */}
            <TabsContent value="personal" className="space-y-6">
              {/* Nombres */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Información Básica</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="givenNames" className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombres</Label>
                    <Input
                      id="givenNames"
                      placeholder="Ingresa tus nombres"
                      disabled={isLoading}
                      {...register('givenNames')}
                      className={cn(
                        'rounded-lg border-2 transition-colors',
                        errors.givenNames 
                          ? 'border-red-400 bg-red-50 dark:bg-red-950/20' 
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      )}
                    />
                    {errors.givenNames && (
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.givenNames.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastNames" className="text-sm font-medium text-slate-700 dark:text-slate-300">Apellidos</Label>
                    <Input
                      id="lastNames"
                      placeholder="Ingresa tus apellidos"
                      disabled={isLoading}
                      {...register('lastNames')}
                      className={cn(
                        'rounded-lg border-2 transition-colors',
                        errors.lastNames 
                          ? 'border-red-400 bg-red-50 dark:bg-red-950/20' 
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      )}
                    />
                    {errors.lastNames && (
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.lastNames.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email}
                    disabled={true}
                    className="rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Contacto */}
              <div className="space-y-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Información de Contacto</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</Label>
                    <Input
                      id="phone"
                      placeholder="+502 0000-0000"
                      disabled={isLoading}
                      {...register('phone')}
                      className={cn(
                        'rounded-lg border-2 transition-colors',
                        errors.phone 
                          ? 'border-red-400 bg-red-50 dark:bg-red-950/20' 
                          : 'border-blue-300 dark:border-blue-700/50 bg-white dark:bg-slate-800'
                      )}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de Nacimiento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isLoading}
                          className={cn(
                            'w-full justify-start text-left font-normal rounded-lg border-2 transition-colors',
                            !birthDate && 'text-slate-500 dark:text-slate-400',
                            errors.birthDate 
                              ? 'border-red-400 bg-red-50 dark:bg-red-950/20' 
                              : 'border-blue-300 dark:border-blue-700/50 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                          {birthDate ? format(birthDate, 'PPP', { locale: es }) : 'Selecciona una fecha'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={birthDate}
                          onSelect={(date) => setValue('birthDate', date || new Date())}
                          disabled={(date) => date > new Date()}
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.birthDate && (
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Selecciona una fecha válida
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Género */}
              <div className="space-y-4 p-4 rounded-lg bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/30">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Datos Personales</h3>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium text-slate-700 dark:text-slate-300">Género</Label>
                  <Select
                    value={gender}
                    onValueChange={(value) => setValue('gender', value as 'Masculino' | 'Femenino')}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="rounded-lg border-2 border-teal-300 dark:border-teal-700/50 bg-white dark:bg-slate-800">
                      <SelectValue placeholder="Selecciona tu género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Femenino">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dirección */}
              <div className="space-y-4 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  Dirección
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium text-slate-700 dark:text-slate-300">Departamento</Label>
                    <Select
                      value={selectedDepartmentId?.toString() || ''}
                      onValueChange={(value) => {
                        const deptId = parseInt(value, 10);
                        setSelectedDepartmentId(deptId);
                        setValue('address.department', {
                          id: deptId,
                          name: departments.find(d => d.id === deptId)?.name || '',
                        });
                        setValue('address.municipality', undefined);
                      }}
                      disabled={isLoading || loadingLocations || departments.length === 0}
                    >
                      <SelectTrigger className="rounded-lg border-2 border-rose-300 dark:border-rose-700/50 bg-white dark:bg-slate-800">
                        <SelectValue placeholder="Selecciona un departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="municipality" className="text-sm font-medium text-slate-700 dark:text-slate-300">Municipio</Label>
                    <Select
                      value={municipalityId?.toString() || ''}
                      onValueChange={(value) => {
                        const municId = parseInt(value, 10);
                        const selectedMunic = municipalities.find(m => m.id === municId);
                        setValue('address.municipality', {
                          id: municId,
                          name: selectedMunic?.name || '',
                        });
                      }}
                      disabled={isLoading || loadingLocations || municipalities.length === 0 || !selectedDepartmentId}
                    >
                      <SelectTrigger className="rounded-lg border-2 border-rose-300 dark:border-rose-700/50 bg-white dark:bg-slate-800">
                        <SelectValue placeholder="Selecciona un municipio" />
                      </SelectTrigger>
                      <SelectContent>
                        {municipalities.map((munic) => (
                          <SelectItem key={munic.id} value={munic.id.toString()}>
                            {munic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="street" className="text-sm font-medium text-slate-700 dark:text-slate-300">Calle</Label>
                    <Input
                      id="street"
                      placeholder="Ej: Avenida Principal, Calle 5A"
                      disabled={isLoading}
                      {...register('address.street')}
                      className="rounded-lg border-2 border-rose-300 dark:border-rose-700/50 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="zone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Zona</Label>
                    <Input
                      id="zone"
                      placeholder="Ej: Zona 10, Zona Centro"
                      disabled={isLoading}
                      {...register('address.zone')}
                      className="rounded-lg border-2 border-rose-300 dark:border-rose-700/50 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Photo Tab */}
            <TabsContent value="photo" className="space-y-6">
              <div className="flex flex-col items-center gap-6 py-8">
                <div className="relative group">
                  <div className="rounded-full p-1 bg-gradient-to-br from-teal-500 via-teal-600 to-blue-600 dark:from-teal-600 dark:via-teal-700 dark:to-blue-700 shadow-xl group-hover:shadow-teal-500/50 dark:group-hover:shadow-teal-700/50 transition-all duration-300 group-hover:scale-105">
                    <Avatar className="h-40 w-40 border-4 border-white dark:border-slate-900 shadow-lg transition-transform duration-300 group-hover:scale-105">
                      <AvatarImage
                        src={previewUrl}
                        alt={`${profile?.givenNames} ${profile?.lastNames}`}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-600 dark:from-teal-600 dark:to-blue-700 text-white text-4xl font-bold">
                        {getInitials(profile?.givenNames, profile?.lastNames)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <label
                    htmlFor="photo-input"
                    className="absolute -bottom-2 -right-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-3 shadow-xl cursor-pointer hover:scale-110 hover:shadow-blue-500/50 dark:hover:shadow-blue-700/50 transition-all duration-300"
                  >
                    <Camera className="h-5 w-5 text-white" />
                    <span className="sr-only">Cambiar foto</span>
                  </label>
                  <input
                    id="photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isLoading}
                    className="hidden"
                  />
                </div>
                <div className="text-center max-w-xs">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                    Haz clic en el ícono de cámara para cambiar tu foto
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Formatos: JPG, PNG • Máximo 5MB
                  </p>
                </div>
                {selectedFile && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-700/50 rounded-lg p-4 w-full">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                          Imagen seleccionada
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-200 truncate">
                          {selectedFile.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Teacher Tab */}
            {profile?.role?.roleType === 'TEACHER' && (
              <TabsContent value="teacher" className="space-y-6">
                <div className="space-y-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    Información del Docente
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hiredDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de Contratación</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isLoading}
                          className="w-full justify-start text-left font-normal rounded-lg border-2 border-amber-300 dark:border-amber-700/50 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {watch('teacherDetails.hiredDate')
                            ? format(watch('teacherDetails.hiredDate') as Date, 'PPP', { locale: es })
                            : 'Selecciona una fecha'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={watch('teacherDetails.hiredDate')}
                          onSelect={(date) => setValue('teacherDetails.hiredDate', date || new Date())}
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="academicDegree" className="text-sm font-medium text-slate-700 dark:text-slate-300">Título Académico</Label>
                    <Input
                      id="academicDegree"
                      placeholder="Ej: Licenciatura en Educación"
                      disabled={isLoading}
                      {...register('teacherDetails.academicDegree')}
                      className="rounded-lg border-2 border-amber-300 dark:border-amber-700/50 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="isHomeroomTeacher" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Maestro Guía
                      </Label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Eres maestro guía de una sección
                      </p>
                    </div>
                    <Switch
                      id="isHomeroomTeacher"
                      checked={isHomeroomTeacher || false}
                      onCheckedChange={(checked) => setValue('teacherDetails.isHomeroomTeacher', checked)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Parent Tab */}
            {profile?.role?.roleType === 'PARENT' && (
              <TabsContent value="parent" className="space-y-6">
                <div className="space-y-4 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Información Laboral</h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="occupation" className="text-sm font-medium text-slate-700 dark:text-slate-300">Ocupación</Label>
                      <Input
                        id="occupation"
                        placeholder="Tu ocupación"
                        disabled={isLoading}
                        {...register('parentDetails.occupation')}
                        className="rounded-lg border-2 border-rose-300 dark:border-rose-700/50 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workplace" className="text-sm font-medium text-slate-700 dark:text-slate-300">Lugar de Trabajo</Label>
                      <Input
                        id="workplace"
                        placeholder="Nombre de la empresa"
                        disabled={isLoading}
                        {...register('parentDetails.workplace')}
                        className="rounded-lg border-2 border-rose-300 dark:border-rose-700/50 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workPhone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono Laboral</Label>
                    <Input
                      id="workPhone"
                      placeholder="+502 0000-0000"
                      disabled={isLoading}
                      {...register('parentDetails.workPhone')}
                      className="rounded-lg border-2 border-rose-300 dark:border-rose-700/50 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="isSponsor" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Patrocinador
                      </Label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Eres patrocinador del colegio
                      </p>
                    </div>
                    <Switch
                      id="isSponsor"
                      checked={isSponsor || false}
                      onCheckedChange={(checked) => setValue('parentDetails.isSponsor', checked)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {isSponsor && (
                  <div className="space-y-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30 animate-in fade-in duration-300">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Detalles de Patrocinio</h3>
                    <div className="space-y-2">
                      <Label htmlFor="sponsorInfo" className="text-sm font-medium text-slate-700 dark:text-slate-300">Información</Label>
                      <Input
                        id="sponsorInfo"
                        placeholder="Detalles de patrocinio"
                        disabled={isLoading}
                        {...register('parentDetails.sponsorInfo')}
                        className="rounded-lg border-2 border-indigo-300 dark:border-indigo-700/50 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </form>

        <DialogFooter className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};