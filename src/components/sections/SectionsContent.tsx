// src/components/sections/SectionsContent.tsx
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionsHeader } from "./SectionsHeader";
import { SectionsFilter } from "./SectionsFilter";
import { SectionsDataTable } from "./SectionsDataTable";
import { useSectionList } from "@/context/SectionsContext";
import { useGradeOptions } from "@/context/GradeContext";
import SectionFormDialog from "./SectionFormDialog";
import Breadcrumb from '@/components/common/Breadcrumb';
import { Section } from "@/types/sections";

export default function SectionsContent() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);

    // Hooks del context
    const {
        sections,
        loading,
        error,
        filters,
        initialized, // Nuevo estado
        handleFilterChange,
        handleDelete: contextHandleDelete,
        refetch
    } = useSectionList();

    const { grades } = useGradeOptions();

    // Manejar cambios de filtros con debounce implícito
    useEffect(() => {
        // Solo aplicar filtros si ya se inicializó la carga inicial
        if (!initialized) return;

        const newFilters = {
            ...(selectedGrade !== 'all' && { gradeId: selectedGrade }),
            ...(searchTerm && { search: searchTerm })
        };
        
        // Solo actualizar si los filtros realmente cambiaron
        if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
            handleFilterChange(newFilters);
        }
    }, [searchTerm, selectedGrade, handleFilterChange, filters, initialized]);

    // Handlers de acciones
    const handleEdit = (section: Section) => {
        setEditingSection(section);
        setIsModalOpen(true);
        console.log("Editar sección:", section);
    };

    const handleDelete = async (section: Section) => {
        const confirmed = window.confirm(
            `¿Estás seguro de que deseas eliminar la sección "${section.name}" del grado "${section.grade.name}"?`
        );
        
        if (confirmed) {
            const result = await contextHandleDelete(section.id);
            if (result.success) {
                console.log("Sección eliminada:", section.id);
                // El context ya maneja el toast y la actualización de la lista
            }
        }
    };

    const handleView = (section: Section) => {
        // Implementar lógica de visualización aquí
        console.log("Ver sección:", section.id);
    };

    const handleAddSection = () => {
        setEditingSection(null); // Modo crear
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSection(null);
    };

    const handleGradeChange = (gradeId: number | 'all') => {
        setSelectedGrade(gradeId);
        // El useEffect se encargará de actualizar los filtros
    };

    const handleSearchChange = (search: string) => {
        setSearchTerm(search);
        // El useEffect se encargará de actualizar los filtros
    };

    // Filtrar secciones en el frontend para búsqueda en tiempo real
    const filteredSections = sections.filter(section => {
        const matchesSearch = searchTerm === "" || 
            section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.grade.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (section.teacher && 
             `${section.teacher.givenNames} ${section.teacher.lastNames}`.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesGrade = selectedGrade === 'all' || section.gradeId === selectedGrade;
        
        return matchesSearch && matchesGrade;
    });

    // Estado de carga inicial
    if (!initialized && loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando secciones...</p>
                </div>
            </div>
        );
    }

    // Estado de error
    if (error && initialized) {
        return (
            <div className="space-y-6">
                {/* Breadcrumb siempre visible */}
                <Breadcrumb
                    pageTitle="Gestión de Secciones"
                    items={[
                        { label: "Inicio", href: "/dashboard" },
                        { label: "Administración", href: "#" },
                        { label: "Secciones", href: "/sections" },
                    ]}
                />

                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-red-500 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar secciones</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <div className="space-x-4">
                            <button 
                                onClick={refetch}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                Reintentar
                            </button>
                            <button
                                onClick={handleAddSection}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Crear Nueva Sección
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb
                pageTitle="Gestión de Secciones"
                items={[
                    { label: "Inicio", href: "/dashboard" },
                    { label: "Administración", href: "#" },
                    { label: "Secciones", href: "/sections" },
                ]}
            />

            {/* Header con botón de agregar */}
            <SectionsHeader onAddSection={handleAddSection} />

            {/* Contenido principal */}
            <div className="grid grid-cols-1 gap-6">
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                        <SectionsFilter
                            searchTerm={searchTerm}
                            onSearchChange={handleSearchChange}
                            selectedGrade={selectedGrade}
                            onGradeChange={handleGradeChange}
                            grades={grades}
                        />
                    </CardHeader>
                    <CardContent>
                        {/* Loading durante filtros */}
                        {loading && initialized && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-600">Actualizando...</p>
                            </div>
                        )}

                        {!loading && (
                            <>
                                <SectionsDataTable
                                    data={filteredSections}
                                    grades={grades}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onView={handleView}
                                />
                                
                                {/* Estados vacíos */}
                                {filteredSections.length === 0 && sections.length > 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <div className="max-w-md mx-auto">
                                            <div className="text-gray-400 mb-4">
                                                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium mb-2">No se encontraron secciones</h3>
                                            <p className="text-sm">
                                                No hay secciones que coincidan con los filtros aplicados.
                                                Intenta ajustar los criterios de búsqueda.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                {sections.length === 0 && initialized && (
                                    <div className="text-center py-12 text-gray-500">
                                        <div className="max-w-md mx-auto">
                                            <div className="text-gray-400 mb-4">
                                                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium mb-2">No hay secciones registradas</h3>
                                            <p className="text-sm mb-4">
                                                Comienza creando la primera sección para organizar tus estudiantes por grados.
                                            </p>
                                            <button
                                                onClick={handleAddSection}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                            >
                                                Crear Primera Sección
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dialog unificado */}
            <SectionFormDialog
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editingSection={editingSection}
            />
        </div>
    );
}