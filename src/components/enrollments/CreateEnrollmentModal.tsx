'use client';

import { useState, useEffect } from 'react';
import { useEnrollmentContext } from '@/context/EnrollmentContext';
import { useStudentContext } from '@/context/StudentContext';
import { useCyclesContext } from '@/context/CyclesContext';
import { useGradeContext } from '@/context/GradeContext';
import { useSectionContext } from '@/context/SectionsContext';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  Users,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Heart,
  Star,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { EnrollmentStatus } from '@/types/enrollment.types';
import type { Student } from '@/types/student';
import type { SchoolCycle } from '@/types/SchoolCycle';
import type { Grade } from '@/types/grades';
import type { Section } from '@/types/sections';

// Schema para el formulario de enrollment
const enrollmentSchema = z.object({
  studentId: z.union([z.number(), z.string()]).refine(val => Number(val) > 0, {
    message: "Debe seleccionar un estudiante"
  }),
  cycleId: z.union([z.number(), z.string()]).refine(val => Number(val) > 0, {
    message: "Debe seleccionar un ciclo escolar"
  }),
  gradeId: z.union([z.number(), z.string()]).refine(val => Number(val) > 0, {
    message: "Debe seleccionar un grado"
  }),
  sectionId: z.union([z.number(), z.string()]).refine(val => Number(val) > 0, {
    message: "Debe seleccionar una sección"
  }),
  status: z.nativeEnum(EnrollmentStatus)
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

interface CreateEnrollmentModalProps {
  onClose?: () => void;
  createEnrollment?: (data: any) => Promise<any>;
  isSubmitting?: boolean;
}

const steps = [
  { id: 1, title: "Seleccionar Estudiante", icon: User },
  { id: 2, title: "Información Académica", icon: GraduationCap },
  { id: 3, title: "Confirmación", icon: CheckCircle },
];

export default function CreateEnrollmentModal({ 
  onClose, 
  createEnrollment: createEnrollmentProp, 
  isSubmitting: isSubmittingProp 
}: CreateEnrollmentModalProps) {
  // Usar props si están disponibles, sino usar contexto como fallback
  const contextValues = useEnrollmentContext();
  const createEnrollment = createEnrollmentProp || contextValues.createEnrollment;
  const isSubmitting = isSubmittingProp ?? contextValues.isSubmitting;
  
  // Contexts para datos reales - usando las propiedades correctas de los hooks
  const { 
    student: students, // El hook retorna 'student' que es un array
    isLoadingUsers: studentsLoading,
    usersError: studentsError,
    fetchUsers: fetchStudents
  } = useStudentContext();
  
  const { 
    cycles, 
    fetchCycles,
    isLoadingCycles: cyclesLoading 
  } = useCyclesContext();
  
  const { 
    grades, 
    fetchGrades,
    isLoadingGrades: gradesLoading 
  } = useGradeContext();
  
  const { 
    sections, 
    fetchSections,
    isLoadingSections: sectionsLoading 
  } = useSectionContext();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<Section[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      studentId: '',
      cycleId: '',
      gradeId: '',
      sectionId: '',
      status: EnrollmentStatus.ACTIVE,
    },
  });

  const { watch, setValue, formState: { errors } } = form;
  const watchedValues = watch();

  // Cargar datos iniciales
  useEffect(() => {
    fetchCycles();
    fetchGrades();
    fetchStudents();
  }, []);

  // Auto-seleccionar ciclo activo cuando se cargan los ciclos
  useEffect(() => {
    if (cycles && cycles.length > 0 && !watchedValues.cycleId) {
      const activeCycle = cycles.find(cycle => cycle.isActive);
      if (activeCycle) {
        setValue('cycleId', activeCycle.id as any);
      }
    }
  }, [cycles, watchedValues.cycleId]);

  // Filtrar estudiantes por término de búsqueda
  useEffect(() => {
    if (students && students.length > 0) {
      if (searchTerm.trim().length >= 2) {
        const filtered = students.filter(student =>
          student.givenNames.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.lastNames.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.codeSIRE && student.codeSIRE.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredStudents(filtered);
      } else {
        setFilteredStudents([]);
      }
    }
  }, [students, searchTerm]);

  // Cargar secciones cuando cambie el grado seleccionado
  useEffect(() => {
    if (selectedGrade) {
      const gradeId = parseInt(selectedGrade);
      fetchSections(gradeId);
    }
  }, [selectedGrade]);

  // Actualizar secciones disponibles cuando cambien las secciones
  useEffect(() => {
    if (sections && selectedGrade) {
      const gradeId = parseInt(selectedGrade);
      const gradeSections = sections.filter(section => section.gradeId === gradeId);
      setAvailableSections(gradeSections);
    } else {
      setAvailableSections([]);
    }
  }, [sections, selectedGrade]);

  // Verificar conflictos cuando cambien los valores del formulario
  useEffect(() => {
    const checkConflicts = () => {
      if (!selectedStudent || !watchedValues.cycleId || !watchedValues.sectionId) {
        setConflicts([]);
        return;
      }

      const newConflicts: string[] = [];

      // Verificar capacidad de la sección
      const section = availableSections.find(s => s.id === Number(watchedValues.sectionId));
      if (section) {
        // Aquí puedes agregar lógica para verificar la capacidad actual
        // Por ahora simularemos que está disponible
      }

      // Aquí podrías agregar más verificaciones como:
      // - Estudiante ya matriculado en el ciclo
      // - Edad apropiada para el grado
      // - Prerrequisitos académicos

      setConflicts(newConflicts);
    };

    checkConflicts();
  }, [selectedStudent, watchedValues.cycleId, watchedValues.sectionId, availableSections]);

  // Calculate age
  const calculateAge = (birthDate: string | Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Get student avatar
  const getStudentAvatar = (student: Student) => {
    const profilePicture = student.pictures?.find((pic) => pic.kind === 'profile');
    return profilePicture?.url || '';
  };

  const getStudentInitials = (student: Student) => {
    return `${student.givenNames?.charAt(0)}${student.lastNames?.charAt(0)}`.toUpperCase();
  };

  // Handle student selection
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setValue('studentId', student.id as any);
    setCurrentStep(2);
  };

  // Handle form submission
  const onSubmit = async (data: EnrollmentFormData) => {
    try {
      // Convertir strings a numbers para la API
      const submitData = {
        studentId: Number(data.studentId),
        cycleId: Number(data.cycleId),
        gradeId: Number(data.gradeId),
        sectionId: Number(data.sectionId),
        status: data.status
      };

      const result = await createEnrollment(submitData);
      if (result.success) {
        // Limpiar todo el estado del modal
        form.reset({
          studentId: '',
          cycleId: '',
          gradeId: '',
          sectionId: '',
          status: EnrollmentStatus.ACTIVE,
        });
        setSelectedStudent(null);
        setSearchTerm("");
        setSelectedGrade("");
        setConflicts([]);
        setAvailableSections([]);
        setFilteredStudents([]);
        setCurrentStep(1);
        
        onClose?.();
      }
    } catch (error) {
      console.error('Error creating enrollment:', error);
    }
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canProceedToStep2 = selectedStudent !== null;
  const canProceedToStep3 = watchedValues.cycleId && watchedValues.gradeId && watchedValues.sectionId && conflicts.length === 0;

  // Loading state
  const isLoading = studentsLoading || cyclesLoading || gradesLoading || sectionsLoading;

  return (
<DialogContent className="!max-w-[90vw] w-[90vw] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          Nueva Matrícula
        </DialogTitle>
        <DialogDescription>
          Registra una nueva matrícula siguiendo los pasos del asistente
        </DialogDescription>
      </DialogHeader>

      {/* Steps Indicator */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center gap-2 ${
              currentStep >= step.id 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-400'
            }`}>
              <div className={`p-2 rounded-full ${
                currentStep >= step.id 
                  ? 'bg-blue-100 dark:bg-blue-900/30' 
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                <step.icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium hidden sm:block">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-px mx-4 ${
                currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Student Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Seleccionar Estudiante</h3>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre o código SIRE (mín. 2 caracteres)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {studentsLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
                )}
              </div>

              {/* Students List */}
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Cargando estudiantes...</span>
                  </div>
                ) : filteredStudents && filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <Card
                      key={student.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedStudent?.id === student.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => handleStudentSelect(student)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage 
                              src={getStudentAvatar(student) || undefined}
                              alt={`${student.givenNames} ${student.lastNames}`}
                            />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                              {getStudentInitials(student)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {student.givenNames} {student.lastNames}
                            </h4>
                            {student.codeSIRE && (
                              <p className="text-sm text-gray-500 font-mono">{student.codeSIRE}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {calculateAge(student.birthDate)} años
                              </span>
                              {student.birthPlace && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {student.birthPlace}
                                </span>
                              )}
                            </div>
                          </div>
                          {(student.favoriteColor || student.hobby) && (
                            <div className="text-right">
                              {student.favoriteColor && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Heart className="h-3 w-3 text-pink-500" />
                                  {student.favoriteColor}
                                </div>
                              )}
                              {student.hobby && (
                                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  {student.hobby}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : searchTerm.length >= 2 ? (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron estudiantes que coincidan con "{searchTerm}"
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Ingresa al menos 2 caracteres para buscar estudiantes
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Academic Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Información Académica</h3>
              </div>

              {/* Selected Student Info */}
              {selectedStudent && (
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={getStudentAvatar(selectedStudent) || undefined}
                          alt={`${selectedStudent.givenNames} ${selectedStudent.lastNames}`}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                          {getStudentInitials(selectedStudent)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">
                          {selectedStudent.givenNames} {selectedStudent.lastNames}
                        </h4>
                        {selectedStudent.codeSIRE && (
                          <p className="text-sm text-blue-700 dark:text-blue-300 font-mono">
                            {selectedStudent.codeSIRE}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cycle Selection */}
                <FormField
                  control={form.control}
                  name="cycleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        Ciclo Escolar
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value?.toString()}
                        disabled={cyclesLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar ciclo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cycles?.map((cycle) => (
                            <SelectItem key={cycle.id} value={cycle.id.toString()}>
                              <div className="flex items-center gap-2">
                                {cycle.name}
                                {cycle.isActive && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                    Actual
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Grade Selection */}
                <FormField
                  control={form.control}
                  name="gradeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-purple-500" />
                        Grado
                      </FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedGrade(value);
                          setValue('sectionId', ''); // Reset section when grade changes
                        }}
                        value={field.value?.toString()}
                        disabled={gradesLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar grado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {grades?.filter(grade => grade.isActive).map((grade) => (
                            <SelectItem key={grade.id} value={grade.id.toString()}>
                              <div className="flex items-center gap-2">
                                {grade.name}
                                <Badge variant="outline" className="text-xs">
                                  {grade.level}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Section Selection */}
                <FormField
                  control={form.control}
                  name="sectionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-500" />
                        Sección
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value?.toString()}
                        disabled={!selectedGrade || sectionsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar sección" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableSections.map((section) => {
                            // Simular conteo de matrículas - reemplaza esto con datos reales
                            const enrolledCount = Math.floor(Math.random() * section.capacity); // TEMPORAL
                            const availableSpots = section.capacity - enrolledCount;
                            const isNearCapacity = availableSpots <= 3;
                            const isFull = availableSpots <= 0;
                            
                            return (
                              <SelectItem 
                                key={section.id} 
                                value={section.id.toString()}
                                disabled={isFull}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>Sección {section.name}</span>
                                  <div className="flex items-center gap-2 ml-4">
                                    <Badge 
                                      variant={isFull ? "destructive" : isNearCapacity ? "secondary" : "outline"} 
                                      className="text-xs"
                                    >
                                      {availableSpots} disponibles
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      ({enrolledCount}/{section.capacity})
                                    </span>
                                    {section.teacher && (
                                      <span className="text-xs text-gray-500 truncate max-w-20">
                                        {section.teacher.givenNames.split(' ')[0]}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status Selection */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-orange-500" />
                        Estado Inicial
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={EnrollmentStatus.ACTIVE}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              Activo
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Conflicts Alert */}
              {conflicts.length > 0 && (
                <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {conflicts.map((conflict, index) => (
                        <div key={index} className="text-orange-700 dark:text-orange-400">
                          • {conflict}
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Confirmación</h3>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumen de la Matrícula</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Student Info */}
                  {selectedStudent && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Estudiante</h4>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={getStudentAvatar(selectedStudent) || undefined}
                            alt={`${selectedStudent.givenNames} ${selectedStudent.lastNames}`}
                          />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                            {getStudentInitials(selectedStudent)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {selectedStudent.givenNames} {selectedStudent.lastNames}
                          </p>
                          {selectedStudent.codeSIRE && (
                            <p className="text-sm text-gray-500 font-mono">{selectedStudent.codeSIRE}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Academic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Información Académica</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ciclo:</span>
                          <span className="font-medium">
                            {cycles?.find(c => c.id === Number(watchedValues.cycleId))?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Grado:</span>
                          <span className="font-medium">
                            {grades?.find(g => g.id === Number(watchedValues.gradeId))?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sección:</span>
                          <span className="font-medium">
                            {availableSections.find(s => s.id === Number(watchedValues.sectionId))?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estado:</span>
                          <Badge className="bg-green-100 text-green-700">Activo</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="flex gap-2">
              {currentStep < 3 && (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !canProceedToStep2) ||
                    (currentStep === 2 && !canProceedToStep3)
                  }
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}

              {currentStep === 3 && (
                <Button
                  type="submit"
                  disabled={isSubmitting || conflicts.length > 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Matrícula'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}