// components/academic-weeks/academic-weeks.tsx
"use client";

import React, { useState } from 'react';
import { Plus, Calendar, Clock, Filter, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useAcademicWeekContext,
  useCurrentAcademicWeek,
  useAcademicWeekStats
} from '@/context/AcademicWeeksContext';
import { AcademicWeekFilters } from '@/types/academic-week.types';
import { AcademicWeekCard } from './academic-week-card';
import { CreateWeekDialog } from './create-week-dialog';
import { CurrentWeekCard } from './current-week-card';
import { WeekFilters } from './week-filters';
import { WeekStats } from './week-stats';
import ProtectedContent from '@/components/common/ProtectedContent';


export default function ContentAcademicWeeks() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const {
    weeks,
    filters,
    setFilters,
    isLoading,
    isError,
    error
  } = useAcademicWeekContext();

  const { week: currentWeek, isActive } = useCurrentAcademicWeek();
  const stats = useAcademicWeekStats();

  // Filtrar semanas por término de búsqueda
  const filteredWeeks = weeks.filter(week => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      week.objectives?.toLowerCase().includes(term) ||
      week.bimester?.name?.toLowerCase().includes(term) ||
      week.number.toString().includes(term)
    );
  });

  if (isError) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error al cargar semanas académicas</CardTitle>
            <CardDescription className="text-red-600">
              {error?.message || 'Ha ocurrido un error inesperado'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedContent requiredPermission={{ module: 'academic-week', action: 'read' }}>

      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-6 space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                Semanas Académicas
              </h1>
              <p className="text-slate-600 mt-1">
                Gestiona y organiza las semanas del calendario académico
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-slate-200"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Semana
              </Button>
            </div>
          </div>

          {/* Estadísticas */}
          <WeekStats isLoading={isLoading} />

          {/* Semana Actual */}
          {isActive && currentWeek && (
            <CurrentWeekCard week={currentWeek} />
          )}

          {/* Filtros */}
          {showFilters && (
            <WeekFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClose={() => setShowFilters(false)}
            />
          )}

          {/* Barra de búsqueda */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por objetivos, bimestre o número de semana..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 rounded"></div>
                      <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Lista de semanas */}
          {!isLoading && (
            <>
              {filteredWeeks.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        No hay semanas académicas
                      </h3>
                      <p className="text-slate-600 mb-4">
                        {searchTerm
                          ? 'No se encontraron semanas que coincidan con tu búsqueda'
                          : 'Comienza creando tu primera semana académica'
                        }
                      </p>
                      {!searchTerm && (
                        <Button
                          onClick={() => setIsCreateOpen(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Primera Semana
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      {filteredWeeks.length} semana{filteredWeeks.length !== 1 ? 's' : ''} encontrada{filteredWeeks.length !== 1 ? 's' : ''}
                    </p>
                    {Object.keys(filters).length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFilters({})}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        Limpiar filtros
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredWeeks.map((week) => (
                      <AcademicWeekCard
                        key={week.id}
                        week={week}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Dialog para crear semana */}
          <CreateWeekDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
          />
        </div>
      </div>
    </ProtectedContent>
  );
}