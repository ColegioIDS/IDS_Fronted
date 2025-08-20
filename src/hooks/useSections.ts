// src/hooks/useSections.ts
import { useState, useEffect } from 'react';
import { 
  Section, 
  SectionFormValues,
  SectionOption,
  TeacherOption
} from '@/types/sections';
import { 
  getSections, 
  createSection, 
  updateSection, 
  getSectionById,
  deleteSection
} from '@/services/sectionService';
import { createSectionSchema, updateSectionSchema, defaultSectionValues } from "@/schemas/section";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

type SectionFormSchemaData = z.infer<typeof createSectionSchema>;
type UpdateSectionFormSchemaData = z.infer<typeof updateSectionSchema>;

interface SectionFilters {
  gradeId?: number;
  teacherId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export function useSections(
  isEditMode: boolean = false, 
  id?: number,
  initialFilters?: SectionFilters
) {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [sectionsError, setSectionsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);

  const form = useForm<SectionFormSchemaData>({
    resolver: zodResolver(createSectionSchema),
    defaultValues: defaultSectionValues,
  });

  const updateForm = useForm<UpdateSectionFormSchemaData>({
    resolver: zodResolver(updateSectionSchema),
    defaultValues: {},
  });

  // Load section data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const loadSectionData = async () => {
        try {
          const section = await getSectionById(id);
          setCurrentSection(section);
          
          const formData: SectionFormSchemaData = {
            name: section.name,
            capacity: section.capacity,
            gradeId: section.gradeId.toString(),
            teacherId: section.teacherId?.toString() || '',
          };
          
          form.reset(formData);
          updateForm.reset(formData);
        } catch (error) {
          console.error('Error loading section data:', error);
          toast.error('Error al cargar los datos de la sección');
        }
      };
      loadSectionData();
    }
  }, [isEditMode, id, form, updateForm]);

  const fetchSections = async (filters?: SectionFilters) => {
    setIsLoadingSections(true);
    setSectionsError(null);
    try {
      const gradeId = filters?.gradeId || initialFilters?.gradeId;
      const response = await getSections(gradeId);
      setSections(response);
    } catch (error) {
      setSectionsError('Error al cargar las secciones');
      console.error(error);
      toast.error('Error al cargar las secciones');
    } finally {
      setIsLoadingSections(false);
    }
  };

  const fetchSectionsByGrade = async (gradeId: number) => {
    setIsLoadingSections(true);
    setSectionsError(null);
    try {
      const response = await getSections(gradeId);
      setSections(response);
    } catch (error) {
      setSectionsError('Error al cargar las secciones del grado');
      console.error(error);
      toast.error('Error al cargar las secciones del grado');
    } finally {
      setIsLoadingSections(false);
    }
  };

  const handleCreateSection = async (data: SectionFormSchemaData) => {
    setIsSubmitting(true);
    try {
      const requestData: SectionFormValues = {
        name: data.name,
        capacity: data.capacity,
        gradeId: parseInt(data.gradeId),
        teacherId: data.teacherId ? parseInt(data.teacherId) : null,
      };

      await createSection(requestData);
      toast.success("Sección creada correctamente");
      await fetchSections();
      form.reset();
      return { success: true };
    } catch (error: any) {
      console.log("Error completo:", error);
      console.log("Datos de respuesta:", error.response?.data);
      
      if (error.response?.data) {
        return { 
          success: false,
          message: error.response.data.message || "Error de validación",
          details: error.response.data.details || []
        };
      }
      
      toast.error(error.message || "Error al crear la sección");
      return { 
        success: false, 
        message: error.message || "Error desconocido",
        details: []
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSection = async (id: number, data: UpdateSectionFormSchemaData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const requestData: Partial<SectionFormValues> = {
        ...(data.name && { name: data.name }),
        ...(data.capacity && { capacity: data.capacity }),
        ...(data.gradeId && { gradeId: parseInt(data.gradeId) }),
        ...(data.teacherId !== undefined && { 
          teacherId: data.teacherId ? parseInt(data.teacherId) : null 
        }),
      };

      await updateSection(id, requestData);
      toast.success("Sección actualizada correctamente");
      await fetchSections();
      return { success: true };
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data; 
      }
      toast.error("Error al actualizar la sección");
      console.error(error);
      return { success: false, message: "Error desconocido" };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSection = async (id: number) => {
    try {
      await deleteSection(id);
      toast.success("Sección eliminada correctamente");
      await fetchSections();
      return { success: true };
    } catch (error: any) {
      toast.error("Error al eliminar la sección");
      console.error(error);
      return { success: false, message: error.message || "Error desconocido" };
    }
  };

  const handleSubmit = isEditMode ? handleUpdateSection : handleCreateSection;

  // Helper functions for options
  const getSectionOptions = (): SectionOption[] => {
    return sections.map(section => ({
      value: section.id,
      label: `${section.grade.name} - ${section.name}`,
      gradeId: section.gradeId
    }));
  };

  const getTeacherOptions = (): TeacherOption[] => {
    const teachers = sections
      .filter(section => section.teacher)
      .map(section => section.teacher!)
      .filter((teacher, index, self) => 
        self.findIndex(t => t.id === teacher.id) === index
      ); // Remove duplicates

    return teachers.map(teacher => ({
      value: teacher.id,
      label: `${teacher.givenNames} ${teacher.lastNames}`,
      isHomeroom: teacher.teacherDetails?.isHomeroomTeacher || false
    }));
  };

  useEffect(() => {
    fetchSections(initialFilters);
  }, []);

  return {
    // Data
    sections,
    currentSection,
    
    // Loading states
    isLoadingSections,
    isSubmitting,
    
    // Error states
    sectionsError,
    
    // Forms
    form,
    updateForm,
    
    // Actions
    fetchSections,
    fetchSectionsByGrade,
    createSection: handleCreateSection,
    updateSection: handleUpdateSection,
    deleteSection: handleDeleteSection,
    
    // Helper functions
    getSectionOptions,
    getTeacherOptions,
    
    // Utils
    resetForm: () => form.reset(defaultSectionValues),
    resetUpdateForm: () => updateForm.reset({})
  };
}

// Hook simplificado para solo obtener secciones
export function useSectionList(gradeId?: number) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = async (newGradeId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSections(newGradeId || gradeId);
      setSections(response);
    } catch (err: any) {
      setError(err.message || 'Error al cargar secciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections(gradeId);
  }, [gradeId]);

  return {
    sections,
    loading,
    error,
    refetch: fetchSections
  };
}

// Hook para opciones de secciones
export function useSectionOptions(gradeId?: number) {
  const { sections, loading, error } = useSectionList(gradeId);

  const sectionOptions: SectionOption[] = sections.map(section => ({
    value: section.id,
    label: `${section.grade.name} - ${section.name}`,
    gradeId: section.gradeId
  }));

  return {
    sectionOptions,
    loading,
    error
  };
}