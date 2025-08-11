// src/components/sections/SectionsFilter.tsx
"use client"

import { Input } from "@/components/ui/input";
import { Search, Filter } from 'lucide-react';
import { Grade } from "@/types/grades";

interface SectionsFilterProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    selectedGrade: number | 'all';
    onGradeChange: (gradeId: number | 'all') => void;
    grades: Grade[];
}

export function SectionsFilter({
    searchTerm,
    onSearchChange,
    selectedGrade,
    onGradeChange,
    grades
}: SectionsFilterProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    placeholder="Buscar secciones..."
                    className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200/50"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-2">
                <Filter className="text-gray-500 h-4 w-4" />
                <select
                    className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    value={selectedGrade}
                    onChange={(e) => onGradeChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                >
                    <option value="all">Todos los grados</option>
                    {grades.map((grade) => (
                        <option key={grade.id} value={grade.id}>
                            {grade.name} - {grade.level}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}