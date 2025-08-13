"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, 
  User, 
  MapPin, 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Calendar,
  Move,
  GripVertical,
  Save,
  RotateCcw,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Schedule, DayOfWeek, ScheduleFormValues } from "@/types/schedules";
import type { User as Teacher } from "@/types/user";
import { useScheduleContext } from "@/context/ScheduleContext";
import { useSectionContext } from "@/context/SectionContext";
import { useCourseContext } from "@/context/CourseContext";
import { useTeacherContext } from "@/context/TeacherContext";

// Tipos para drag and drop personalizado
interface DragItem {
  id: number;
  type: 'course' | 'teacher' | 'schedule';
  name: string;
  data?: any;
}

interface TimeSlot {
  start: string;
  end: string;
  label: string;
}

// Tipos para horarios temporales
interface TempSchedule extends Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'> {
  id: string; // ID temporal como string
  isTemp: true;
  createdAt?: string;
  updatedAt?: string;
}

interface ScheduleChange {
  action: 'create' | 'update' | 'delete';
  schedule: TempSchedule | Schedule;
  originalSchedule?: Schedule; // Para updates y deletes
}

// Configuración de horarios
const TIME_SLOTS: TimeSlot[] = [
  { start: "07:00", end: "07:45", label: "07:00 - 07:45" },
  { start: "07:45", end: "08:30", label: "07:45 - 08:30" },
  { start: "08:30", end: "09:15", label: "08:30 - 09:15" },
  { start: "09:15", end: "10:00", label: "09:15 - 10:00" },
  { start: "10:00", end: "10:15", label: "RECREO" },
  { start: "10:15", end: "11:00", label: "10:15 - 11:00" },
  { start: "11:00", end: "11:45", label: "11:00 - 11:45" },
  { start: "11:45", end: "12:30", label: "11:45 - 12:30" },
  { start: "12:30", end: "13:15", label: "12:30 - 13:15" },
  { start: "13:15", end: "14:00", label: "ALMUERZO" },
  { start: "14:00", end: "14:45", label: "14:00 - 14:45" },
  { start: "14:45", end: "15:30", label: "14:45 - 15:30" },
  { start: "15:30", end: "16:15", label: "15:30 - 16:15" },
  { start: "16:15", end: "17:00", label: "16:15 - 17:00" },
];

const DAYS_OF_WEEK = [
  { value: 1, label: "Lunes", shortLabel: "Lun" },
  { value: 2, label: "Martes", shortLabel: "Mar" },
  { value: 3, label: "Miércoles", shortLabel: "Mié" },
  { value: 4, label: "Jueves", shortLabel: "Jue" },
  { value: 5, label: "Viernes", shortLabel: "Vie" },
  { value: 6, label: "Sábado", shortLabel: "Sáb" },
  { value: 7, label: "Domingo", shortLabel: "Dom" },
];

interface ScheduleCalendarViewProps {
  selectedSectionId?: number;
  onScheduleClick?: (schedule: Schedule) => void;
  onCreateSchedule?: (data: Partial<ScheduleFormValues>) => void;
  onUpdateSchedule?: (id: number, data: Partial<ScheduleFormValues>) => void;
  onDeleteSchedule?: (id: number) => void;
  onBatchSave?: (changes: ScheduleChange[]) => Promise<void>;
}

// Estado global para drag & drop
let dragState: {
  isDragging: boolean;
  dragItem: DragItem | null;
  dragElement: HTMLElement | null;
  startPosition: { x: number; y: number };
} = {
  isDragging: false,
  dragItem: null,
  dragElement: null,
  startPosition: { x: 0, y: 0 }
};

