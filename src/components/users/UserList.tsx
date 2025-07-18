'use client'

import { useState } from 'react'
import { useUserContext } from '@/context/UserContext'
import { useSidebar } from '@/context/SidebarContext'
import { usePagination } from '@/hooks/usePagination'
import { cn } from '@/lib/utils'
import { getRoleBadgeColor } from '@/utils/RoleBadgeColor'
import { useRouter } from 'next/navigation';


// Icon Imports
import {
    FiGrid, FiList, FiMail, FiPhone, FiCalendar, FiMapPin,
    FiMoreVertical, FiEye, FiEdit, FiTrash, FiUser, FiSearch
} from 'react-icons/fi'
import { CiBoxList } from 'react-icons/ci'
import { IoClose } from 'react-icons/io5'
import { CgPlayListRemove } from 'react-icons/cg'

// UI Component Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter
} from '@/components/ui/card'
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from '@/components/ui/select'
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent
} from '@/components/ui/tooltip'

// Custom Component Imports
import Pagination from '@/components/tables/Pagination'
import { NoResultsFound } from '@/components/users/NoResultsFound'
import { ModalWarningConfirm } from '@/components/ui/modal/ModalWarningConfirm'



export const UserView = () => {
    // Imports
    const { users, refetchUsers, toggleUserStatus } = useUserContext();
    const { setIsExpanded } = useSidebar();
    const router = useRouter();


    // State declarations
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter states
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
    const [selectedGender, setSelectedGender] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Modal state
    const [warningModal, setWarningModal] = useState({
        isOpen: false,
        userId: null as number | null,
        isActive: false,
    });

    // Derived data
    const sortedUsers = [...users].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const filteredUsers = sortedUsers.filter((user) => {
        const matchSearch = user.givenNames.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.lastNames.toLowerCase().includes(searchQuery.toLowerCase());

        const matchRole = selectedRole ? user.role?.name === selectedRole : true;
        const matchDept = selectedDepartment ? user.address?.department === selectedDepartment : true;
        const matchGender = selectedGender ? user.gender === selectedGender : true;
        const matchStatus = selectedStatus
            ? selectedStatus === "activo"
                ? user.isActive === true
                : user.isActive === false
            : true;

        return matchSearch && matchRole && matchDept && matchGender && matchStatus;
    });

    // Pagination
    const {
        paginatedData,
        currentPage,
        totalPages,
        handlePageChange,
        totalItems,
    } = usePagination(filteredUsers, 6);

    const itemsPerPage = 6;

    // Helper functions
    const getInitials = (givenNames: string, lastNames: string) => {
        return `${givenNames.charAt(0)}${lastNames.charAt(0)}`.toUpperCase();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-GT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Handler functions
    const handleOpenFilters = () => {
        setShowFilters(true);
        setIsExpanded(false);
    };

    const handleResetFilters = () => {
        setSearchQuery("");
        setSelectedRole(null);
        setSelectedDepartment(null);
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

    const confirmToggleStatus = async () => {
        if (warningModal.userId !== null) {
            await toggleUserStatus(warningModal.userId, warningModal.isActive);
            setWarningModal({ isOpen: false, userId: null, isActive: false });
        }
    };



    return (

        <div className="flex relative transition-all duration-300">
            <div className={`flex-1 transition-all duration-300 ${showFilters ? 'mr-80' : ''}`}>


                <div className="space-y-4">
                    <div className="space-y-4 mb-4">
                        {/* Primera fila: título + controles */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="flex items-center text-xl font-bold ml-1 sm:ml-5">
                                <CiBoxList className="mr-2" />
                                {filteredUsers.length === users.length
                                    ? `Total de usuarios: ${users.length}`
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
                                    </Button>
                                    <Button
                                        variant={viewMode === 'table' ? 'default' : 'outline'}
                                        onClick={() => setViewMode('table')}
                                        className="rounded-l-none"
                                    >
                                        <FiList className="mr-2 h-4 w-4" />
                                    </Button>
                                </div>

                                <Button variant="outline" onClick={handleOpenFilters}>
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
                                    placeholder="Buscar usuario..."
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
                                >
                                    <FiCalendar className="h-4 w-4" />
                                    <span className="sr-only">Ascendente</span>
                                </Button>
                                <Button
                                    size="icon"
                                    variant={sortOrder === 'desc' ? 'default' : 'outline'}
                                    onClick={() => setSortOrder('desc')}
                                >
                                    <FiCalendar className="rotate-180 h-4 w-4" />
                                    <span className="sr-only">Descendente</span>
                                </Button>
                            </div>
                        </div>
                    </div>


                    {filteredUsers.length === 0 ? (
                        <NoResultsFound
                            onResetFilters={handleResetFilters}
                            message="No se encontraron usuarios"
                            suggestion="Prueba cambiando los filtros o términos de búsqueda"
                        />
                    ) :

                        viewMode === 'cards' ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {paginatedData.map((user) => (
                                    <Card
                                        key={user.id}
                                        className={cn(
                                            "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 rounded-xl border group dark:border-gray-800 dark:bg-white/[0.03]",
                                            !user.isActive && "opacity-60 grayscale-[0.3]"
                                        )}
                                    >

                                        <CardHeader className="flex flex-row items-start justify-between pb-0 ">
                                            <div className="flex flex-row items-center space-x-4">
                                                <div className="relative">
                                                    <Avatar className="h-14 w-14 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                                                        <AvatarImage
                                                            src={
                                                                user.pictures?.find(p => p.kind === 'profile')?.url ||
                                                                `https://api.dicebear.com/7.x/initials/svg?seed=${user.givenNames} ${user.lastNames}`
                                                            }
                                                        />

                                                        <AvatarFallback className="text-base">
                                                            {getInitials(user.givenNames, user.lastNames)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span
                                                        className={cn(
                                                            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                                                            user.isActive ? "bg-green-500" : "bg-red-500"
                                                        )}
                                                    />

                                                </div>

                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-semibold leading-tight tracking-tight">
                                                        {`${user.givenNames} ${user.lastNames}`}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        {user.role && (
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-xs font-medium py-1 px-2 rounded-md ${getRoleBadgeColor(user.role.name)}`}
                                                            >
                                                                {user.role.name}
                                                            </Badge>
                                                        )}


                                                        {user.isActive ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-green-600 border-green-600 bg-green-100/30"
                                                            >
                                                                Activo
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="destructive" className="text-xs">
                                                                Inactivo
                                                            </Badge>
                                                        )}


                                                    </div>

                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg hover:bg-primary/10"
                                                    >
                                                        <FiMoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end" className="w-48">
                                                    {user.isActive ? (
                                                        <>
                                                            <DropdownMenuItem onClick={() => console.log("Ver", user.id)}>
                                                                <FiEye className="mr-2 h-4 w-4" />
                                                                <span>Ver detalles</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => router.push(`/users/edit/${user.id}`)}>

                                                                <FiEdit className="mr-2 h-4 w-4" />
                                                                <span>Editar</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => openStatusModal(user.id, user.isActive)}
                                                                className="text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                                            >
                                                                <CgPlayListRemove className="mr-2 h-4 w-4" />
                                                                <span>Desactivar cuenta</span>
                                                            </DropdownMenuItem>
                                                        </>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            onClick={() => openStatusModal(user.id, user.isActive)}
                                                            className="text-green-600 focus:bg-green-50 dark:focus:bg-green-900/20"
                                                        >
                                                            <CgPlayListRemove className="mr-2 h-4 w-4" />
                                                            <span>Activar cuenta</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>


                                        </CardHeader>

                                        <CardContent className="pt-4 pb-2  rounded-b-xl ">
                                            <div className="space-y-3 text-sm">
                                                {[
                                                    { icon: <FiMail className="h-4 w-4" />, text: user.email, label: "Correo" },
                                                    { icon: <FiPhone className="h-4 w-4" />, text: user.phone || "No especificado", label: "Teléfono" },
                                                    { icon: <FiCalendar className="h-4 w-4" />, text: user.birthDate ? formatDate(user.birthDate) : "Sin fecha", label: "Fecha de nacimiento" },
                                                    { icon: <FiMapPin className="h-4 w-4" />, text: user.address?.department || "No especificado", label: "Departamento" },
                                                ].map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="p-2 bg-muted rounded-lg flex items-center justify-center">
                                                                    {item.icon}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{item.label}</TooltipContent>
                                                        </Tooltip>
                                                        <span className="truncate">{item.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>

                                        <CardFooter className="pt-0 pb-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full ml-auto border-primary/30 hover:border-primary/50 group transition-all"
                                                onClick={() => console.log("Ver perfil", user.id)}
                                            >
                                                <FiUser className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                                                Ver perfil completo
                                            </Button>
                                        </CardFooter>
                                    </Card>


                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 scroll-custom">

                            <div
                                className={cn(
                                    "shadow-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-primary/20 rounded-xl border group dark:border-gray-800 dark:bg-white/[0.03]",
                                    "bg-white"
                                )}
                            >

                                
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="px-6 py-3 text-muted-foreground text-xs font-semibold uppercase tracking-wider">Usuario</TableHead>
                                            <TableHead className="px-6 py-3 text-muted-foreground text-xs font-semibold uppercase tracking-wider">Contacto</TableHead>
                                            <TableHead className="px-6 py-3 text-muted-foreground text-xs font-semibold uppercase tracking-wider">Rol</TableHead>
                                            <TableHead className="px-6 py-3 text-muted-foreground text-xs font-semibold uppercase tracking-wider">Departamento</TableHead>
                                            <TableHead className="px-6 py-3 text-muted-foreground text-xs font-semibold uppercase tracking-wider">Nacimiento</TableHead>
                                            <TableHead className="px-6 py-3 text-right text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                                Acciones
                                            </TableHead>

                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>


                                        {paginatedData.map((user) => (
                                            <TableRow
                                                key={user.id}
                                                className={cn(
                                                    "hover:bg-muted/40 transition-colors",
                                                    !user.isActive && "opacity-60 grayscale-[0.3]"
                                                )}
                                            >
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex items-center space-x-3 relative">
                                                        <Avatar className="h-9 w-9 ring-1 ring-primary/10">
                                                            <AvatarImage
                                                                src={
                                                                    user.pictures?.find(p => p.kind === 'profile')?.url ||
                                                                    `https://api.dicebear.com/7.x/initials/svg?seed=${user.givenNames} ${user.lastNames}`
                                                                }
                                                            />
                                                            <AvatarFallback>
                                                                {getInitials(user.givenNames, user.lastNames)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span
                                                            className={cn(
                                                                "absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-background",
                                                                user.isActive ? "bg-green-500" : "bg-red-500"
                                                            )}
                                                        />
                                                        <div>
                                                            <div className="font-semibold">
                                                                {`${user.givenNames} ${user.lastNames}`}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                @{user.username || "sin_usuario"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center text-sm">
                                                            <FiMail className="mr-2 h-4 w-4 text-muted-foreground" />
                                                            {user.email || (
                                                                <span className="text-muted-foreground italic">Sin correo</span>
                                                            )}
                                                        </div>
                                                        {user.phone && (
                                                            <div className="flex items-center text-sm">
                                                                <FiPhone className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                {user.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="px-6 py-4 space-y-1">
                                                    {user.role?.name ? (
                                                        <Badge
                                                            className={`text-xs py-1 px-2 ${getRoleBadgeColor(user.role.name)}`}
                                                        >
                                                            {user.role.name}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground italic text-sm">Sin rol</span>
                                                    )}
                                                    <div>
                                                        {user.isActive ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-green-600 border-green-600 bg-green-100/30 text-xs mt-1"
                                                            >
                                                                Activo
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="destructive" className="text-xs mt-1">
                                                                Inactivo
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="px-6 py-4 text-sm">
                                                    {user.address?.department || (
                                                        <span className="text-muted-foreground italic">No asignado</span>
                                                    )}
                                                </TableCell>

                                                <TableCell className="px-6 py-4 text-sm">
                                                    {user.birthDate ? (
                                                        formatDate(user.birthDate)
                                                    ) : (
                                                        <span className="text-muted-foreground italic">Sin fecha</span>
                                                    )}
                                                </TableCell>

                                                <TableCell className="px-6 py-4 text-right space-x-2">
                                                    {/* Ver perfil */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-full border-primary/30 hover:border-primary/50 group"
                                                        onClick={() => console.log("Ver perfil", user.id)}
                                                    >
                                                        <FiUser className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                                                        Ver perfil
                                                    </Button>

                                                    {/* Menú de acciones */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-lg hover:bg-primary/10"
                                                            >
                                                                <FiMoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>

                                                        <DropdownMenuContent align="end" className="w-48">
                                                            {user.isActive ? (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => console.log("Ver", user.id)}>
                                                                        <FiEye className="mr-2 h-4 w-4" />
                                                                        <span>Ver detalles</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => console.log("Editar", user.id)}>
                                                                        <FiEdit className="mr-2 h-4 w-4" />
                                                                        <span>Editar</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() => openStatusModal(user.id, user.isActive)}
                                                                        className="text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                                                    >
                                                                        <CgPlayListRemove className="mr-2 h-4 w-4" />
                                                                        <span>Desactivar cuenta</span>
                                                                    </DropdownMenuItem>
                                                                </>
                                                            ) : (
                                                                <DropdownMenuItem
                                                                    onClick={() => openStatusModal(user.id, user.isActive)}
                                                                    className="text-green-600 focus:bg-green-50 dark:focus:bg-green-900/20"
                                                                >
                                                                    <CgPlayListRemove className="mr-2 h-4 w-4" />
                                                                    <span>Activar cuenta</span>
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>

                                        ))}
                                    </TableBody>
                                </Table>

                                        </div>
                            </div>
                        )}


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

                                {/* Rol */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Rol</label>
                                    <Select
                                        onValueChange={(value) => setSelectedRole(value === "all" ? null : value)}
                                        value={selectedRole ?? "all"}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccionar rol" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[90002]">
                                            <SelectItem value="all">Todos los roles</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="Docente">Docente</SelectItem>
                                            <SelectItem value="Tutor">Tutor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Departamento */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Departamento</label>
                                    <Select
                                        onValueChange={(value) => setSelectedDepartment(value === "all" ? null : value)}
                                        value={selectedDepartment ?? "all"}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccionar departamento" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[90002]">
                                            <SelectItem value="all">Todos los departamentos</SelectItem>
                                            <SelectItem value="Guatemala">Guatemala</SelectItem>
                                            <SelectItem value="Sacatepéquez">Sacatepéquez</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

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




                <ModalWarningConfirm
                    isOpen={warningModal.isOpen}
                    onClose={() => setWarningModal({ isOpen: false, userId: null, isActive: false })}
                    onConfirm={confirmToggleStatus}
                    title={`${warningModal.isActive ? 'Desactivar' : 'Activar'} cuenta`}
                    confirmText='Si, Desactivar'
                    description={
                        <>
                            ¿Estás seguro de que deseas {warningModal.isActive ? 'desactivar' : 'activar'} esta cuenta?
                            <br />
                            {warningModal.isActive
                                ? 'El usuario no podrá acceder a la plataforma hasta que se reactive.'
                                : 'El usuario podrá acceder a la plataforma nuevamente.'}
                        </>
                    }
                />

            </div>
        </div>
    )
}