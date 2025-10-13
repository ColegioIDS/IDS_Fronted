'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
// ✅ CORREGIDO: Usar el nuevo hook del context
import { useStudentList } from '@/context/StudentContext'
import { usePagination } from '@/hooks/usePagination'
import { cn } from '@/lib/utils'

// Icons
import {
    Grid3X3,
    List,
    Search,
    Filter,
    SortAsc,
    SortDesc,
    Users,
    X,
    ChevronDown,
    ChevronUp,
    UserPlus,
    Calendar,
    GraduationCap,
    MapPin,
    RefreshCw
} from 'lucide-react'

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from '@/components/ui/select'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'

// Custom Components
import Pagination from '@/components/tables/Pagination'
import { NoResultsFound } from '@/components/users/NoResultsFound'
import { ModalWarningConfirm } from '@/components/ui/modal/ModalWarningConfirm'
import { StudentDataTable } from '@/components/students/StudentDataTable'
import { StudentCard } from '@/components/students/StudentCard'
import Loading from '@/components/loading/loading'
import { useAuth } from '@/context/AuthContext'
import ProtectedContent from '@/components/common/ProtectedContent'


type ViewMode = 'cards' | 'table'
type SortOrder = 'asc' | 'desc'
type FilterStatus = 'all' | 'active' | 'inactive' | 'graduated' | 'transferred'
type FilterGender = 'all' | 'Masculino' | 'Femenino' | 'other'
type SortBy = 'date' | 'name' | 'age'
type AgeRange = 'all' | '3-5' | '6-8' | '9-11' | '12-14' | '15+'

interface Filters {
    search: string
    gender: FilterGender
    status: FilterStatus
    sortBy: SortBy
    sortOrder: SortOrder
    ageRange: AgeRange
    grade: string
    hasTransport: 'all' | 'yes' | 'no'
    hasMedicalInfo: 'all' | 'yes' | 'no'
}

