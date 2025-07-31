//src\components\students\StudentList.tsx
'use client'
// React & Next Imports
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'

// Context & Hooks Imports
import { useStudentContext } from '@/context/StudentContext'
import { usePagination } from '@/hooks/usePagination'

// Utility Imports
import { cn } from '@/lib/utils'
import { getRoleBadgeColor } from '@/utils/RoleBadgeColor'
import { getInitials } from '@/utils/getInitials'

// Icon Imports (Agrupados por paquetes)
// - react-icons/fi
import {
    FiGrid,
    FiList,
    FiMail,
    FiPhone,
    FiCalendar,
    FiMapPin,
    FiMoreVertical,
    FiEye,
    FiEdit,
    FiTrash,
    FiUser,
    FiSearch,
    FiArrowUp,
    FiArrowDown,
    FiFilter,
    FiUsers,
    FiActivity,
    FiHeart,
    FiBook,
    FiFeather,
    FiStar
} from 'react-icons/fi'

// - Otros paquetes de iconos
import { FaMale, FaFemale } from 'react-icons/fa'
import { CiBoxList } from 'react-icons/ci'
import { IoClose } from 'react-icons/io5'
import { CgPlayListRemove } from 'react-icons/cg'

// UI Component Imports (Agrupados por categoría)
// - Componentes básicos
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// - Componentes de Card
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter
} from '@/components/ui/card'

// - Componentes de Table
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from '@/components/ui/table'

// - Componentes de Dropdown
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

// - Componentes de Select
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from '@/components/ui/select'

// - Componentes de Tooltip
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent
} from '@/components/ui/tooltip'

// Custom Component Imports
import Pagination from '@/components/tables/Pagination'
import { NoResultsFound } from '@/components/users/NoResultsFound'
import { ModalWarningConfirm } from '@/components/ui/modal/ModalWarningConfirm'
import { StudentDataTable } from '@/components/students/StudentDataTable'
import { StudentCard } from '@/components/students/StudentCard'

