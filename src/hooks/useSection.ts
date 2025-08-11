// src/hooks/useSection.ts
import { useState, useEffect } from 'react';
import { Section, SectionFormValues } from '@/types/sections';
import { 
  getSections, 
  createSection, 
  updateSection, 
  getSectionById 
} from '@/services/sectionService';
import { sectionSchema, defaultValues } from "@/schemas/section";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

type SectionFormData = z.infer<typeof sectionSchema>;

export function useSection(isEditMode: boolean = false, id?: number) {
    const [sections, setSections] = useState<Section[]>([]);
    const [isLoadingSections, setIsLoadingSections] = useState(true);
    const [sectionsError, setSectionsError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentSection, setCurrentSection] = useState<Section | null>(null);

    const form = useForm<SectionFormData>({
        resolver: zodResolver(sectionSchema),
        defaultValues,
    });

    // Load section data when in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            const loadSectionData = async () => {
                try {
                    const section = await getSectionById(id);
                    setCurrentSection(section);
                    form.reset({
                        name: section.name,
                        capacity: section.capacity,
                        gradeId: section.gradeId,
                        teacherId: section.teacherId || undefined,
                    });
                } catch (error) {
                    console.error('Error loading section data:', error);
                    toast.error('Error al cargar los datos de la sección');
                }
            };
            loadSectionData();
        }
    }, [isEditMode, id, form]);

    const fetchSections = async (gradeId?: number) => {
        setIsLoadingSections(true);
        setSectionsError(null);
        try {
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

   const handleCreateSection = async (data: SectionFormValues) => {
    setIsSubmitting(true);
    try {
        // Convertir los IDs a números antes de enviar
        const numericData = {
            ...data,
            gradeId: Number(data.gradeId),
            teacherId: data.teacherId ? Number(data.teacherId) : null
        };

        await createSection(numericData);
        toast.success("Sección creada correctamente");
        await fetchSections(); // Usar el valor numérico
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

    const handleUpdateSection = async (id: number, data: SectionFormData) => {
        if (!id) return;

        setIsSubmitting(true);
        try {
            await updateSection(id, data);
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

    const handleSubmit = isEditMode ? handleUpdateSection : handleCreateSection;

    useEffect(() => {
        fetchSections();
    }, []);

    return {
        sections,
        currentSection,
        isLoadingSections,
        sectionsError,
        isSubmitting,
        form,
        fetchSections,
        createSection: handleCreateSection,
        updateSection: handleUpdateSection,
        resetForm: () => form.reset(defaultValues)
    };
}