export const StudentList = () => {
    const {
        students,
        meta,
        loading,
        error,
        filters: contextFilters,
        handleFilterChange,
        handleDelete,
        refetch
    } = useStudentList()

    const router = useRouter()
    const { setIsExpanded } = useSidebar()
    const hasInitiallyFetched = useRef(false)

    const [viewMode, setViewMode] = useState<ViewMode>('cards')
    const [itemsPerPage, setItemsPerPage] = useState(12)
    const [isFiltersOpen, setIsFiltersOpen] = useState(false)


    // ✅ NUEVO: Obtener el rol del usuario autenticado
    const { hasPermission } = useAuth()
    const canRead = hasPermission('student', 'read')
    const canCreate = hasPermission('student', 'create')
    const canUpdate = hasPermission('student', 'update')
    const canDelete = hasPermission('student', 'delete')
    const canChangeStatus = hasPermission('student', 'change-status')

    // Local Filter States (para UI, luego se sincronizan con el context)
    const [localFilters, setLocalFilters] = useState<Filters>({
        search: '',
        gender: 'all',
        status: 'all',
        sortBy: 'date',
        sortOrder: 'desc',
        ageRange: 'all',
        grade: 'all',
        hasTransport: 'all',
        hasMedicalInfo: 'all'
    })

    // Modal State
    const [warningModal, setWarningModal] = useState({
        isOpen: false,
        userId: null as number | null,
        isActive: false,
    })

    // ✅ NUEVO: Cargar estudiantes al montar el componente
    useEffect(() => {
        if (canRead && !hasInitiallyFetched.current && students.length === 0 && !loading) {
            hasInitiallyFetched.current = true
            refetch()
        }
    }, [canRead, students.length, loading, refetch])

    // ✅ NUEVO: Sincronizar filtros locales con el context
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            // Convertir filtros locales al formato del context
            const contextFiltersUpdate = {
                search: localFilters.search,
                // Agregar más filtros según lo que soporte el context
                status: localFilters.status !== 'all' ? localFilters.status : undefined,
            }

            handleFilterChange(contextFiltersUpdate)
        }, 300) // Debounce de 300ms

        return () => clearTimeout(debounceTimer)
    }, [localFilters, handleFilterChange])

    // Update local filter function
    const updateLocalFilter = (key: keyof Filters, value: any) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }))
    }

    // Reset filters
    const resetFilters = () => {
        setLocalFilters({
            search: '',
            gender: 'all',
            status: 'all',
            sortBy: 'date',
            sortOrder: 'desc',
            ageRange: 'all',
            grade: 'all',
            hasTransport: 'all',
            hasMedicalInfo: 'all'
        })
        // También limpiar filtros del context
        handleFilterChange({})
    }

    // Calculate age from birth date
    const calculateAge = (birthDate: string | Date | null | undefined) => {
        if (!birthDate) return null
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    const processedStudents = students
        .filter(student => {
            // Gender filter (local)
            const matchesGender = localFilters.gender === 'all' || student.gender === localFilters.gender

            // Age filter (local)
            const age = calculateAge(student.birthDate)
            const matchesAge = localFilters.ageRange === 'all' || !age || (
                (localFilters.ageRange === '3-5' && age >= 3 && age <= 5) ||
                (localFilters.ageRange === '6-8' && age >= 6 && age <= 8) ||
                (localFilters.ageRange === '9-11' && age >= 9 && age <= 11) ||
                (localFilters.ageRange === '12-14' && age >= 12 && age <= 14) ||
                (localFilters.ageRange === '15+' && age >= 15)
            )

            // Grade filter (local)
            const activeEnrollment = student.enrollments?.find(e => e.status === 'active')
            const studentGrade = activeEnrollment?.gradeId?.toString() || 'none'
            const matchesGrade = localFilters.grade === 'all' || studentGrade === localFilters.grade

            // Transport filter (local)
            const hasTransport = student.busService?.hasService || false
            const matchesTransport = localFilters.hasTransport === 'all' ||
                (localFilters.hasTransport === 'yes' && hasTransport) ||
                (localFilters.hasTransport === 'no' && !hasTransport)

            // Medical info filter (local)
            const hasMedicalInfo = !!student.medicalInfo
            const matchesMedicalInfo = localFilters.hasMedicalInfo === 'all' ||
                (localFilters.hasMedicalInfo === 'yes' && hasMedicalInfo) ||
                (localFilters.hasMedicalInfo === 'no' && !hasMedicalInfo)

            return matchesGender && matchesAge && matchesGrade && matchesTransport && matchesMedicalInfo
        })
        .sort((a, b) => {
            let valueA: any, valueB: any

            switch (localFilters.sortBy) {
                case 'name':
                    valueA = `${a.givenNames} ${a.lastNames}`.toLowerCase()
                    valueB = `${b.givenNames} ${b.lastNames}`.toLowerCase()
                    break
                case 'age':
                    valueA = calculateAge(a.birthDate) || 0
                    valueB = calculateAge(b.birthDate) || 0
                    break
                case 'date':
                default:
                    valueA = a.createdAt ? new Date(a.createdAt).getTime() : 0
                    valueB = b.createdAt ? new Date(b.createdAt).getTime() : 0
                    break
            }

            if (localFilters.sortBy === 'name') {
                return localFilters.sortOrder === 'asc'
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA)
            } else {
                return localFilters.sortOrder === 'asc' ? valueA - valueB : valueB - valueA
            }
        })

    // Pagination
    const {
        paginatedData,
        currentPage,
        totalPages,
        handlePageChange,
        totalItems,
    } = usePagination(processedStudents, itemsPerPage)

    // ✅ CORREGIDO: Handlers con el nuevo context
    const handleStatusChange = async (userId: number, isActive: boolean) => {
        setWarningModal({
            isOpen: true,
            userId,
            isActive,
        })
    }

    const confirmStatusChange = async () => {
        if (warningModal.userId) {
            const result = await handleDelete(warningModal.userId)
            if (result.success) {
                console.log('Status change confirmed')
            }
        }
        setWarningModal({ isOpen: false, userId: null, isActive: false })
    }

    // Active filters count
    const activeFiltersCount = Object.entries(localFilters).filter(([key, value]) => {
        if (key === 'search') return value.length > 0
        if (key === 'sortBy' || key === 'sortOrder') return false
        return value !== 'all'
    }).length

    // Get unique grades for filter
    const availableGrades = Array.from(new Set(
        students
            .map(s => s.enrollments?.find(e => e.status === 'active')?.gradeId)
            .filter(Boolean)
    )).sort((a, b) => (a || 0) - (b || 0))

    


    return (

        <ProtectedContent requiredPermission={{ module: "student", action: "read" }}>
            <div className="space-y-6">

        {/* Loading State */}
                {loading && students.length === 0 ? (
                    <>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Estudiantes</h1>
                                <p className="text-sm text-muted-foreground">Cargando...</p>
                            </div>
                        </div>
                        <Loading variant="spinner" size="lg" text="Cargando estudiantes..." />
                    </>
                ) : error ? (
                    // ✅ Error State (dentro de ProtectedContent)
                    <>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Estudiantes</h1>
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        </div>
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-red-600 mb-4">Error al cargar estudiantes</p>
                                <Button onClick={refetch}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Reintentar
                                </Button>
                            </CardContent>
                        </Card>
                    </>
                ) : (

                      <>


                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Estudiantes</h1>
                            <p className="text-sm text-muted-foreground">
                                {processedStudents.length === students.length
                                    ? `${students.length} estudiantes en total`
                                    : `${processedStudents.length} de ${students.length} estudiantes`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button onClick={() => router.push('/students/create')}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Nuevo Estudiante
                        </Button>
                        <Button variant="outline" onClick={refetch} disabled={loading}>
                            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {/* Search and Quick Controls */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre o código SIRE..."
                                        value={localFilters.search}
                                        onChange={(e) => updateLocalFilter('search', e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {/* Quick Filters */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Status Quick Filter */}
                                    <Select
                                        value={localFilters.status}
                                        onValueChange={(value: FilterStatus) => updateLocalFilter('status', value)}
                                    >
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="active">Activos</SelectItem>
                                            <SelectItem value="inactive">Inactivos</SelectItem>
                                            <SelectItem value="graduated">Graduados</SelectItem>
                                            <SelectItem value="transferred">Transferidos</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* View Mode Toggle */}
                                    <div className="flex rounded-lg border">
                                        <Button
                                            variant={viewMode === 'cards' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('cards')}
                                            className="rounded-r-none"
                                        >
                                            <Grid3X3 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'table' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('table')}
                                            className="rounded-l-none"
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Advanced Filters Toggle */}
                                    <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Filter className="h-4 w-4 mr-2" />
                                                Filtros
                                                {activeFiltersCount > 0 && (
                                                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                                                        {activeFiltersCount}
                                                    </Badge>
                                                )}
                                                {isFiltersOpen ? (
                                                    <ChevronUp className="h-4 w-4 ml-2" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 ml-2" />
                                                )}
                                            </Button>
                                        </CollapsibleTrigger>
                                    </Collapsible>
                                </div>
                            </div>

                            {/* Advanced Filters Section */}
                            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                                <CollapsibleContent className="space-y-4">
                                    <div className="border-t pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                            {/* Gender Filter */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Género</label>
                                                <Select
                                                    value={localFilters.gender}
                                                    onValueChange={(value: FilterGender) => updateLocalFilter('gender', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Todos</SelectItem>
                                                        <SelectItem value="Masculino">Masculino</SelectItem>
                                                        <SelectItem value="Femenino">Femenino</SelectItem>
                                                        <SelectItem value="other">Otro</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Age Range Filter */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Edad</label>
                                                <Select
                                                    value={localFilters.ageRange}
                                                    onValueChange={(value: AgeRange) => updateLocalFilter('ageRange', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Todas las edades</SelectItem>
                                                        <SelectItem value="3-5">3-5 años</SelectItem>
                                                        <SelectItem value="6-8">6-8 años</SelectItem>
                                                        <SelectItem value="9-11">9-11 años</SelectItem>
                                                        <SelectItem value="12-14">12-14 años</SelectItem>
                                                        <SelectItem value="15+">15+ años</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Grade Filter */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Grado</label>
                                                <Select
                                                    value={localFilters.grade}
                                                    onValueChange={(value) => updateLocalFilter('grade', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Todos los grados</SelectItem>
                                                        {availableGrades.map((grade) => (
                                                            <SelectItem key={grade} value={grade!.toString()}>
                                                                Grado {grade}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Transport Filter */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Transporte</label>
                                                <Select
                                                    value={localFilters.hasTransport}
                                                    onValueChange={(value) => updateLocalFilter('hasTransport', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Todos</SelectItem>
                                                        <SelectItem value="yes">Con transporte</SelectItem>
                                                        <SelectItem value="no">Sin transporte</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Medical Info Filter */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Info. Médica</label>
                                                <Select
                                                    value={localFilters.hasMedicalInfo}
                                                    onValueChange={(value) => updateLocalFilter('hasMedicalInfo', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Todos</SelectItem>
                                                        <SelectItem value="yes">Con info médica</SelectItem>
                                                        <SelectItem value="no">Sin info médica</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Sort Options */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Ordenar por</label>
                                                <div className="flex gap-2">
                                                    <Select
                                                        value={localFilters.sortBy}
                                                        onValueChange={(value: SortBy) => updateLocalFilter('sortBy', value)}
                                                    >
                                                        <SelectTrigger className="flex-1">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="date">Fecha</SelectItem>
                                                            <SelectItem value="name">Nombre</SelectItem>
                                                            <SelectItem value="age">Edad</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => updateLocalFilter('sortOrder', localFilters.sortOrder === 'asc' ? 'desc' : 'asc')}
                                                    >
                                                        {localFilters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Filter Actions */}
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                            <div className="flex items-center gap-2">
                                                {activeFiltersCount > 0 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={resetFilters}
                                                    >
                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                        Limpiar filtros
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">Elementos por página:</span>
                                                <Select
                                                    value={itemsPerPage.toString()}
                                                    onValueChange={(value) => {
                                                        setItemsPerPage(Number(value))
                                                        handlePageChange(1)
                                                    }}
                                                >
                                                    <SelectTrigger className="w-20">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[6, 12, 24, 48].map((size) => (
                                                            <SelectItem key={size} value={size.toString()}>
                                                                {size}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    </CardContent>
                </Card>

                {/* Content */}
                {processedStudents.length === 0 ? (
                    <NoResultsFound
                        onResetFilters={resetFilters}
                        message="No se encontraron estudiantes"
                        suggestion="Intenta ajustar los filtros o términos de búsqueda"
                    />
                ) : (
                    <div className="space-y-4">
                        {viewMode === 'cards' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                {paginatedData.map((student) => (
                                    <StudentCard
                                        key={student.id}
                                        student={student}
                                        onViewDetails={(id) => router.push(`/students/profile/${id}`)}
                                        onEdit={(id) => router.push(`/students/edit/${id}`)}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <StudentDataTable data={paginatedData} />
                            </Card>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
                                            {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} estudiantes
                                        </div>
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Warning Modal */}
                <ModalWarningConfirm
                    isOpen={warningModal.isOpen}
                    onClose={() => setWarningModal({ isOpen: false, userId: null, isActive: false })}
                    onConfirm={confirmStatusChange}
                    title={warningModal.isActive ? "Desactivar estudiante" : "Activar estudiante"}
                    description={`¿Estás seguro de que deseas ${warningModal.isActive ? 'desactivar' : 'activar'} este estudiante?`}
                    confirmText={warningModal.isActive ? "Desactivar" : "Activar"}
                />
                 </>
                )}
            </div>
        </ProtectedContent>
    )
}