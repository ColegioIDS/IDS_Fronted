// src/components/attendance/AttendanceFormTable.tsx

'use client';

import { useState, useMemo } from 'react';
import { useAttendance } from '@/hooks/useAttendance';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { LoadingSpinner, LoadingButton } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { Search, Save, Calendar, CheckCircle2, UserX, Clock3, FileText } from 'lucide-react';

// Validation schema
const dateFormSchema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
});

type DateFormData = z.infer<typeof dateFormSchema>;

// Mock data - Reemplaza con datos reales
interface Student {
  id: string;
  name: string;
  enrollmentId: number;
}

const mockStudents: Student[] = [
  { id: '1', name: 'Juan Pérez García', enrollmentId: 1 },
  { id: '2', name: 'María López Martínez', enrollmentId: 2 },
  { id: '3', name: 'Carlos Rodríguez Silva', enrollmentId: 3 },
  { id: '4', name: 'Ana Gómez Hernández', enrollmentId: 4 },
  { id: '5', name: 'Luis Fernández Torres', enrollmentId: 5 },
  { id: '6', name: 'Sofía Martín García', enrollmentId: 6 },
  { id: '7', name: 'Miguel Ángel Sánchez', enrollmentId: 7 },
  { id: '8', name: 'Laura Díaz López', enrollmentId: 8 },
];

const STATUS_OPTIONS = [
  { value: 'A', label: 'Presente', color: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-300', icon: CheckCircle2 },
  { value: 'I', label: 'Ausente', color: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-300', icon: UserX },
  { value: 'IJ', label: 'Ausente J.', color: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-700 dark:text-blue-300', icon: FileText },
  { value: 'TI', label: 'Tardanza', color: 'bg-yellow-100 dark:bg-yellow-900/30', textColor: 'text-yellow-700 dark:text-yellow-300', icon: Clock3 },
  { value: 'TJ', label: 'Tardanza J.', color: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-700 dark:text-orange-300', icon: Clock3 },
];

interface StudentAttendance {
  studentId: string;
  status: string | null;
}

export default function AttendanceFormTable() {
  const { createAttendance, bulkCreate, loading } = useAttendance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [studentAttendances, setStudentAttendances] = useState<Map<string, string>>(new Map());

  const form = useForm<DateFormData>({
    resolver: zodResolver(dateFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  // Filtrar estudiantes por búsqueda
  const filteredStudents = useMemo(() => {
    return mockStudents.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.enrollmentId.toString().includes(searchTerm)
    );
  }, [searchTerm]);

  // Seleccionar/deseleccionar todos
  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  // Seleccionar individual
  const handleSelectStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  // Cambiar estado de un estudiante
  const handleStatusChange = (studentId: string, status: string) => {
    setStudentAttendances((prev) => {
      const newMap = new Map(prev);
      newMap.set(studentId, status);
      return newMap;
    });
  };

  // Guardar asistencia seleccionada
  const handleSaveSelected = async () => {
    const date = form.getValues('date');
    const selectedWithStatus = Array.from(selectedStudents).filter(
      (id) => studentAttendances.has(id)
    );

    if (selectedWithStatus.length === 0) {
      toast.error('Selecciona estudiantes y asigna estado');
      return;
    }

    try {
      const attendances = selectedWithStatus.map((studentId) => ({
        enrollmentId: parseInt(studentId),
        date: new Date(date).toISOString(),
        statusCode: studentAttendances.get(studentId) as 'A' | 'I' | 'IJ' | 'TI' | 'TJ',
      }));

      await bulkCreate(attendances);
      toast.success(`✅ ${attendances.length} registros guardados`);
      
      // Limpiar
      setSelectedStudents(new Set());
      setStudentAttendances(new Map());
    } catch (error) {
      toast.error('❌ Error al guardar');
    }
  };

  const getStatusConfig = (status: string | undefined) => {
    return STATUS_OPTIONS.find((opt) => opt.value === status);
  };

  return (
    <div className="space-y-6">
      {/* Date & Actions */}
      <Form {...form}>
        <form className="space-y-4">
          <div className="flex gap-4 items-end">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="flex items-center text-sm font-medium">
                    <Calendar className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                    Fecha
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="button"
              onClick={handleSaveSelected}
              disabled={loading || selectedStudents.size === 0}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <LoadingButton />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar ({selectedStudents.size})
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar por nombre o matrícula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
        />
      </div>

      {/* Table */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">
            Estudiantes ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-700 hover:bg-transparent">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedStudents.size === filteredStudents.length &&
                        filteredStudents.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">
                    Nombre
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">
                    Matrícula
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">
                    Estado
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="text-slate-500 dark:text-slate-400">
                        No hay estudiantes
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => {
                    const currentStatus = studentAttendances.get(student.id);
                    const statusConfig = getStatusConfig(currentStatus);
                    const isSelected = selectedStudents.has(student.id);

                    return (
                      <TableRow
                        key={student.id}
                        className={`border-slate-200 dark:border-slate-700 transition-colors ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/20'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {/* Checkbox */}
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectStudent(student.id)}
                          />
                        </TableCell>

                        {/* Nombre */}
                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                          {student.name}
                        </TableCell>

                        {/* Matrícula */}
                        <TableCell className="text-slate-700 dark:text-slate-300">
                          {student.enrollmentId}
                        </TableCell>

                        {/* Estados - Botones inline */}
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {STATUS_OPTIONS.map((option) => {
                              const Icon = option.icon;
                              const isActive = currentStatus === option.value;

                              return (
                                <button
                                  key={option.value}
                                  onClick={() => handleStatusChange(student.id, option.value)}
                                  disabled={!isSelected}
                                  className={`p-1.5 rounded transition-all ${
                                    isSelected
                                      ? isActive
                                        ? `${option.color} ring-2 ring-blue-500`
                                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                                      : 'bg-slate-50 dark:bg-slate-900 opacity-50 cursor-not-allowed'
                                  }`}
                                  title={option.label}
                                >
                                  <Icon className={`h-4 w-4 ${
                                    isActive ? option.textColor : 'text-slate-400'
                                  }`} />
                                </button>
                              );
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {selectedStudents.size > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedStudents.size} estudiante(s) seleccionado(s)
              </p>
              <div className="flex gap-2 flex-wrap">
                {Array.from(selectedStudents).map((studentId) => {
                  const student = mockStudents.find((s) => s.id === studentId);
                  const status = studentAttendances.get(studentId);
                  const statusConfig = getStatusConfig(status);

                  return (
                    <Badge
                      key={studentId}
                      variant="secondary"
                      className={status ? statusConfig?.color : ''}
                    >
                      {student?.name.split(' ')[0]}
                      {status && ` - ${statusConfig?.label}`}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}