// Componente draggable para cursos
function DraggableCourse({ course, isUsed }: { course: any; isUsed: boolean }) {
  const elementRef = useRef<HTMLDivElement>(null);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Los cursos siempre están disponibles - removemos la restricción
    e.preventDefault();
    const element = elementRef.current;
    if (!element) return;

    dragState.isDragging = true;
    dragState.dragItem = {
      id: course.id,
      type: 'course',
      name: course.name,
      data: course,
    };
    dragState.dragElement = element;
    dragState.startPosition = { x: e.clientX, y: e.clientY };
    
    element.style.opacity = '0.5';
    element.style.transform = 'rotate(3deg) scale(1.05)';
    element.style.zIndex = '1000';
    element.style.pointerEvents = 'none';
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [course]); // Removemos isUsed de las dependencias

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.dragElement) return;
    
    const deltaX = e.clientX - dragState.startPosition.x;
    const deltaY = e.clientY - dragState.startPosition.y;
    
    dragState.dragElement.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(3deg) scale(1.05)`;
  }, []);

  const handleMouseUp = useCallback(() => {
    if (dragState.dragElement) {
      dragState.dragElement.style.opacity = '';
      dragState.dragElement.style.transform = '';
      dragState.dragElement.style.zIndex = '';
      dragState.dragElement.style.pointerEvents = '';
    }
    
    dragState.isDragging = false;
    dragState.dragItem = null;
    dragState.dragElement = null;
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div
      ref={elementRef}
      className={cn(
        "p-3 rounded-lg border-2 border-dashed transition-all select-none cursor-grab active:cursor-grabbing",
        "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
      )}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        <span className="text-sm font-medium">{course.name}</span>
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <div className="mt-1 text-xs text-gray-600">
        Arrastra para programar
      </div>
    </div>
  );
}

// Componente draggable para profesores
function DraggableTeacher({ teacher, assignedHours }: { teacher: Teacher; assignedHours: number }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const maxHours = 40;
  const percentage = (assignedHours / maxHours) * 100;
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const element = elementRef.current;
    if (!element) return;

    dragState.isDragging = true;
    dragState.dragItem = {
      id: teacher.id,
      type: 'teacher',
      name: `${teacher.givenNames} ${teacher.lastNames}`,
      data: teacher,
    };
    dragState.dragElement = element;
    dragState.startPosition = { x: e.clientX, y: e.clientY };
    
    element.style.opacity = '0.5';
    element.style.transform = 'rotate(3deg) scale(1.05)';
    element.style.zIndex = '1000';
    element.style.pointerEvents = 'none';
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [teacher]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.dragElement) return;
    
    const deltaX = e.clientX - dragState.startPosition.x;
    const deltaY = e.clientY - dragState.startPosition.y;
    
    dragState.dragElement.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(3deg) scale(1.05)`;
  }, []);

  const handleMouseUp = useCallback(() => {
    if (dragState.dragElement) {
      dragState.dragElement.style.opacity = '';
      dragState.dragElement.style.transform = '';
      dragState.dragElement.style.zIndex = '';
      dragState.dragElement.style.pointerEvents = '';
    }
    
    dragState.isDragging = false;
    dragState.dragItem = null;
    dragState.dragElement = null;
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, []);
  
  return (
    <div
      ref={elementRef}
      className={cn(
        "p-3 rounded-lg border-2 border-dashed transition-all cursor-grab active:cursor-grabbing select-none",
        percentage > 90 
          ? "border-red-300 bg-red-50 text-red-700"
          : percentage > 70
            ? "border-yellow-300 bg-yellow-50 text-yellow-700"
            : "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
      )}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <div className="flex-1">
          <div className="text-sm font-medium">
            {teacher.givenNames} {teacher.lastNames}
          </div>
          {teacher.teacherDetails?.academicDegree && (
            <div className="text-xs text-gray-500">
              {teacher.teacherDetails.academicDegree}
            </div>
          )}
        </div>
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
          <div 
            className={cn(
              "h-1.5 rounded-full transition-all",
              percentage > 90 ? "bg-red-500" : percentage > 70 ? "bg-yellow-500" : "bg-blue-500"
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span className="text-xs font-medium">
          {assignedHours}h/{maxHours}h
        </span>
      </div>
    </div>
  );
}

// Componente de horario draggable
function DraggableSchedule({ 
  schedule, 
  onEdit, 
  onDelete,
  isTemp = false
}: { 
  schedule: Schedule | TempSchedule; 
  onEdit: (schedule: Schedule | TempSchedule) => void;
  onDelete: (id: string | number) => void;
  isTemp?: boolean;
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const element = elementRef.current;
    if (!element) return;

    dragState.isDragging = true;
    dragState.dragItem = {
      id: typeof schedule.id === 'string' ? parseInt(schedule.id) || 0 : schedule.id,
      type: 'schedule',
      name: schedule.course?.name || "Sin curso",
      data: schedule,
    };
    dragState.dragElement = element;
    dragState.startPosition = { x: e.clientX, y: e.clientY };
    
    element.style.opacity = '0.5';
    element.style.transform = 'scale(0.95)';
    element.style.zIndex = '1000';
    element.style.pointerEvents = 'none';
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [schedule]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.dragElement) return;
    
    const deltaX = e.clientX - dragState.startPosition.x;
    const deltaY = e.clientY - dragState.startPosition.y;
    
    dragState.dragElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.95)`;
  }, []);

  const handleMouseUp = useCallback(() => {
    if (dragState.dragElement) {
      dragState.dragElement.style.opacity = '';
      dragState.dragElement.style.transform = '';
      dragState.dragElement.style.zIndex = '';
      dragState.dragElement.style.pointerEvents = '';
    }
    
    dragState.isDragging = false;
    dragState.dragItem = null;
    dragState.dragElement = null;
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div
      ref={elementRef}
      className={cn(
        "p-2 rounded-md border transition-all group cursor-grab active:cursor-grabbing bg-white hover:shadow-md select-none",
        isTemp 
          ? "border-orange-200 bg-orange-50" 
          : "border-blue-200"
      )}
      onMouseDown={handleMouseDown}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-xs font-medium truncate",
            isTemp ? "text-orange-700" : "text-blue-700"
          )}>
            {schedule.course?.name}
            {isTemp && (
              <Badge variant="secondary" className="ml-1 text-xs">
                Pendiente
              </Badge>
            )}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-6 w-6 p-0",
                isTemp ? "hover:bg-orange-100" : "hover:bg-blue-100"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(schedule);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-red-100"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(schedule.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {schedule.teacher && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <User className="h-3 w-3" />
            <span className="truncate">{schedule.teacher.name}</span>
          </div>
        )}
        
        {schedule.classroom && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{schedule.classroom}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{schedule.startTime} - {schedule.endTime}</span>
        </div>
      </div>
    </div>
  );
}

// Celda droppable del horario
function DroppableTimeSlot({ 
  day, 
  timeSlot, 
  schedules, 
  onDrop, 
  onScheduleEdit, 
  onScheduleDelete 
}: {
  day: DayOfWeek;
  timeSlot: TimeSlot;
  schedules: (Schedule | TempSchedule)[];
  onDrop: (item: DragItem, day: DayOfWeek, timeSlot: TimeSlot) => void;
  onScheduleEdit: (schedule: Schedule | TempSchedule) => void;
  onScheduleDelete: (id: string | number) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const isRecreation = timeSlot.label.includes("RECREO") || timeSlot.label.includes("ALMUERZO");

  const handleMouseEnter = useCallback(() => {
    if (dragState.isDragging && !isRecreation) {
      setIsHovered(true);
    }
  }, [isRecreation]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging && dragState.dragItem && isHovered && !isRecreation) {
      onDrop(dragState.dragItem, day, timeSlot);
      setIsHovered(false);
    }
  }, [day, timeSlot, isHovered, isRecreation, onDrop]);
  
  return (
    <div
      ref={dropRef}
      className={cn(
        "min-h-[80px] p-2 border transition-all",
        isRecreation && "bg-gray-100 border-gray-300",
        !isRecreation && isHovered && "bg-blue-50 border-blue-300 border-dashed",
        !isRecreation && !isHovered && "bg-gray-50 border-gray-200 hover:bg-white"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
    >
      {isRecreation ? (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm font-medium">
          {timeSlot.label}
        </div>
      ) : (
        <div className="space-y-1">
          {schedules.map((schedule) => (
            <DraggableSchedule
              key={schedule.id}
              schedule={schedule}
              onEdit={onScheduleEdit}
              onDelete={onScheduleDelete}
              isTemp={'isTemp' in schedule && schedule.isTemp}
            />
          ))}
          
          {schedules.length === 0 && isHovered && (
            <div className="flex items-center justify-center h-12 text-blue-500 text-sm">
              <Plus className="h-4 w-4 mr-1" />
              Soltar aquí
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ScheduleCalendarView({
  selectedSectionId,
  onScheduleClick,
  onCreateSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onBatchSave,
}: ScheduleCalendarViewProps) {
  const [selectedSection, setSelectedSection] = useState<number>(selectedSectionId || 0);
  const [tempSchedules, setTempSchedules] = useState<TempSchedule[]>([]);
  const [pendingChanges, setPendingChanges] = useState<ScheduleChange[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const { schedules, fetchSchedules } = useScheduleContext();
  const { sections, isLoadingSections: sectionsLoading } = useSectionContext();
  const { courses, isLoadingCourses: coursesLoading } = useCourseContext();
  const { teachers, isLoading: teachersLoading } = useTeacherContext();

  // Combinar horarios reales y temporales
  const allSchedules = useMemo(() => {
    const realSchedules = schedules?.filter(schedule => schedule.sectionId === selectedSection) || [];
    const sectionTempSchedules = tempSchedules.filter(schedule => schedule.sectionId === selectedSection);
    return [...realSchedules, ...sectionTempSchedules];
  }, [schedules, selectedSection, tempSchedules]);

  // Organizar horarios por día y horario
  const scheduleGrid = useMemo(() => {
    const grid: { [key: string]: (Schedule | TempSchedule)[] } = {};
    
    allSchedules.forEach((schedule) => {
      const key = `${schedule.dayOfWeek}-${schedule.startTime}`;
      if (!grid[key]) {
        grid[key] = [];
      }
      grid[key].push(schedule);
    });
    
    return grid;
  }, [allSchedules]);

  // Cursos usados en esta sección
  const usedCourseIds = useMemo(() => {
    return new Set(allSchedules.map(s => s.courseId).filter(Boolean));
  }, [allSchedules]);

  // Calcular horas asignadas por profesor
  const teacherHours = useMemo(() => {
    const hours: { [key: number]: number } = {};
    
    allSchedules.forEach((schedule) => {
      if (schedule.teacherId) {
        const startTime = new Date(`2000-01-01T${schedule.startTime}:00`);
        const endTime = new Date(`2000-01-01T${schedule.endTime}:00`);
        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        
        hours[schedule.teacherId] = (hours[schedule.teacherId] || 0) + duration;
      }
    });
    
    return hours;
  }, [allSchedules]);

  // Generar ID temporal único
  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Manejar drop de elementos
  const handleDrop = useCallback((item: DragItem, day: DayOfWeek, timeSlot: TimeSlot) => {
    if (!selectedSection || timeSlot.label.includes("RECREO") || timeSlot.label.includes("ALMUERZO")) {
      return;
    }

    if (item.type === 'course') {
      // Crear horario temporal para curso
      const tempSchedule: TempSchedule = {
        id: generateTempId(),
        sectionId: selectedSection,
        courseId: item.id,
        teacherId: undefined,
        dayOfWeek: day,
        startTime: timeSlot.start,
        endTime: timeSlot.end,
        classroom: undefined,
        course: item.data,
        teacher: undefined,
        section: sections?.find(s => s.id === selectedSection),
        isTemp: true,
      };
      
      setTempSchedules(prev => [...prev, tempSchedule]);
      
      // Agregar a cambios pendientes
      setPendingChanges(prev => [...prev, {
        action: 'create',
        schedule: tempSchedule
      }]);
      
    } else if (item.type === 'teacher') {
      // Crear horario temporal para profesor
      const tempSchedule: TempSchedule = {
        id: generateTempId(),
        sectionId: selectedSection,
        courseId: undefined,
        teacherId: item.id,
        dayOfWeek: day,
        startTime: timeSlot.start,
        endTime: timeSlot.end,
        classroom: undefined,
        course: undefined,
        teacher: { name: item.name, ...item.data },
        section: sections?.find(s => s.id === selectedSection),
        isTemp: true,
      };
      
      setTempSchedules(prev => [...prev, tempSchedule]);
      
      // Agregar a cambios pendientes
      setPendingChanges(prev => [...prev, {
        action: 'create',
        schedule: tempSchedule
      }]);
      
    } else if (item.type === 'schedule') {
      // Mover horario existente
      const existingSchedule = item.data as Schedule | TempSchedule;
      
      if ('isTemp' in existingSchedule && existingSchedule.isTemp) {
        // Es un horario temporal, solo actualizarlo
        const updatedSchedule: TempSchedule = {
          ...existingSchedule,
          dayOfWeek: day,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
        };
        
        setTempSchedules(prev => 
          prev.map(s => s.id === existingSchedule.id ? updatedSchedule : s)
        );
        
        // Actualizar en cambios pendientes
        setPendingChanges(prev => 
          prev.map(change => 
            change.schedule.id === existingSchedule.id 
              ? { ...change, schedule: updatedSchedule }
              : change
          )
        );
      } else {
        // Es un horario real, crear un cambio de actualización
        const updatedSchedule = {
          ...existingSchedule,
          dayOfWeek: day,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
        } as Schedule;
        
        setPendingChanges(prev => {
          const existingChangeIndex = prev.findIndex(
            change => change.schedule.id === existingSchedule.id && change.action === 'update'
          );
          
          if (existingChangeIndex >= 0) {
            // Actualizar cambio existente
            const newChanges = [...prev];
            newChanges[existingChangeIndex] = {
              action: 'update',
              schedule: updatedSchedule,
              originalSchedule: existingSchedule as Schedule
            };
            return newChanges;
          } else {
            // Nuevo cambio de actualización
            return [...prev, {
              action: 'update',
              schedule: updatedSchedule,
              originalSchedule: existingSchedule as Schedule
            }];
          }
        });
      }
    }
  }, [selectedSection, sections]);

  // Manejar eliminación de horarios
  const handleScheduleDelete = useCallback((id: string | number) => {
    if (typeof id === 'string') {
      // Es un horario temporal
      setTempSchedules(prev => prev.filter(s => s.id !== id));
      setPendingChanges(prev => prev.filter(change => change.schedule.id !== id));
    } else {
      // Es un horario real
      const schedule = schedules?.find(s => s.id === id);
      if (schedule) {
        setPendingChanges(prev => [...prev, {
          action: 'delete',
          schedule: schedule,
          originalSchedule: schedule
        }]);
      }
    }
  }, [schedules]);

  // Guardar todos los cambios
  const handleSaveAll = useCallback(async () => {
    if (pendingChanges.length === 0 && tempSchedules.length === 0) return;

    setIsSaving(true);
    try {
      if (onBatchSave) {
        await onBatchSave(pendingChanges);
      } else {
        // Fallback: usar las funciones individuales
        for (const change of pendingChanges) {
          switch (change.action) {
            case 'create':
              if (onCreateSchedule) {
                const scheduleData = {
                  sectionId: change.schedule.sectionId,
                  courseId: change.schedule.courseId,
                  teacherId: change.schedule.teacherId,
                  dayOfWeek: change.schedule.dayOfWeek,
                  startTime: change.schedule.startTime,
                  endTime: change.schedule.endTime,
                  classroom: change.schedule.classroom,
                };
                await onCreateSchedule(scheduleData);
              }
              break;
            case 'update':
              if (onUpdateSchedule && typeof change.schedule.id === 'number') {
                const scheduleData = {
                  sectionId: change.schedule.sectionId,
                  courseId: change.schedule.courseId,
                  teacherId: change.schedule.teacherId,
                  dayOfWeek: change.schedule.dayOfWeek,
                  startTime: change.schedule.startTime,
                  endTime: change.schedule.endTime,
                  classroom: change.schedule.classroom,
                };
                await onUpdateSchedule(change.schedule.id, scheduleData);
              }
              break;
            case 'delete':
              if (onDeleteSchedule && typeof change.schedule.id === 'number') {
                await onDeleteSchedule(change.schedule.id);
              }
              break;
          }
        }
      }

      // Limpiar estados después del guardado exitoso
      setTempSchedules([]);
      setPendingChanges([]);
      
      // Refrescar datos
      if (fetchSchedules) {
        await fetchSchedules();
      }
      
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      // Aquí podrías mostrar un toast de error
    } finally {
      setIsSaving(false);
    }
  }, [pendingChanges, tempSchedules, onBatchSave, onCreateSchedule, onUpdateSchedule, onDeleteSchedule, fetchSchedules]);

  // Descartar cambios
  const handleDiscardChanges = useCallback(() => {
    setTempSchedules([]);
    setPendingChanges([]);
  }, []);

  // Limpiar cambios al cambiar de sección
  const handleSectionChange = useCallback((value: string) => {
    if (pendingChanges.length > 0 || tempSchedules.length > 0) {
      if (confirm('Tienes cambios sin guardar. ¿Deseas descartarlos y cambiar de sección?')) {
        handleDiscardChanges();
        setSelectedSection(parseInt(value));
      }
    } else {
      setSelectedSection(parseInt(value));
    }
  }, [pendingChanges, tempSchedules, handleDiscardChanges]);

  const hasUnsavedChanges = pendingChanges.length > 0 || tempSchedules.length > 0;

  if (sectionsLoading || coursesLoading || teachersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con selector de sección y controles de guardado */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Horario Académico
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <Select
                value={selectedSection.toString()}
                onValueChange={handleSectionChange}
              >
                <SelectTrigger className="w-64 bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="Seleccionar sección" />
                </SelectTrigger>
                <SelectContent>
                  {sections?.map((section) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {section.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedSection && (
                <div className="flex gap-2">
                  <Badge variant="outline" className="flex items-center gap-2">
                    <span>{allSchedules.length} horarios programados</span>
                  </Badge>
                  
                  {hasUnsavedChanges && (
                    <Badge variant="secondary" className="flex items-center gap-2 text-orange-700 bg-orange-100">
                      <AlertCircle className="h-3 w-3" />
                      <span>{pendingChanges.length + tempSchedules.length} cambios pendientes</span>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Controles de guardado */}
            {hasUnsavedChanges && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDiscardChanges}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Descartar
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaving ? 'Guardando...' : 'Guardar Todo'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panel lateral con cursos y profesores */}
        <div className="space-y-4">
          {/* Cursos disponibles */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Cursos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {courses?.map((course) => (
                    <DraggableCourse
                      key={course.id}
                      course={course}
                      isUsed={false} // Siempre disponibles
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Profesores disponibles */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Profesores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {teachers?.map((teacher) => (
                    <DraggableTeacher
                      key={teacher.id}
                      teacher={teacher}
                      assignedHours={teacherHours[teacher.id] || 0}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Resumen de cambios pendientes */}
          {hasUnsavedChanges && (
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                  <AlertCircle className="h-5 w-5" />
                  Cambios Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {pendingChanges.filter(c => c.action === 'create').length + tempSchedules.length > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Nuevos horarios:</span>
                      <Badge variant="secondary" className="bg-green-100">
                        {pendingChanges.filter(c => c.action === 'create').length + tempSchedules.length}
                      </Badge>
                    </div>
                  )}
                  
                  {pendingChanges.filter(c => c.action === 'update').length > 0 && (
                    <div className="flex justify-between text-blue-700">
                      <span>Modificaciones:</span>
                      <Badge variant="secondary" className="bg-blue-100">
                        {pendingChanges.filter(c => c.action === 'update').length}
                      </Badge>
                    </div>
                  )}
                  
                  {pendingChanges.filter(c => c.action === 'delete').length > 0 && (
                    <div className="flex justify-between text-red-700">
                      <span>Eliminaciones:</span>
                      <Badge variant="secondary" className="bg-red-100">
                        {pendingChanges.filter(c => c.action === 'delete').length}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Calendario principal */}
        <div className="lg:col-span-3">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header de días */}
                  <div className="grid grid-cols-6 border-b">
                    <div className="p-4 font-semibold text-gray-700 bg-gray-50 border-r">
                      Horario
                    </div>
                    {DAYS_OF_WEEK.slice(0, 5).map((day) => (
                      <div
                        key={day.value}
                        className="p-4 font-semibold text-center text-gray-700 bg-gray-50 border-r last:border-r-0"
                      >
                        <div>{day.shortLabel}</div>
                        <div className="text-xs font-normal text-gray-500">
                          {day.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Filas de horarios */}
                  {TIME_SLOTS.map((timeSlot) => (
                    <div key={timeSlot.start} className="grid grid-cols-6 border-b last:border-b-0">
                      <div className="p-4 text-sm font-medium text-gray-600 bg-gray-50 border-r flex items-center">
                        {timeSlot.label}
                      </div>
                      {DAYS_OF_WEEK.slice(0, 5).map((day) => {
                        const key = `${day.value}-${timeSlot.start}`;
                        let daySchedules = scheduleGrid[key] || [];
                        
                        // Filtrar horarios eliminados de la vista
                        daySchedules = daySchedules.filter(schedule => {
                          const deleteChange = pendingChanges.find(
                            change => change.action === 'delete' && change.schedule.id === schedule.id
                          );
                          return !deleteChange;
                        });
                        
                        // Aplicar cambios de actualización visualmente
                        daySchedules = daySchedules.map(schedule => {
                          const updateChange = pendingChanges.find(
                            change => change.action === 'update' && change.schedule.id === schedule.id
                          );
                          if (updateChange && updateChange.schedule.dayOfWeek === day.value && 
                              updateChange.schedule.startTime === timeSlot.start) {
                            return updateChange.schedule as Schedule;
                          }
                          return schedule;
                        });
                        
                        return (
                          <DroppableTimeSlot
                            key={`${day.value}-${timeSlot.start}`}
                            day={day.value as DayOfWeek}
                            timeSlot={timeSlot}
                            schedules={daySchedules}
                            onDrop={handleDrop}
                            onScheduleEdit={(schedule) => onScheduleClick?.(schedule as Schedule)}
                            onScheduleDelete={handleScheduleDelete}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}