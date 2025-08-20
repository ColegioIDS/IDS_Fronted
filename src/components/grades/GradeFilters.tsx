// src/components/grades/GradeFilters.tsx
'use client';
import { useState } from 'react';
import { GradeFilters } from '@/types/grades';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  RotateCcw,
  Baby,
  BookOpen,
  GraduationCap,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface GradeFiltersProps {
  filters: GradeFilters;
  onFilterChange: (filters: GradeFilters) => void;
}

export default function GradeFilters({ filters, onFilterChange }: GradeFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<GradeFilters>(filters);

  const handleFilterChange = (key: keyof GradeFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const resetFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof GradeFilters] !== undefined && 
    filters[key as keyof GradeFilters] !== ''
  );

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== '' && value !== null
    ).length;
  };

  return (
    <Card>
      <CardContent className="p-4">
        {/* Barra de búsqueda principal */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar grados..."
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-blue-500" />
                  <span>Filtros</span>
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="absolute z-10 mt-2 right-0">
                <Card className="w-80 shadow-lg border">
                  <CardContent className="p-4 space-y-4">
                    {/* Filtro por nivel */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Nivel Educativo
                      </label>
                      <Select
                        value={localFilters.level || ''}
                        onValueChange={(value) => handleFilterChange('level', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los niveles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos los niveles</SelectItem>
                          <SelectItem value="Kinder">
                            <div className="flex items-center space-x-2">
                              <Baby className="h-4 w-4 text-pink-500" />
                              <span>Kinder</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Primaria">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4 text-blue-500" />
                              <span>Primaria</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Secundaria">
                            <div className="flex items-center space-x-2">
                              <GraduationCap className="h-4 w-4 text-purple-500" />
                              <span>Secundaria</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por estado */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Estado
                      </label>
                      <Select
                        value={localFilters.isActive?.toString() || ''}
                        onValueChange={(value) => 
                          handleFilterChange('isActive', value === '' ? undefined : value === 'true')
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos los estados</SelectItem>
                          <SelectItem value="true">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Activos</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="false">
                            <div className="flex items-center space-x-2">
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span>Inactivos</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Ordenamiento */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Ordenar por
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={localFilters.orderBy || ''}
                          onValueChange={(value) => handleFilterChange('orderBy', value || undefined)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Campo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Sin orden</SelectItem>
                            <SelectItem value="name">Nombre</SelectItem>
                            <SelectItem value="level">Nivel</SelectItem>
                            <SelectItem value="order">Orden</SelectItem>
                            <SelectItem value="createdAt">Fecha</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={localFilters.orderDirection || ''}
                          onValueChange={(value) => handleFilterChange('orderDirection', value || undefined)}
                          disabled={!localFilters.orderBy}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Dirección" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asc">Ascendente</SelectItem>
                            <SelectItem value="desc">Descendente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                        className="flex items-center space-x-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Limpiar</span>
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={applyFilters}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Aplicar Filtros
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4" />
                <span>Limpiar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filtros activos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600 font-medium">Filtros activos:</span>
            
            {filters.search && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Búsqueda: "{filters.search}"</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleFilterChange('search', '')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.level && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Nivel: {filters.level}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleFilterChange('level', undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.isActive !== undefined && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Estado: {filters.isActive ? 'Activo' : 'Inactivo'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleFilterChange('isActive', undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}