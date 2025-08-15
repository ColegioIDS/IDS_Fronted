'use client';

import { useState, useEffect } from 'react';
import { useEnrollmentContext } from '@/context/EnrollmentContext';
import { useCyclesContext } from '@/context/CyclesContext';
import { useGradeContext } from '@/context/GradeContext';
import { useSectionContext } from '@/context/SectionContext';

import {
  Filter,
  X,
  RotateCcw,
  Search,
  Calendar,
  GraduationCap,
  Users,
  BookOpen,
  Settings,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { EnrollmentStatus, EnrollmentFilterDto } from '@/types/enrollment.types';

const statusOptions = [
  { value: EnrollmentStatus.ACTIVE, label: "Activo", color: "bg-green-100 text-green-700" },
  { value: EnrollmentStatus.GRADUATED, label: "Graduado", color: "bg-purple-100 text-purple-700" },
  { value: EnrollmentStatus.TRANSFERRED, label: "Transferido", color: "bg-orange-100 text-orange-700" },
];

const genderOptions = [
  { value: "Masculino", label: "Masculino" },
  { value: "Femenino", label: "Femenino" },
  { value: "Otro", label: "Otro" },
];

interface EnrollmentFiltersProps {
  onFiltersChange?: (filters: EnrollmentFilterDto) => void;
}

export default function EnrollmentFilters({ onFiltersChange }: EnrollmentFiltersProps) {
  const { fetchEnrollments } = useEnrollmentContext();
  
  // Contexts para datos reales
  const { 
    cycles, 
    fetchCycles,
    isLoadingCycles 
  } = useCyclesContext();
  
  const { 
    grades, 
    fetchGrades,
    isLoadingGrades 
  } = useGradeContext();
  
  const { 
    sections, 
    fetchSections,
    isLoadingSections 
  } = useSectionContext();

  // Filter state
  const [filters, setFilters] = useState<EnrollmentFilterDto>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Individual filter states
  const [selectedCycle, setSelectedCycle] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [ageRange, setAgeRange] = useState({ min: "", max: "" });
  const [genderFilter, setGenderFilter] = useState<string>("");

  // Cargar datos iniciales
  useEffect(() => {
    fetchCycles();
    fetchGrades();
  }, []);

  // Cargar secciones cuando cambie el grado seleccionado
  useEffect(() => {
    if (selectedGrade) {
      const gradeId = parseInt(selectedGrade);
      fetchSections(gradeId);
    }
  }, [selectedGrade]);

  // Filtrar secciones por el grado seleccionado
  const availableSections = sections?.filter(section => 
    !selectedGrade || section.gradeId === parseInt(selectedGrade)
  ) || [];

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== "" && value !== null
  ).length;

  // Update filters when individual states change
  useEffect(() => {
    const newFilters: EnrollmentFilterDto = {};
    
    if (selectedCycle) newFilters.cycleId = parseInt(selectedCycle);
    if (selectedGrade) newFilters.gradeId = parseInt(selectedGrade);
    if (selectedSection) newFilters.sectionId = parseInt(selectedSection);
    if (selectedStatus) newFilters.status = selectedStatus as EnrollmentStatus;

    setFilters(newFilters);
  }, [selectedCycle, selectedGrade, selectedSection, selectedStatus]);

  // Apply filters
  const handleApplyFilters = async () => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
    await fetchEnrollments(filters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCycle("");
    setSelectedGrade("");
    setSelectedSection("");
    setSelectedStatus("");
    setAgeRange({ min: "", max: "" });
    setGenderFilter("");
    setFilters({});
    
    if (onFiltersChange) {
      onFiltersChange({});
    }
    fetchEnrollments({});
  };

  // Clear individual filter
  const clearFilter = (filterKey: string) => {
    switch (filterKey) {
      case 'cycle':
        setSelectedCycle("");
        break;
      case 'grade':
        setSelectedGrade("");
        setSelectedSection(""); // Clear section when grade is cleared
        break;
      case 'section':
        setSelectedSection("");
        break;
      case 'status':
        setSelectedStatus("");
        break;
    }
  };

  // Quick filter functions
  const applyActiveOnlyFilter = () => {
    setSelectedStatus(EnrollmentStatus.ACTIVE);
  };

  const applyCurrentCycleFilter = () => {
    const activeCycle = cycles?.find(c => c.isActive);
    if (activeCycle) {
      setSelectedCycle(activeCycle.id.toString());
    }
  };

  // Loading state
  const isLoading = isLoadingCycles || isLoadingGrades || isLoadingSections;

  return (
    <div className="space-y-6">
      {/* Main Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cycle Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <Calendar className="h-4 w-4 inline mr-2 text-blue-500" />
            Ciclo Escolar
          </Label>
          <Select 
            value={selectedCycle} 
            onValueChange={setSelectedCycle}
            disabled={isLoadingCycles}
          >
            <SelectTrigger className="bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder={isLoadingCycles ? "Cargando..." : "Seleccionar ciclo"} />
            </SelectTrigger>
            <SelectContent>
              {cycles?.map((cycle) => (
                <SelectItem key={cycle.id} value={cycle.id.toString()}>
                  <div className="flex items-center gap-2">
                    {cycle.name}
                    {cycle.isActive && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                        Actual
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grade Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <GraduationCap className="h-4 w-4 inline mr-2 text-purple-500" />
            Grado
          </Label>
          <Select 
            value={selectedGrade} 
            onValueChange={setSelectedGrade}
            disabled={isLoadingGrades}
          >
            <SelectTrigger className="bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder={isLoadingGrades ? "Cargando..." : "Seleccionar grado"} />
            </SelectTrigger>
            <SelectContent>
              {grades?.filter(grade => grade.isActive).map((grade) => (
                <SelectItem key={grade.id} value={grade.id.toString()}>
                  <div className="flex items-center gap-2">
                    {grade.name}
                    <Badge variant="outline" className="text-xs">
                      {grade.level}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Section Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <Users className="h-4 w-4 inline mr-2 text-green-500" />
            Sección
          </Label>
          <Select 
            value={selectedSection} 
            onValueChange={setSelectedSection}
            disabled={!selectedGrade || isLoadingSections}
          >
            <SelectTrigger className="bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder={
                !selectedGrade ? "Selecciona un grado primero" :
                isLoadingSections ? "Cargando..." : 
                "Seleccionar sección"
              } />
            </SelectTrigger>
            <SelectContent>
              {availableSections.map((section) => (
                <SelectItem key={section.id} value={section.id.toString()}>
                  <div className="flex items-center gap-2">
                    Sección {section.name}
                    <span className="text-xs text-gray-500">
                      (Cap: {section.capacity})
                    </span>
                    {section.teacher && (
                      <span className="text-xs text-gray-400 truncate max-w-20">
                        - {section.teacher.givenNames.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <BookOpen className="h-4 w-4 inline mr-2 text-orange-500" />
            Estado
          </Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status.value === EnrollmentStatus.ACTIVE ? 'bg-green-500' : 
                      status.value === EnrollmentStatus.GRADUATED ? 'bg-purple-500' : 'bg-orange-500'}`} />
                    {status.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Filters */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full bg-white/50 dark:bg-gray-800/50">
            <Settings className="h-4 w-4 mr-2" />
            Filtros Avanzados
            {showAdvanced ? (
              <X className="h-4 w-4 ml-2" />
            ) : (
              <Filter className="h-4 w-4 ml-2" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Age Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rango de Edad
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={ageRange.min}
                    onChange={(e) => setAgeRange(prev => ({ ...prev, min: e.target.value }))}
                    className="bg-white/70 dark:bg-gray-900/70"
                    min="3"
                    max="25"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={ageRange.max}
                    onChange={(e) => setAgeRange(prev => ({ ...prev, max: e.target.value }))}
                    className="bg-white/70 dark:bg-gray-900/70"
                    min="3"
                    max="25"
                  />
                </div>
              </div>

              {/* Gender Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Género
                </Label>
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger className="bg-white/70 dark:bg-gray-900/70">
                    <SelectValue placeholder="Seleccionar género" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((gender) => (
                      <SelectItem key={gender.value} value={gender.value}>
                        {gender.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Filters */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filtros Rápidos
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={applyActiveOnlyFilter}
                    className="text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    Solo Activos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={applyCurrentCycleFilter}
                    disabled={isLoadingCycles || !cycles?.some(c => c.isActive)}
                    className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    Ciclo Actual
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtros activos:
          </span>
          {selectedCycle && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              Ciclo: {cycles?.find(c => c.id.toString() === selectedCycle)?.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-blue-200"
                onClick={() => clearFilter('cycle')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedGrade && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              Grado: {grades?.find(g => g.id.toString() === selectedGrade)?.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-purple-200"
                onClick={() => clearFilter('grade')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedSection && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Sección: {availableSections.find(s => s.id.toString() === selectedSection)?.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-green-200"
                onClick={() => clearFilter('section')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedStatus && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              Estado: {statusOptions.find(s => s.value === selectedStatus)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-orange-200"
                onClick={() => clearFilter('status')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button 
          onClick={handleApplyFilters}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Aplicar Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
            className="bg-white/50 dark:bg-gray-800/50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpiar Filtros
          </Button>
        )}

        {/* Loading indicator for data */}
        {isLoading && (
          <div className="flex items-center text-sm text-gray-500">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Cargando datos...
          </div>
        )}
      </div>

      {/* Data summary */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div className="flex items-center gap-4">
          <span>Ciclos disponibles: {cycles?.length || 0}</span>
          <span>Grados activos: {grades?.filter(g => g.isActive).length || 0}</span>
          <span>Secciones: {sections?.length || 0}</span>
        </div>
      </div>
    </div>
  );
}