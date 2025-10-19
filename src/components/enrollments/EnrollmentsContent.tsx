//src\components\enrollments\EnrollmentsContent.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useEnrollment } from '@/hooks/useEnrollment';
import {
  Users,
  GraduationCap,
  ArrowRightLeft,
  Plus,
  Filter,
  Table as TableIcon,
  Grid3X3,
  Download,
  MoreHorizontal,
  Search,
  RefreshCw,
  BookOpen,
  School,
  ChevronDown,
  Star,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import EnrollmentTable from '@/components/enrollments/EnrollmentTable';
import EnrollmentCards from '@/components/enrollments/EnrollmentCards';
import EnrollmentFilters from '@/components/enrollments/EnrollmentFilters';
import CreateEnrollmentModal from '@/components/enrollments/CreateEnrollmentModal';

// ✅ CAMBIO: Wrapper adaptado al hook
function CreateEnrollmentModalWrapper({ onClose }: { onClose: () => void }) {
  const { createEnrollmentItem, isSubmitting } = useEnrollment();

  return (
    <CreateEnrollmentModal
      onClose={onClose}
      createEnrollment={createEnrollmentItem}
      isSubmitting={isSubmitting}
    />
  );
}

export default function EnrollmentsContent() {
  const {
    formData,
    isLoading,
    isLoadingFormData,
    isSubmitting,
    error,
    loadFormData,
    loadEnrollments,
    bulkGraduate,
    bulkTransfer,
    enrollments: hookEnrollments
  } = useEnrollment({
    autoLoadFormData: true,
    autoLoadEnrollments: false, // ✅ NO auto-cargar, lo manejamos aquí
    onSuccess: (message) => toast.success(message),
    onError: (error) => toast.error(error)
  });

  // ✅ ARREGLO DEL FILTRO: Usar state para controlar los enrollments filtrados
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);

  const [activeView, setActiveView] = useState<'table' | 'cards'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const getFilteredEnrollments = () => {
    if (!formData) return [];
    
    let filtered = hasAppliedFilters ? hookEnrollments : (formData.enrollments || []);
    
    // ✅ ENRIQUECER: Hacer join con students, grades y cycle
    const enrichedEnrollments = filtered.map(enrollment => {
      // Buscar el estudiante completo
      const student = formData.students?.find(s => s.id === enrollment.studentId);
      
      // Buscar el grado
      const gradeData = formData.grades?.find(g => g.id === enrollment.gradeId);
      
      // Buscar la sección dentro del grado
      const section = gradeData?.sections?.find(s => s.id === enrollment.sectionId);
      
      // Obtener nombre del ciclo
      const cycleName = formData.activeCycle?.name || `Ciclo ${enrollment.cycleId}`;
      
      // ✅ Calcular edad desde birthDate
      const calculateAge = (birthDate: string | undefined) => {
        if (!birthDate) return '-';
        try {
          const today = new Date();
          const birth = new Date(birthDate);
          let age = today.getFullYear() - birth.getFullYear();
          const monthDiff = today.getMonth() - birth.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
          }
          return age.toString();
        } catch {
          return '-';
        }
      };
      
      return {
        // Datos base de enrollment
        id: enrollment.id,
        studentId: enrollment.studentId,
        cycleId: enrollment.cycleId,
        gradeId: enrollment.gradeId,
        sectionId: enrollment.sectionId,
        status: enrollment.status,
        
        // ✅ DATOS DESNORMALIZADOS - Para mostrar en tabla
        studentName: enrollment.studentName || student?.fullName || 'Sin nombre',
        studentProfilePicture: enrollment.studentProfilePicture || student?.profilePicture || null,
        gradeName: enrollment.gradeName || gradeData?.name || '',
        sectionName: enrollment.sectionName || section?.name || '',
        cycleName: cycleName, // ✅ NOMBRE del ciclo
        age: calculateAge(student?.birthDate), // ✅ EDAD calculada
        
        // Datos adicionales útiles
        studentBirthDate: student?.birthDate,
        gradeLevel: gradeData?.level,
        teacherName: section?.teacher?.fullName,
        teacherEmail: section?.teacher?.email,
      };
    });
    
    // Aplicar filtro de búsqueda
    if (searchTerm.trim()) {
      return enrichedEnrollments.filter(enrollment =>
        enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return enrichedEnrollments;
  };



  const enrollments = getFilteredEnrollments();



 const isLoadingEnrollments = isLoading || isLoadingFormData;
  const isLoadingStats = isLoadingFormData;

  // ✅ Cargar matrículas al montar el componente UNA SOLA VEZ
  useEffect(() => {
    if (!hasAppliedFilters && hookEnrollments.length === 0 && formData?.enrollments && formData.enrollments.length > 0) {
      // Los datos ya están en formData, no necesitan recarga
      console.log('✅ Datos de matrículas listos desde formData');
    }
  }, []);

  // ✅ Función para refrescar datos
  const handleRefresh = async () => {
    try {
      await loadFormData();
      setHasAppliedFilters(false);
      setSelectedIds([]);
      toast.success('Datos actualizados correctamente');
    } catch (error) {
      toast.error('Error al actualizar los datos');
    }
  };

  // Calcular estadísticas en tiempo real
  const calculateRealTimeStats = () => {
    if (!formData) {
      return {
        total: 0,
        active: 0,
        graduated: 0,
        transferred: 0
      };
    }

    const enrollmentsList = formData.enrollments || [];
    const total = enrollmentsList.length;
    const active = enrollmentsList.filter(e => e.status === 'active').length;
    const graduated = enrollmentsList.filter(e => e.status === 'graduated').length;
    const transferred = enrollmentsList.filter(e => e.status === 'transferred').length;

    return { total, active, graduated, transferred };
  };




  const currentStats = calculateRealTimeStats();

  // Calcular porcentajes y tendencias
  const calculateStatsWithTrends = () => {
    const { total, active, graduated, transferred } = currentStats;

    return [
      {
        title: "Total Matrículas",
        value: total,
        icon: Users,
        bgColor: "bg-blue-100",
        textColor: "text-blue-600",
        description: "En todos los ciclos",
        change: "Sistema completo",
        percentage: 100,
        trend: "stable"
      },
      {
        title: "Estudiantes Activos",
        value: active,
        icon: BookOpen,
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        description: "Cursando actualmente",
        change: total > 0 ? `${Math.round((active / total) * 100)}% del total` : "0%",
        percentage: total > 0 ? (active / total) * 100 : 0,
        trend: "up"
      },
      {
        title: "Graduados",
        value: graduated,
        icon: GraduationCap,
        bgColor: "bg-purple-100",
        textColor: "text-purple-600",
        description: "Completaron estudios",
        change: total > 0 ? `${Math.round((graduated / total) * 100)}% del total` : "0%",
        percentage: total > 0 ? (graduated / total) * 100 : 0,
        trend: "up"
      },
      {
        title: "Transferidos",
        value: transferred,
        icon: ArrowRightLeft,
        bgColor: "bg-orange-100",
        textColor: "text-orange-600",
        description: "Nuevos horizontes",
        change: total > 0 ? `${Math.round((transferred / total) * 100)}% del total` : "0%",
        percentage: total > 0 ? (transferred / total) * 100 : 0,
        trend: "stable"
      }
    ];
  };

  const statsWithTrends = calculateStatsWithTrends();

  // ✅ ARREGLO: Manejo correcto de filtros
  const handleFiltersChange = async (filters: any) => {
    console.log('✅ Filtros aplicados:', filters);
    try {
      // loadEnrollments actualiza hookEnrollments automáticamente
      await loadEnrollments(filters);
      setHasAppliedFilters(true);
      setSelectedIds([]);
      toast.success('Filtros aplicados correctamente');
    } catch (error) {
      toast.error('Error al aplicar filtros');
      console.error('Error applying filters:', error);
    }
  };

  // Manejo de selección múltiple
  const handleSelectionChange = (ids: number[]) => {
    setSelectedIds(ids);
  };

  // Helpers para selección
  const hasSelection = selectedIds.length > 0;
  const clearSelection = () => setSelectedIds([]);
  const isBulkOperating = isSubmitting;

  // Manejo de acciones masivas
  const handleBulkGraduateAction = async () => {
    if (!hasSelection) {
      toast.warning('Selecciona al menos una matrícula');
      return;
    }

    try {
      await bulkGraduate(selectedIds);
      clearSelection();
      await loadFormData();
    } catch (error) {
      toast.error('Error al graduar las matrículas seleccionadas');
    }
  };

  const handleBulkTransferAction = async () => {
    if (!hasSelection) {
      toast.warning('Selecciona al menos una matrícula');
      return;
    }

    try {
      await bulkTransfer(selectedIds);
      clearSelection();
      await loadFormData();
    } catch (error) {
      toast.error('Error al transferir las matrículas seleccionadas');
    }
  };



  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsWithTrends.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Clean Search and Filters */}
      <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre de estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0 bg-white/50 dark:bg-gray-800/50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              {showFilters && (
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-600">
                  ON
                </Badge>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleRefresh}
              className="shrink-0 bg-white/50 dark:bg-gray-800/50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refrescar
            </Button>
          </div>

          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleContent>
              <div className="pt-4">
                <Separator className="mb-4" />
                <EnrollmentFilters onFiltersChange={handleFiltersChange} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Clean Action Toolbar */}
      {hasSelection && selectedIds.length > 0 && (
        <Card className="bg-orange-50/70 dark:bg-orange-900/20 backdrop-blur-sm border border-orange-200 dark:border-orange-800 shadow-lg">
          <CardContent className="flex items-center justify-between py-4 px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <UserCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  {selectedIds.length} seleccionados
                </Badge>
                <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                  Acciones masivas disponibles
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkGraduateAction}
                disabled={isBulkOperating}
                className="bg-white/50 dark:bg-gray-800/50 border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                {isBulkOperating ? 'Graduando...' : 'Graduar Seleccionados'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkTransferAction}
                disabled={isBulkOperating}
                className="bg-white/50 dark:bg-gray-800/50 border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                {isBulkOperating ? 'Transfiriendo...' : 'Transferir Seleccionados'}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isBulkOperating}
                    className="bg-white/50 dark:bg-gray-800/50 border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white/90 dark:bg-gray-900/90 backdrop-blur">
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Seleccionados
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    Eliminar Seleccionados
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearSelection()}
                disabled={isBulkOperating}
                className="text-orange-700 hover:bg-orange-100"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50/70 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800">
          <CardContent className="py-4 px-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Clean Main Content Tabs */}
      <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <CardTitle className="text-gray-900 dark:text-white">
                  Listado de Matrículas {hasAppliedFilters && '(Filtrado)'}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {isLoadingEnrollments ? (
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded inline-block" />
                  ) : (
                    `${enrollments?.length || 0} matrícula(s)${searchTerm || hasAppliedFilters ? ' encontrada(s)' : ''}`
                  )}
                </CardDescription>
              </div>
            </div>

            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'table' | 'cards')}>
              <TabsList className="bg-gray-100 dark:bg-gray-800">
                <TabsTrigger value="table" className="flex items-center gap-2">
                  <TableIcon className="h-4 w-4" />
                  Tabla
                </TabsTrigger>
                <TabsTrigger value="cards" className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  Cards
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'table' | 'cards')}>
            <TabsContent value="table" className="mt-0">
              <EnrollmentTable 
              enrollments={enrollments}  // ✅ YA normalizados
              selectedItems={selectedIds}
              onSelectionChange={handleSelectionChange}
            />
            </TabsContent>

            <TabsContent value="cards" className="mt-0">
               <EnrollmentCards 
              enrollments={enrollments}  // ✅ YA normalizados
              selectedItems={selectedIds}
              onSelectionChange={handleSelectionChange}
            /> 
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>


      {/* Clean Floating Action Button */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogTrigger asChild>
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              size="lg"
              className="rounded-full h-14 w-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </DialogTrigger>
        <CreateEnrollmentModalWrapper onClose={() => setIsCreateModalOpen(false)} />
      </Dialog>

    </div>
  );
}