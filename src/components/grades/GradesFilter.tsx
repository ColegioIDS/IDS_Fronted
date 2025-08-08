// src/components/grades/GradesFilter.tsx
import { GraduationCap } from 'lucide-react'
import { CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from 'lucide-react'

interface GradesFilterProps {
    searchTerm: string
    setSearchTerm: (value: string) => void
    selectedCycle: string
    setSelectedCycle: (value: string) => void
}

export default function GradesFilter({
    searchTerm,
    setSearchTerm,
    selectedCycle,
    setSelectedCycle
}: GradesFilterProps) {
    return (
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                Lista de Grados
            </CardTitle>
            <div className="flex gap-4">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Buscar grados..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/50 border-gray-200/50 focus:bg-white"
                    />
                </div>
                <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                    <SelectTrigger className="w-48 bg-white/50 border-gray-200/50 focus:bg-white">
                        <SelectValue placeholder="Filtrar por ciclo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los ciclos</SelectItem>
                        <SelectItem value="2024-2025">2024-2025</SelectItem>
                        <SelectItem value="2023-2024">2023-2024</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}