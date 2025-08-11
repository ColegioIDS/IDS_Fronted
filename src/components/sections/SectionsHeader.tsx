// src/components/sections/SectionsHeader.tsx
"use client"

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SectionsHeaderProps {
    onAddSection: () => void;
}

export function SectionsHeader({ onAddSection }: SectionsHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Secciones</h1>
                <p className="text-muted-foreground">
                    Administra las secciones de cada grado
                </p>
            </div>
            <Button onClick={onAddSection}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Sección
            </Button>
        </div>
    );
}