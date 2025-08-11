//src\components\grades\GradesContent.tsx
"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import GradesHeader from "./GradesHeader";
import GradesFilter from "./GradesFilter";
import { GradeDataTable } from "./GradesDatatable";
import { useGradeContext } from "@/context/GradeContext";
import GradeFormModal from "./ModalFormContent";
import { Grade } from "@/types/grades";

export default function GradesContent() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCycle, setSelectedCycle] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

    const { grades, isLoadingGrades, gradesError } = useGradeContext();

    const handleEdit = (grade: Grade) => {
        setEditingGrade(grade);
        setIsModalOpen(true);
    };

    if (isLoadingGrades) return <div>Cargando grados...</div>;
    if (gradesError) return <div>Error: {gradesError}</div>;

    return (
        <div className="space-y-8">
            <GradesHeader onAddGrade={() => {
                setEditingGrade(null);
                setIsModalOpen(true);
            }} />

            <div className="grid grid-cols-1 gap-8">
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                        <GradesFilter
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            selectedCycle={selectedCycle}
                            setSelectedCycle={setSelectedCycle}
                        />
                    </CardHeader>
                    <CardContent>
                        <GradeDataTable
                            data={grades}
                            onEdit={handleEdit}
                        />
                    </CardContent>
                </Card>
            </div>

            <GradeFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingGrade(null);
                }}
                editingGrade={editingGrade}
            />
        </div>
    );
}