# Sections Module - Complete Frontend Integration Guide

## 📋 Table of Contents
- [Overview](#overview)
- [File Structure](#file-structure)
- [TypeScript Types](#typescript-types)
- [Service Layer](#service-layer)
- [Components Architecture](#components-architecture)
- [State Management](#state-management)
- [Validation Schemas](#validation-schemas)
- [API Integration Examples](#api-integration-examples)
- [UI Components Guide](#ui-components-guide)
- [Error Handling Patterns](#error-handling-patterns)
- [Testing Strategies](#testing-strategies)
- [Best Practices](#best-practices)

---

## Overview

The Sections module manages sections (classrooms/groups) within the school system. Each section belongs to a grade and can have a teacher assigned to it. Sections have capacity limits and track enrollments.

**Base URL:** `/api/sections`

**Key Features:**
- ✅ CRUD operations for sections
- ✅ Teacher assignment/removal
- ✅ Capacity management with validation
- ✅ Statistics and utilization tracking
- ✅ Grade-based filtering
- ✅ Pagination and search
- ✅ Real-time availability updates

---

## File Structure

```
src/
├── components/
│   └── features/
│       └── sections/
│           ├── SectionForm.tsx              # Formulario de creación/edición
│           ├── SectionFormDialog.tsx        # Dialog wrapper del formulario
│           ├── SectionsGrid.tsx             # Vista de cuadrícula de secciones
│           ├── SectionCard.tsx              # Tarjeta individual de sección
│           ├── SectionFilters.tsx           # Componente de filtros
│           ├── SectionStats.tsx             # Estadísticas de sección
│           ├── SectionStatsDialog.tsx       # Dialog de estadísticas detalladas
│           ├── SectionDetailDialog.tsx      # Dialog de detalles de sección
│           ├── AssignTeacherDialog.tsx      # Dialog para asignar profesor
│           └── DeleteSectionDialog.tsx      # Dialog de confirmación de eliminación
├── services/
│   └── sections.service.ts                  # Servicio API de secciones
├── types/
│   └── sections.types.ts                    # Definiciones de tipos TypeScript
├── schemas/
│   └── section.ts                           # Esquemas de validación Zod
└── hooks/
    └── useSections.ts                       # Custom hook para secciones (opcional)
```

---

## TypeScript Types

### Core Types (`src/types/sections.types.ts`)

```typescript
// src/types/sections.types.ts

/**
 * 🏫 Types for Sections Module
 */

// ============================================================================
// Core Section Interface
// ============================================================================

export interface Section {
  id: number;
  name: string;
  capacity: number;
  gradeId: number;
  teacherId: number | null;
  grade?: {
    id: number;
    name: string;
    level: string;
    order: number;
  };
  teacher?: {
    id: number;
    givenNames: string;
    lastNames: string;
    email: string | null;
  };
  _count?: {
    enrollments: number;
    courseAssignments: number;
    schedules: number;
  };
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface CreateSectionDto {
  name: string;           // Required, 1-100 characters
  capacity: number;       // Required, 1-100
  gradeId: number;        // Required, must exist
  teacherId?: number | null;  // Optional
}

export interface UpdateSectionDto {
  name?: string;          // Optional, 1-100 characters
  capacity?: number;      // Optional, 1-100
  gradeId?: number;       // Optional, must exist
  teacherId?: number | null;  // Optional
}

export interface AssignTeacherDto {
  teacherId: number;
}

// ============================================================================
// Query & Filters
// ============================================================================

export interface SectionFilters {
  gradeId?: number;
  teacherId?: number;
  minCapacity?: number;
  maxCapacity?: number;
  hasTeacher?: boolean;
  search?: string;
}

export interface QuerySectionsDto extends SectionFilters {
  page?: number;          // Default: 1
  limit?: number;         // Default: 10, max: 100
  sortBy?: 'name' | 'capacity' | 'createdAt';  // Default: 'name'
  sortOrder?: 'asc' | 'desc';  // Default: 'asc'
}

// ============================================================================
// Pagination Response
// ============================================================================

export interface PaginatedSectionsResponse {
  data: Section[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================================
// Statistics
// ============================================================================

export interface SectionStats {
  id: number;
  name: string;
  capacity: number;
  currentEnrollments: number;
  availableSpots: number;
  utilizationPercentage: number;
  totalCourseAssignments: number;
  totalSchedules: number;
  hasTeacher: boolean;
  teacher?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
  grade: {
    id: number;
    name: string;
    level: string;
  };
}

// ============================================================================
// UI State Types
// ============================================================================

export type SectionSortBy = 'name' | 'capacity' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

// ============================================================================
// Validation Constants
// ============================================================================

export const SECTION_CONSTRAINTS = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  CAPACITY_MIN: 1,
  CAPACITY_MAX: 100,
} as const;

// ============================================================================
// Helper Types
// ============================================================================

export interface SectionWithUtilization extends Section {
  utilizationPercentage: number;
  availableSpots: number;
}
```

---

## Service Layer

### Sections Service (`src/services/sections.service.ts`)

```typescript
// src/services/sections.service.ts

/**
 * 🏫 Sections Service
 * 
 * Servicio para gestión de secciones (aulas/grupos)
 * Endpoints: /api/sections
 */

import { api } from '@/config/api';
import type {
  Section,
  CreateSectionDto,
  UpdateSectionDto,
  QuerySectionsDto,
  PaginatedSectionsResponse,
  SectionStats,
} from '@/types/sections.types';

const BASE_URL = '/sections';

export const sectionsService = {
  /**
   * Get all sections with pagination and filters
   */
  getAll: async (params?: QuerySectionsDto): Promise<PaginatedSectionsResponse> => {
    const response = await api.get<{ data: PaginatedSectionsResponse }>(BASE_URL, { params });
    return response.data.data;
  },

  /**
   * Get sections by grade ID
   */
  getByGrade: async (gradeId: number): Promise<Section[]> => {
    const response = await api.get<{ data: Section[] }>(`${BASE_URL}/grade/${gradeId}`);
    return response.data.data;
  },

  /**
   * Get section by ID
   */
  getById: async (id: number): Promise<Section> => {
    const response = await api.get<{ data: Section }>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  /**
   * Get section statistics
   */
  getStats: async (id: number): Promise<SectionStats> => {
    const response = await api.get<{ data: SectionStats }>(`${BASE_URL}/${id}/stats`);
    return response.data.data;
  },

  /**
   * Create new section
   */
  create: async (data: CreateSectionDto): Promise<Section> => {
    const response = await api.post<{ data: Section }>(BASE_URL, data);
    return response.data.data;
  },

  /**
   * Update existing section
   */
  update: async (id: number, data: UpdateSectionDto): Promise<Section> => {
    const response = await api.patch<{ data: Section }>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete section (only if no dependencies)
   */
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ data: { message: string } }>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  /**
   * Assign teacher to section
   */
  assignTeacher: async (id: number, teacherId: number): Promise<Section> => {
    const response = await api.patch<{ data: Section }>(
      `${BASE_URL}/${id}/assign-teacher`,
      { teacherId }
    );
    return response.data.data;
  },

  /**
   * Remove teacher from section
   */
  removeTeacher: async (id: number): Promise<Section> => {
    const response = await api.patch<{ data: Section }>(`${BASE_URL}/${id}/remove-teacher`);
    return response.data.data;
  },
};

export default sectionsService;
```

---

## Components Architecture

### 1. SectionForm Component

**Purpose:** Formulario reutilizable para crear/editar secciones

**Props:**
```typescript
interface SectionFormProps {
  defaultValues?: Partial<CreateSectionDto>;
  onSubmit: (data: CreateSectionDto | UpdateSectionDto) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  grades?: Array<{ id: number; name: string; level: string }>;
  teachers?: Array<{ id: number; givenNames: string; lastNames: string }>;
  currentEnrollments?: number; // Para validar capacidad en modo edición
}
```

**Key Features:**
- ✅ Validación con Zod schema
- ✅ Muestra warning si la capacidad es menor que las inscripciones actuales
- ✅ Select de grado (requerido)
- ✅ Select de profesor (opcional)
- ✅ Input numérico para capacidad con límites
- ✅ Manejo de estados de carga

**Example Usage:**
```tsx
<SectionForm
  mode="create"
  grades={grades}
  teachers={teachers}
  onSubmit={handleCreate}
  onCancel={() => setIsDialogOpen(false)}
  isLoading={isSubmitting}
/>
```

---

### 2. SectionFormDialog Component

**Purpose:** Wrapper de dialog modal para el formulario

**Props:**
```typescript
interface SectionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSectionDto | UpdateSectionDto) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: Section | null;
  grades: Array<{ id: number; name: string; level: string }>;
  teachers: Array<{ id: number; givenNames: string; lastNames: string }>;
}
```

**Example Usage:**
```tsx
<SectionFormDialog
  isOpen={isFormOpen}
  onClose={() => setIsFormOpen(false)}
  onSubmit={handleSubmit}
  mode={formMode}
  initialData={selectedSection}
  grades={grades}
  teachers={teachers}
/>
```

---

### 3. SectionsGrid Component

**Purpose:** Vista de cuadrícula para mostrar secciones

**Props:**
```typescript
interface SectionsGridProps {
  sections: Section[];
  isLoading?: boolean;
  onEdit?: (section: Section) => void;
  onDelete?: (section: Section) => void;
  onViewStats?: (section: Section) => void;
  onAssignTeacher?: (section: Section) => void;
}
```

**Features:**
- ✅ Layout responsivo (grid)
- ✅ Cards individuales para cada sección
- ✅ Acciones rápidas (editar, eliminar, ver stats)
- ✅ Indicadores visuales de utilización
- ✅ Estados de carga con skeletons

---

### 4. SectionCard Component

**Purpose:** Tarjeta individual de sección

**Props:**
```typescript
interface SectionCardProps {
  section: Section;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewStats?: () => void;
  onAssignTeacher?: () => void;
}
```

**Visual Elements:**
- 📊 Barra de progreso de utilización
- 👨‍🏫 Avatar/nombre del profesor asignado
- 📝 Nombre del grado
- 🔢 Capacidad actual/máxima
- ⚙️ Menú de acciones

**Color Coding:**
```typescript
// Utilization colors
const getUtilizationColor = (percentage: number) => {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 75) return 'bg-yellow-500';
  if (percentage >= 50) return 'bg-blue-500';
  return 'bg-green-500';
};
```

---

### 5. SectionFilters Component

**Purpose:** Componente de filtros para la lista de secciones

**Props:**
```typescript
interface SectionFiltersProps {
  filters: SectionFilters;
  onFiltersChange: (filters: SectionFilters) => void;
  grades: Array<{ id: number; name: string }>;
  teachers: Array<{ id: number; givenNames: string; lastNames: string }>;
}
```

**Filters Available:**
- 🏫 Grade selector
- 👨‍🏫 Teacher selector
- 🔢 Capacity range (min/max)
- ✅ Has teacher (boolean)
- 🔍 Search by name

---

### 6. SectionStats Component

**Purpose:** Componente para mostrar estadísticas de una sección

**Props:**
```typescript
interface SectionStatsProps {
  sectionId: number;
  onClose?: () => void;
}
```

**Displays:**
- 📊 Utilization percentage (circular progress)
- 👥 Current enrollments vs capacity
- 📚 Course assignments count
- 📅 Schedules count
- 👨‍🏫 Teacher information
- 🏫 Grade information

---

### 7. AssignTeacherDialog Component

**Purpose:** Dialog para asignar/cambiar profesor de una sección

**Props:**
```typescript
interface AssignTeacherDialogProps {
  isOpen: boolean;
  onClose: () => void;
  section: Section;
  teachers: Array<{ id: number; givenNames: string; lastNames: string }>;
  onAssign: (sectionId: number, teacherId: number) => Promise<void>;
}
```

**Features:**
- 🔍 Searchable teacher list
- 📝 Shows current teacher (if any)
- ✅ Confirmation before assignment
- 🚫 Option to remove current teacher

---

### 8. DeleteSectionDialog Component

**Purpose:** Dialog de confirmación para eliminar sección

**Props:**
```typescript
interface DeleteSectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  section: Section | null;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}
```

**Safety Features:**
- ⚠️ Shows dependencies count
- 📋 Lists what would be affected
- ❌ Prevents deletion if dependencies exist
- 💡 Suggests alternatives (deactivation)

---

## Validation Schemas

### Section Schema (`src/schemas/section.ts`)

```typescript
// src/schemas/section.ts

import { z } from 'zod';
import { SECTION_CONSTRAINTS } from '@/types/sections.types';

export const createSectionSchema = z.object({
  name: z
    .string()
    .min(SECTION_CONSTRAINTS.NAME_MIN_LENGTH, 'El nombre es requerido')
    .max(SECTION_CONSTRAINTS.NAME_MAX_LENGTH, `Máximo ${SECTION_CONSTRAINTS.NAME_MAX_LENGTH} caracteres`)
    .trim(),
  
  capacity: z
    .number()
    .int('La capacidad debe ser un número entero')
    .min(SECTION_CONSTRAINTS.CAPACITY_MIN, `La capacidad mínima es ${SECTION_CONSTRAINTS.CAPACITY_MIN}`)
    .max(SECTION_CONSTRAINTS.CAPACITY_MAX, `La capacidad máxima es ${SECTION_CONSTRAINTS.CAPACITY_MAX}`),
  
  gradeId: z
    .string()
    .min(1, 'Debe seleccionar un grado'),
  
  teacherId: z
    .string()
    .optional(),
});

export const updateSectionSchema = createSectionSchema.partial();

// Para validar capacidad contra inscripciones actuales
export const validateCapacityChange = (
  newCapacity: number, 
  currentEnrollments: number
): { isValid: boolean; error?: string } => {
  if (newCapacity < currentEnrollments) {
    return {
      isValid: false,
      error: `No puede reducir la capacidad a ${newCapacity} porque hay ${currentEnrollments} estudiantes inscritos`,
    };
  }
  return { isValid: true };
};
```

---

## State Management

### Option 1: Local State with React Query

```typescript
// hooks/useSections.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectionsService } from '@/services/sections.service';
import type { QuerySectionsDto, CreateSectionDto, UpdateSectionDto } from '@/types/sections.types';
import { toast } from 'sonner';

export function useSections(params?: QuerySectionsDto) {
  return useQuery({
    queryKey: ['sections', params],
    queryFn: () => sectionsService.getAll(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSection(id: number) {
  return useQuery({
    queryKey: ['section', id],
    queryFn: () => sectionsService.getById(id),
    enabled: !!id,
  });
}

export function useSectionStats(id: number) {
  return useQuery({
    queryKey: ['section-stats', id],
    queryFn: () => sectionsService.getStats(id),
    enabled: !!id,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSectionDto) => sectionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Sección creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear la sección');
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSectionDto }) =>
      sectionsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['section', variables.id] });
      toast.success('Sección actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la sección');
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => sectionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Sección eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar la sección');
    },
  });
}

export function useAssignTeacher() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sectionId, teacherId }: { sectionId: number; teacherId: number }) =>
      sectionsService.assignTeacher(sectionId, teacherId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['section', variables.sectionId] });
      toast.success('Profesor asignado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al asignar profesor');
    },
  });
}

export function useRemoveTeacher() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sectionId: number) => sectionsService.removeTeacher(sectionId),
    onSuccess: (_, sectionId) => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['section', sectionId] });
      toast.success('Profesor removido exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al remover profesor');
    },
  });
}
```

---

### Option 2: Context API Pattern

```typescript
// context/SectionsContext.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import { sectionsService } from '@/services/sections.service';
import type { Section, QuerySectionsDto, CreateSectionDto, UpdateSectionDto } from '@/types/sections.types';
import { toast } from 'sonner';

interface SectionsContextValue {
  sections: Section[];
  isLoading: boolean;
  error: string | null;
  filters: QuerySectionsDto;
  totalPages: number;
  currentPage: number;
  
  fetchSections: (params?: QuerySectionsDto) => Promise<void>;
  createSection: (data: CreateSectionDto) => Promise<Section | null>;
  updateSection: (id: number, data: UpdateSectionDto) => Promise<Section | null>;
  deleteSection: (id: number) => Promise<boolean>;
  assignTeacher: (sectionId: number, teacherId: number) => Promise<boolean>;
  removeTeacher: (sectionId: number) => Promise<boolean>;
  setFilters: (filters: QuerySectionsDto) => void;
  setPage: (page: number) => void;
}

const SectionsContext = createContext<SectionsContextValue | undefined>(undefined);

export function SectionsProvider({ children }: { children: React.ReactNode }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<QuerySectionsDto>({ page: 1, limit: 10 });
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSections = useCallback(async (params?: QuerySectionsDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sectionsService.getAll(params || filters);
      setSections(response.data);
      setTotalPages(response.meta.totalPages);
      setCurrentPage(response.meta.page);
    } catch (err: any) {
      setError(err.message);
      toast.error('Error al cargar secciones');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const createSection = useCallback(async (data: CreateSectionDto): Promise<Section | null> => {
    try {
      const newSection = await sectionsService.create(data);
      await fetchSections();
      toast.success('Sección creada exitosamente');
      return newSection;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear sección');
      return null;
    }
  }, [fetchSections]);

  const updateSection = useCallback(async (id: number, data: UpdateSectionDto): Promise<Section | null> => {
    try {
      const updated = await sectionsService.update(id, data);
      await fetchSections();
      toast.success('Sección actualizada exitosamente');
      return updated;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar sección');
      return null;
    }
  }, [fetchSections]);

  const deleteSection = useCallback(async (id: number): Promise<boolean> => {
    try {
      await sectionsService.delete(id);
      await fetchSections();
      toast.success('Sección eliminada exitosamente');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar sección');
      return false;
    }
  }, [fetchSections]);

  const assignTeacher = useCallback(async (sectionId: number, teacherId: number): Promise<boolean> => {
    try {
      await sectionsService.assignTeacher(sectionId, teacherId);
      await fetchSections();
      toast.success('Profesor asignado exitosamente');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al asignar profesor');
      return false;
    }
  }, [fetchSections]);

  const removeTeacher = useCallback(async (sectionId: number): Promise<boolean> => {
    try {
      await sectionsService.removeTeacher(sectionId);
      await fetchSections();
      toast.success('Profesor removido exitosamente');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al remover profesor');
      return false;
    }
  }, [fetchSections]);

  const setPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
    fetchSections({ ...filters, page });
  }, [filters, fetchSections]);

  return (
    <SectionsContext.Provider
      value={{
        sections,
        isLoading,
        error,
        filters,
        totalPages,
        currentPage,
        fetchSections,
        createSection,
        updateSection,
        deleteSection,
        assignTeacher,
        removeTeacher,
        setFilters,
        setPage,
      }}
    >
      {children}
    </SectionsContext.Provider>
  );
}

export function useSectionsContext() {
  const context = useContext(SectionsContext);
  if (!context) {
    throw new Error('useSectionsContext must be used within SectionsProvider');
  }
  return context;
}
```

---

## API Integration Examples

### Complete Page Component Example

```typescript
// app/(admin)/sections/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionsGrid } from '@/components/features/sections/SectionsGrid';
import { SectionFilters } from '@/components/features/sections/SectionFilters';
import { SectionFormDialog } from '@/components/features/sections/SectionFormDialog';
import { DeleteSectionDialog } from '@/components/features/sections/DeleteSectionDialog';
import { AssignTeacherDialog } from '@/components/features/sections/AssignTeacherDialog';
import { sectionsService } from '@/services/sections.service';
import { gradesService } from '@/services/grades.service';
import { usersService } from '@/services/users.service';
import type { Section, SectionFilters as Filters, CreateSectionDto, UpdateSectionDto } from '@/types/sections.types';
import { toast } from 'sonner';

export default function SectionsPage() {
  // State
  const [sections, setSections] = useState<Section[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssignTeacherOpen, setIsAssignTeacherOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load sections when filters change
  useEffect(() => {
    loadSections();
  }, [filters, page]);

  const loadInitialData = async () => {
    try {
      const [gradesData, teachersData] = await Promise.all([
        gradesService.getAll(),
        usersService.getTeachers(),
      ]);
      setGrades(gradesData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Error al cargar datos iniciales');
    }
  };

  const loadSections = async () => {
    setIsLoading(true);
    try {
      const response = await sectionsService.getAll({ ...filters, page, limit: 12 });
      setSections(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Error loading sections:', error);
      toast.error('Error al cargar secciones');
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers
  const handleCreate = () => {
    setFormMode('create');
    setSelectedSection(null);
    setIsFormOpen(true);
  };

  const handleEdit = (section: Section) => {
    setFormMode('edit');
    setSelectedSection(section);
    setIsFormOpen(true);
  };

  const handleDelete = (section: Section) => {
    setSelectedSection(section);
    setIsDeleteOpen(true);
  };

  const handleAssignTeacher = (section: Section) => {
    setSelectedSection(section);
    setIsAssignTeacherOpen(true);
  };

  const handleFormSubmit = async (data: CreateSectionDto | UpdateSectionDto) => {
    try {
      if (formMode === 'create') {
        await sectionsService.create(data as CreateSectionDto);
        toast.success('Sección creada exitosamente');
      } else if (selectedSection) {
        await sectionsService.update(selectedSection.id, data);
        toast.success('Sección actualizada exitosamente');
      }
      setIsFormOpen(false);
      setSelectedSection(null);
      await loadSections();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar sección');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSection) return;
    
    try {
      await sectionsService.delete(selectedSection.id);
      toast.success('Sección eliminada exitosamente');
      setIsDeleteOpen(false);
      setSelectedSection(null);
      await loadSections();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar sección');
    }
  };

  const handleAssignTeacherSubmit = async (teacherId: number) => {
    if (!selectedSection) return;
    
    try {
      await sectionsService.assignTeacher(selectedSection.id, teacherId);
      toast.success('Profesor asignado exitosamente');
      setIsAssignTeacherOpen(false);
      setSelectedSection(null);
      await loadSections();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al asignar profesor');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Secciones</h1>
          <p className="text-muted-foreground">
            Gestiona las secciones de cada grado
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Sección
        </Button>
      </div>

      {/* Filters */}
      <SectionFilters
        filters={filters}
        onFiltersChange={setFilters}
        grades={grades}
        teachers={teachers}
      />

      {/* Grid */}
      <SectionsGrid
        sections={sections}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAssignTeacher={handleAssignTeacher}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <SectionFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedSection(null);
        }}
        onSubmit={handleFormSubmit}
        mode={formMode}
        initialData={selectedSection}
        grades={grades}
        teachers={teachers}
      />

      <DeleteSectionDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedSection(null);
        }}
        section={selectedSection}
        onConfirm={handleConfirmDelete}
      />

      <AssignTeacherDialog
        isOpen={isAssignTeacherOpen}
        onClose={() => {
          setIsAssignTeacherOpen(false);
          setSelectedSection(null);
        }}
        section={selectedSection}
        teachers={teachers}
        onAssign={handleAssignTeacherSubmit}
      />
    </div>
  );
}
```

---

## UI Components Guide

### Color Coding System

```typescript
// utils/section-colors.ts

export const getUtilizationColor = (percentage: number) => {
  if (percentage >= 95) return {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-500',
    badge: 'bg-red-500',
  };
  
  if (percentage >= 85) return {
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-500',
    badge: 'bg-orange-500',
  };
  
  if (percentage >= 70) return {
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-500',
    badge: 'bg-yellow-500',
  };
  
  if (percentage >= 50) return {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500',
    badge: 'bg-blue-500',
  };
  
  return {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-500',
    badge: 'bg-green-500',
  };
};

export const getUtilizationLabel = (percentage: number): string => {
  if (percentage >= 95) return 'Llena';
  if (percentage >= 85) return 'Casi llena';
  if (percentage >= 70) return 'Alta';
  if (percentage >= 50) return 'Moderada';
  return 'Disponible';
};
```

### Progress Bar Component

```typescript
// components/ui/UtilizationBar.tsx

interface UtilizationBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

export function UtilizationBar({ current, total, showLabel = true }: UtilizationBarProps) {
  const percentage = (current / total) * 100;
  const colors = getUtilizationColor(percentage);
  
  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="font-medium">{current} / {total}</span>
          <span className={colors.text}>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all ${colors.badge}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
```

---

## Error Handling Patterns

### Comprehensive Error Handler

```typescript
// utils/error-handlers.ts

import { AxiosError } from 'axios';
import { toast } from 'sonner';

interface ApiError {
  message: string;
  error?: string;
  statusCode: number;
}

export const handleSectionError = (error: unknown, context: string = '') => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    const status = error.response?.status;

    switch (status) {
      case 400:
        // Bad Request - Validation errors
        toast.error(apiError?.message || 'Datos inválidos');
        break;
      
      case 404:
        // Not Found
        toast.error('Sección no encontrada');
        break;
      
      case 409:
        // Conflict - Duplicate name
        toast.error(apiError?.message || 'Ya existe una sección con ese nombre');
        break;
      
      case 403:
        // Forbidden
        toast.error('No tienes permisos para realizar esta acción');
        break;
      
      default:
        toast.error(`Error ${context}: ${apiError?.message || 'Error desconocido'}`);
    }
  } else {
    toast.error(`Error ${context}: Error desconocido`);
  }
};

// Usage example
try {
  await sectionsService.create(data);
} catch (error) {
  handleSectionError(error, 'al crear sección');
}
```

---

## Testing Strategies

### Unit Tests Example

```typescript
// __tests__/services/sections.service.test.ts

import { sectionsService } from '@/services/sections.service';
import { api } from '@/config/api';

jest.mock('@/config/api');

describe('Sections Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch sections with pagination', async () => {
      const mockResponse = {
        data: {
          data: {
            data: [{ id: 1, name: 'A', capacity: 30 }],
            meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
          },
        },
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sectionsService.getAll({ page: 1 });

      expect(api.get).toHaveBeenCalledWith('/sections', {
        params: { page: 1 },
      });
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('create', () => {
    it('should create a new section', async () => {
      const newSection = {
        name: 'A',
        capacity: 30,
        gradeId: 1,
        teacherId: null,
      };

      const mockResponse = {
        data: {
          data: { id: 1, ...newSection },
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sectionsService.create(newSection);

      expect(api.post).toHaveBeenCalledWith('/sections', newSection);
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  // Add more tests...
});
```

### Component Tests Example

```typescript
// __tests__/components/SectionCard.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { SectionCard } from '@/components/features/sections/SectionCard';

describe('SectionCard', () => {
  const mockSection = {
    id: 1,
    name: 'A',
    capacity: 30,
    gradeId: 1,
    teacherId: 1,
    grade: { id: 1, name: 'Primero Primaria', level: 'Primaria', order: 1 },
    teacher: { id: 1, givenNames: 'María', lastNames: 'López', email: 'maria@test.com' },
    _count: { enrollments: 25, courseAssignments: 8, schedules: 40 },
  };

  it('should render section information correctly', () => {
    render(<SectionCard section={mockSection} />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('Primero Primaria')).toBeInTheDocument();
    expect(screen.getByText(/María López/)).toBeInTheDocument();
    expect(screen.getByText(/25 \/ 30/)).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const handleEdit = jest.fn();
    render(<SectionCard section={mockSection} onEdit={handleEdit} />);

    const editButton = screen.getByRole('button', { name: /editar/i });
    fireEvent.click(editButton);

    expect(handleEdit).toHaveBeenCalledTimes(1);
  });

  // Add more tests...
});
```

---

## Best Practices

### 1. Performance Optimization

```typescript
// Memoize expensive computations
const utilizationPercentage = useMemo(() => {
  if (!section._count) return 0;
  return (section._count.enrollments / section.capacity) * 100;
}, [section._count, section.capacity]);

// Debounce search input
const debouncedSearch = useMemo(
  () => debounce((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  }, 300),
  []
);
```

### 2. Accessibility

```typescript
// Always include ARIA labels
<Button
  onClick={handleEdit}
  aria-label={`Editar sección ${section.name}`}
>
  <Edit className="h-4 w-4" />
</Button>

// Keyboard navigation
<Card
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter') handleView();
  }}
>
```

### 3. Loading States

```typescript
// Skeleton for cards
{isLoading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="p-6">
        <Skeleton className="h-4 w-20 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-32" />
      </Card>
    ))}
  </div>
) : (
  <SectionsGrid sections={sections} {...props} />
)}
```

### 4. Error Boundaries

```typescript
// Error boundary for sections module
<ErrorBoundary
  fallback={
    <div className="p-6 text-center">
      <p>Error al cargar secciones</p>
      <Button onClick={() => window.location.reload()}>
        Reintentar
      </Button>
    </div>
  }
>
  <SectionsPage />
</ErrorBoundary>
```

### 5. Optimistic Updates

```typescript
const updateSection = useMutation({
  mutationFn: ({ id, data }: { id: number; data: UpdateSectionDto }) =>
    sectionsService.update(id, data),
  onMutate: async ({ id, data }) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['sections'] });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['sections']);
    
    // Optimistically update
    queryClient.setQueryData(['sections'], (old: any) => ({
      ...old,
      data: old.data.map((s: Section) =>
        s.id === id ? { ...s, ...data } : s
      ),
    }));
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    if (context?.previous) {
      queryClient.setQueryData(['sections'], context.previous);
    }
  },
});
```

---

## Additional Resources

### Useful Utilities

```typescript
// utils/section-utils.ts

export const calculateAvailableSpots = (capacity: number, enrollments: number): number => {
  return Math.max(0, capacity - enrollments);
};

export const isFullCapacity = (capacity: number, enrollments: number): boolean => {
  return enrollments >= capacity;
};

export const canReduceCapacity = (newCapacity: number, currentEnrollments: number): boolean => {
  return newCapacity >= currentEnrollments;
};

export const formatSectionName = (name: string, gradeName: string): string => {
  return `${gradeName} - Sección ${name}`;
};

export const getSectionDisplayName = (section: Section): string => {
  return section.grade
    ? `${section.grade.name} - ${section.name}`
    : section.name;
};

export const getTeacherDisplayName = (teacher: Section['teacher']): string => {
  if (!teacher) return 'Sin asignar';
  return `${teacher.givenNames} ${teacher.lastNames}`;
};
```

---

## Notes & Recommendations

### Security Considerations
- ✅ Always validate capacity against current enrollments
- ✅ Check permissions before allowing delete operations
- ✅ Sanitize search inputs
- ✅ Validate grade/teacher IDs exist before assignment

### UX Recommendations
- 🎨 Use color coding for utilization levels
- 📊 Show visual progress bars
- ⚠️ Display warnings before destructive actions
- 💡 Provide helpful error messages
- 🔄 Show loading states during operations
- ✅ Confirm successful operations with toasts

### Performance Tips
- 🚀 Implement pagination for large datasets
- 💾 Cache frequently accessed data
- 🔍 Debounce search inputs
- 📦 Lazy load statistics when needed
- 🎯 Optimize re-renders with React.memo

---

**Last Updated:** October 31, 2025  
**Version:** 2.0.0  
**Maintained by:** Frontend Team
