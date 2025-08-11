// src/components/sections/SectionsContent.tsx
"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {SectionsHeader} from "./SectionsHeader";
import {SectionsFilter} from "./SectionsFilter";
import { SectionsDataTable } from "./SectionsDataTable";
import { useSectionContext } from "@/context/SectionContext";
import SectionFormModal from "./ModalFormContent";
import { Section } from "@/types/sections";
import { useGradeContext } from "@/context/GradeContext";

export default function SectionsContent() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);

    const { sections, isLoadingSections, sectionsError, fetchSections } = useSectionContext();
    const { grades } = useGradeContext();

    const handleEdit = (section: Section) => {
        setEditingSection(section);
        setIsModalOpen(true);
        console.log("Editar sección:", section);
    };

    const handleDelete = (section: Section) => {
        // Implementar lógica de eliminación aquí
        console.log("Eliminar sección:", section.id);
    };

    const handleView = (section: Section) => {
        // Implementar lógica de visualización aquí
        console.log("Ver sección:", section.id);
    };

    // Filtrar secciones basado en el término de búsqueda y el grado seleccionado
    const filteredSections = sections.filter(section => {
        const matchesSearch = section.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGrade = selectedGrade === 'all' || section.gradeId === selectedGrade;
        return matchesSearch && matchesGrade;
    });

    if (isLoadingSections) return <div>Cargando secciones...</div>;
    if (sectionsError) return <div>Error: {sectionsError}</div>;

    return (
        <div className="space-y-8">
            <SectionsHeader 
                onAddSection={() => {
                    setEditingSection(null);
                    setIsModalOpen(true);
                }} 
            />

            <div className="grid grid-cols-1 gap-8">
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                        <SectionsFilter
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            selectedGrade={selectedGrade}
                            onGradeChange={(gradeId) => {
                                setSelectedGrade(gradeId);
                                if (gradeId !== 'all') {
                                    fetchSections(gradeId);
                                } else {
                                    fetchSections();
                                }
                            }}
                            grades={grades}
                        />
                    </CardHeader>
                    <CardContent>
                        <SectionsDataTable
                            data={filteredSections}
                            grades={grades}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={handleView}
                          
                         
                          
                        />
                    </CardContent>
                </Card>
            </div>

            <SectionFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingSection(null);
                }}
                editingSection={editingSection}
            />
        </div>
    );
}