// src/components/grades/GradesHeader.tsx
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'

interface GradesHeaderProps {
    onAddGrade?: () => void // <-- Nueva prop
}

export default function GradesHeader({ onAddGrade }: GradesHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Grados</h1>
                <p className="text-gray-600 mt-2">Administra los niveles educativos y su organización</p>
            </div>
            <Button 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg"
                onClick={onAddGrade} // <-- Usamos la prop
            >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Grado
            </Button>
        </div>
    )
}