export const StudentList = () => {
    // Hooks y contextos
    const { student, fetchUsers } = useStudentContext();
    const router = useRouter();
    const { setIsExpanded } = useSidebar();

    // Estados de UI
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

    // Estados de filtrado y búsqueda
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGender, setSelectedGender] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [itemsPerPage, setItemsPerPage] = useState<number>(9);

    // Estado del modal
    const [warningModal, setWarningModal] = useState({
        isOpen: false,
        userId: null as number | null,
        isActive: false,
    });



    // Datos derivados (ordenamiento)
    const sortedStudents = [...student].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    // Datos derivados (filtrado)
    const filteredUsers = sortedStudents.filter((student) => {
        const matchSearch =
            student.givenNames.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.lastNames.toLowerCase().includes(searchQuery.toLowerCase());

        const matchGender = selectedGender
            ? student.gender === selectedGender
            : true;

        const matchStatus = selectedStatus
            ? selectedStatus === "activo"
                ? student.enrollmentStatus === 'active'
                : student.enrollmentStatus === 'inactive'
            : true;

        return matchSearch && matchGender && matchStatus;
    });

    // Handlers
    const handleOpenFilters = () => {
        setShowFilters(true);
        setIsExpanded(false);
    };

    const handleResetFilters = () => {
        setSearchQuery("");
        setSelectedGender(null);
        setSelectedStatus(null);
    };

    const openStatusModal = (userId: number, isActive: boolean) => {
        setWarningModal({
            isOpen: true,
            userId,
            isActive,
        });
    };


    // Constantes de paginación
    const {
        paginatedData,
        currentPage,
        totalPages,
        handlePageChange,
        totalItems,
    } = usePagination(filteredUsers, itemsPerPage);

    


    return (
        <div className="flex relative transition-all duration-300">
            <div className={`flex-1 transition-all duration-300 ${showFilters ? 'mr-80' : ''}`}>
                <div className="space-y-4">
                    <div className="space-y-4 mb-4">
                        {/* Primera fila: título + controles */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="flex items-center text-xl font-bold ml-1 sm:ml-5">
                                <CiBoxList className="mr-2" />
                                {filteredUsers.length === student.length
                                    ? `Total de usuarios: ${student.length}`
                                    : `Usuarios encontrados: ${filteredUsers.length}`}
                            </h2>

                            <div className="flex items-center gap-2 ml-1 sm:ml-0">
                                <div className="inline-flex rounded-md shadow-sm" role="group">
                                    <Button
                                        variant={viewMode === 'cards' ? 'default' : 'outline'}
                                        onClick={() => setViewMode('cards')}
                                        className="rounded-r-none"
                                    >
                                        <FiGrid className="mr-2 h-4 w-4" />
                                        Tarjetas
                                    </Button>
                                    <Button
                                        variant={viewMode === 'table' ? 'default' : 'outline'}
                                        onClick={() => setViewMode('table')}
                                        className="rounded-l-none"
                                    >
                                        <FiList className="mr-2 h-4 w-4" />
                                        Lista
                                    </Button>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={handleOpenFilters}
                                    className="flex items-center gap-2"
                                >
                                    <FiFilter className="h-4 w-4" />
                                    Filtrar
                                </Button>
                            </div>
                        </div>

                        {/* Segunda fila: búsqueda + ordenamiento */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ml-1 sm:ml-5">
                            <div className="relative max-w-sm w-full">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Buscar Alumno..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Botones de orden */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Ordenar por fecha:</span>
                                <Button
                                    size="icon"
                                    variant={sortOrder === 'asc' ? 'default' : 'outline'}
                                    onClick={() => setSortOrder('asc')}
                                    title="Ascendente"
                                >
                                    <FiArrowUp className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant={sortOrder === 'desc' ? 'default' : 'outline'}
                                    onClick={() => setSortOrder('desc')}
                                    title="Descendente"
                                >
                                    <FiArrowDown className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        {/* Tercera fila: paginación y mostrar */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ml-1 sm:ml-5">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium">Mostrar:</p>
                                <Select
                                    value={itemsPerPage.toString()}
                                    onValueChange={(value) => {
                                        setItemsPerPage(Number(value));
                                        handlePageChange(1);
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-[80px]">
                                        <SelectValue placeholder={itemsPerPage.toString()} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[3, 9, 18, 21, 24].map((size) => (
                                            <SelectItem key={size} value={size.toString()}>
                                                {size}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                            </div>

                            {/* Aquí iría el componente Pagination si lo tienes */}
                        </div>


                    </div>
                </div>

                {filteredUsers.length === 0 ? (
                    <NoResultsFound
                        onResetFilters={handleResetFilters}
                        message="No se encontraron resultados "
                        suggestion="Prueba cambiando los filtros o términos de búsqueda"
                    />
                ) : (

                    viewMode === 'cards' ? (
                        <div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {paginatedData.map((student) => (
                                    <StudentCard
                                        key={student.id}
                                        student={student}
                                        onViewDetails={(id) => console.log("Ver detalles", id)}
                                        onEdit={(id) => router.push(`/students/edit/${id}`)}
                                        onStatusChange={(id, isActive) => openStatusModal(id, isActive)}
                                        className="custom-class-if-needed"
                                    />
                                ))}
                            </div>
                            <div className="flex items-center justify-between px-5 py-4 border-t border-border">
                                <div className="text-sm text-muted-foreground">
                                    Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
                                    {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} usuarios
                                </div>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>

                        </div>


                    ) : (
                        <div
                            className={cn(
                                "shadow-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-primary/20 rounded-xl   dark:border-gray-800 dark:bg-white/[0.03]",
                                "bg-white"
                            )}
                        >
                            <StudentDataTable data={filteredUsers} />
                        </div>


                    )


                )}


                {showFilters && (
                    <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-lg z-90001 flex flex-col border-l border-border">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <h3 className="text-lg font-semibold">Filtros</h3>





                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowFilters(false)}
                            >
                                <IoClose className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="p-4 space-y-4 overflow-y-auto">





                            {/* Género */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Género</label>
                                <Select
                                    onValueChange={(value) => setSelectedGender(value === "all" ? null : value)}
                                    value={selectedGender ?? "all"}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Seleccionar género" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[90002]">
                                        <SelectItem value="all">Todos los géneros</SelectItem>
                                        <SelectItem value="Masculino">Masculino</SelectItem>
                                        <SelectItem value="Femenino">Femenino</SelectItem>
                                        <SelectItem value="other">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Estado */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Estado</label>
                                <Select
                                    onValueChange={(value) => setSelectedStatus(value === "all" ? null : value)}
                                    value={selectedStatus ?? "all"}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[90002]">
                                        <SelectItem value="all">Todos los estados</SelectItem>
                                        <SelectItem value="activo">Activo</SelectItem>
                                        <SelectItem value="inactivo">Inactivo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>






                        </div>
                    </div>
                )}


            </div>
        </div>
    );
} 
