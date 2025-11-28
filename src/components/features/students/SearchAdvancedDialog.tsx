// src/components/features/students/SearchAdvancedDialog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Search,
  Loader2,
  X,
  Download,
  RotateCcw,
} from 'lucide-react';
import { studentsService } from '@/services/students.service';
import { toast } from 'sonner';

interface SearchAdvancedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  name?: string;
  sire?: string;
  cycleId?: number;
  gradeId?: number;
  sectionId?: number;
  gender?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED';
  dateFrom?: string;
  dateTo?: string;
}

interface FilterOptions {
  cycles: any[];
  grades: any[];
  sections: any[];
}

export const SearchAdvancedDialog: React.FC<SearchAdvancedDialogProps> = ({
  isOpen,
  onClose,
  onSearch,
}) => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

  const [filters, setFilters] = useState<SearchFilters>({});
  const [savedSearches, setSavedSearches] = useState<
    { name: string; filters: SearchFilters }[]
  >([]);

  useEffect(() => {
    if (isOpen) {
      loadFilterOptions();
      loadSavedSearches();
    }
  }, [isOpen]);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const [enrollmentData, allSections] = await Promise.all([
        studentsService.getEnrollmentFormData(),
        // Para obtener todas las secciones necesitaríamos un endpoint
        // Por ahora obtenemos lo disponible
        Promise.resolve([]),
      ]);
      
      setFilterOptions({
        cycles: enrollmentData.cycles || [],
        grades: enrollmentData.availableGrades || [],
        sections: allSections || [],
      });
    } catch (err) {
      toast.error('Error al cargar opciones de filtro');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedSearches = () => {
    // Cargar búsquedas guardadas del localStorage
    const saved = localStorage.getItem('savedStudentSearches');
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (err) {
      }
    }
  };

  const handleSearch = async () => {
    try {
      setSearchLoading(true);

      // Validar al menos un filtro
      const hasFilter = Object.values(filters).some((v) => v);
      if (!hasFilter) {
        toast.error('Por favor selecciona al menos un filtro');
        return;
      }

      if (onSearch) {
        onSearch(filters);
      }

      onClose();
    } finally {
      setSearchLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({});
  };

  const handleSaveSearch = () => {
    const name = prompt('Nombre de la búsqueda:');
    if (name) {
      const updated = [
        ...savedSearches,
        { name, filters: { ...filters } },
      ];
      setSavedSearches(updated);
      localStorage.setItem('savedStudentSearches', JSON.stringify(updated));
      toast.success('Búsqueda guardada');
    }
  };

  const handleLoadSearch = (savedFilter: SearchFilters) => {
    setFilters(savedFilter);
  };

  const handleDeleteSearch = (index: number) => {
    const updated = savedSearches.filter((_, i) => i !== index);
    setSavedSearches(updated);
    localStorage.setItem('savedStudentSearches', JSON.stringify(updated));
  };

  const handleExportFilters = () => {
    const csv = convertToCSV(filters);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', 'filtros-estudiantes.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Filtros exportados');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Búsqueda Avanzada
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Filtra estudiantes por múltiples criterios
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        ) : (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Búsqueda por Texto */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Búsqueda Textual
              </h3>

              <div>
                <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">
                  Nombre
                </Label>
                <Input
                  placeholder="Nombre del estudiante"
                  value={filters.name || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, name: e.target.value })
                  }
                  className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">
                  Código SIRE
                </Label>
                <Input
                  placeholder="SIRE"
                  value={filters.sire || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, sire: e.target.value })
                  }
                  className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            {/* Filtros Académicos */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Información Académica
              </h3>

              <div>
                <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">
                  Ciclo
                </Label>
                <Select
                  value={filters.cycleId?.toString() || ''}
                  onValueChange={(val) =>
                    setFilters({ ...filters, cycleId: parseInt(val) })
                  }
                >
                  <SelectTrigger className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Selecciona ciclo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {filterOptions?.cycles?.map((cycle: any) => (
                      <SelectItem key={cycle.id} value={cycle.id.toString()}>
                        {cycle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">
                  Grado
                </Label>
                <Select
                  value={filters.gradeId?.toString() || ''}
                  onValueChange={(val) =>
                    setFilters({ ...filters, gradeId: parseInt(val) })
                  }
                >
                  <SelectTrigger className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Selecciona grado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {filterOptions?.grades?.map((grade: any) => (
                      <SelectItem key={grade.id} value={grade.id.toString()}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">
                  Sección
                </Label>
                <Select
                  value={filters.sectionId?.toString() || ''}
                  onValueChange={(val) =>
                    setFilters({ ...filters, sectionId: parseInt(val) })
                  }
                >
                  <SelectTrigger className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Selecciona sección" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {filterOptions?.sections?.map((section: any) => (
                      <SelectItem key={section.id} value={section.id.toString()}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Otros Filtros */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Otros Criterios
              </h3>

              <div>
                <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">
                  Género
                </Label>
                <Select
                  value={filters.gender || ''}
                  onValueChange={(val) =>
                    setFilters({ ...filters, gender: val })
                  }
                >
                  <SelectTrigger className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Selecciona género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">
                  Estado
                </Label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(val) =>
                    setFilters({
                      ...filters,
                      status: val as any,
                    })
                  }
                >
                  <SelectTrigger className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="graduated">Graduado</SelectItem>
                    <SelectItem value="transferred">Transferido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Búsquedas Guardadas */}
            {savedSearches.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Búsquedas Guardadas
                </h3>
                <div className="space-y-2">
                  {savedSearches.map((saved, idx) => (
                    <Card
                      key={idx}
                      className="p-3 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex items-center justify-between"
                    >
                      <button
                        onClick={() => handleLoadSearch(saved.filters)}
                        className="flex-1 text-left text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {saved.name}
                      </button>
                      <button
                        onClick={() => handleDeleteSearch(idx)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex gap-2 justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-gray-300 dark:border-gray-700"
              disabled={searchLoading}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpiar
            </Button>

            <Button
              variant="outline"
              onClick={handleSaveSearch}
              className="border-gray-300 dark:border-gray-700"
              disabled={!Object.values(filters).some((v) => v) || searchLoading}
            >
              💾 Guardar
            </Button>

            <Button
              variant="outline"
              onClick={handleExportFilters}
              className="border-gray-300 dark:border-gray-700"
              disabled={!Object.values(filters).some((v) => v) || searchLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={searchLoading}
              className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              Cerrar
            </Button>
            <Button
              onClick={handleSearch}
              disabled={searchLoading || !Object.values(filters).some((v) => v)}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {searchLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Buscar
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Función auxiliar para convertir filtros a CSV
function convertToCSV(filters: SearchFilters): string {
  const headers = Object.keys(filters);
  const values = Object.values(filters);

  return [headers.join(','), values.map((v) => `"${v}"`).join(',')].join(
    '\n'
  );
}
