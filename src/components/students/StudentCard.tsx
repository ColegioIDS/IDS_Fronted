import { cn } from "@/lib/utils"
import { getInitials } from "@/utils/getInitials"
import { Student } from "@/types/student"
import { useRouter } from "next/navigation"
import { FaMale, FaFemale } from "react-icons/fa"
import { 
  FiUsers, 
  FiActivity, 
  FiHeart, 
  FiBook, 
  FiFeather, 
  FiStar, 
  FiCalendar, 
  FiUser, 
  FiEye, 
  FiEdit, 
  FiMoreVertical,
  FiMapPin,
  FiPhone,
  FiMail,
  FiHome
} from "react-icons/fi"
import { 
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineHeart,
  HiOutlineCake
} from "react-icons/hi"
import { CgPlayListRemove } from "react-icons/cg"
import { BsPersonBadge } from "react-icons/bs"
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip'

interface StudentCardProps {
  student: Student
  className?: string
  onViewDetails?: (id: number) => void
  onEdit?: (id: number) => void
  onStatusChange?: (id: number, isActive: boolean) => void
}

export function StudentCard({
  student,
  className,
  onViewDetails = () => {},
  onEdit = () => {},
  onStatusChange = () => {},
}: StudentCardProps) {
  const router = useRouter()

  // Obtener el enrollment activo del estudiante
  const activeEnrollment = student.enrollments?.find(e => e.status === 'active') || student.enrollments?.[0]
  const enrollmentStatus = activeEnrollment?.status || 'inactive'
  const isActive = enrollmentStatus === 'active'

  // Obtener información del grado y sección actual (usando IDs por ahora)
  const currentGradeId = activeEnrollment?.gradeId
  const currentSectionId = activeEnrollment?.sectionId
  // TODO: Aquí deberías obtener los nombres del grado y sección desde el contexto o props
  const currentGrade = currentGradeId ? `Grado ${currentGradeId}` : 'Sin asignar'
  const currentSection = currentSectionId ? `${currentSectionId}` : ''

  const handleViewDetails = () => {
     if (student.id) {
      router.push(`/students/profile/${student.id}`)
      onViewDetails(student.id)
    } 
  }

  const handleEdit = () => {
    if (student.id) {
      router.push(`/students/edit/${student.id}`)
      onEdit(student.id)
    }
  }

  const handleStatusChange = () => {
    if (student.id) {
      onStatusChange(student.id, isActive)
    }
  }

  // Función para formatear la fecha
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'N/A'
    try {
      return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  // Obtener la imagen de perfil
  const profileImage = student.pictures?.find(p => p.kind === 'profile')?.url

  // Calcular edad
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

  const age = calculateAge(student.birthDate)

  // Obtener iniciales con colores aleatorios basados en el nombre
  const getColorFromName = (name: string) => {
    const colors = [
      'from-violet-500 to-purple-600',
      'from-blue-500 to-cyan-600',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-600',
      'from-indigo-500 to-blue-600',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const gradientColor = getColorFromName(student.givenNames)

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-500",
        "hover:shadow-2xl hover:-translate-y-2",
        "bg-gradient-to-br from-white to-gray-50/50",
        "dark:from-gray-900 dark:to-gray-950/50",
        "border-gray-200 dark:border-gray-800",
        !isActive && "opacity-80",
        className
      )}
    >
      {/* Decoración de fondo animada */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-30" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-purple-500/5 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-30" />

      <CardHeader className="relative pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Avatar mejorado con gradiente */}
            <div className="relative">
              <div className={cn(
                "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-20 blur-xl transition-all duration-500 group-hover:opacity-40",
                gradientColor
              )} />
              <Avatar className="h-16 w-16 border-3 border-white dark:border-gray-800 shadow-xl">
                {profileImage ? (
                  <AvatarImage
                    src={profileImage}
                    alt={`${student.givenNames} ${student.lastNames}`}
                    className="object-cover"
                  />
                ) : (
                  <div className={cn(
                    "w-full h-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br",
                    gradientColor
                  )}>
                    {getInitials(student.givenNames, student.lastNames)}
                  </div>
                )}
              </Avatar>
              {/* Status indicator mejorado */}
              <span className={cn(
                "absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-3 border-white dark:border-gray-900",
                "flex items-center justify-center transition-all duration-300",
                isActive ? "bg-gradient-to-br from-green-400 to-emerald-600" : "bg-gradient-to-br from-gray-400 to-gray-600"
              )}>
                <span className={cn(
                  "h-2.5 w-2.5 rounded-full animate-pulse",
                  isActive ? "bg-white" : "bg-gray-300"
                )} />
              </span>
            </div>

            {/* Información del estudiante */}
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {`${student.givenNames} ${student.lastNames}`}
                </h3>
                {student.codeSIRE && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                    <BsPersonBadge className="w-3 h-3" />
                    Código: {student.codeSIRE}
                  </p>
                )}
              </div>
              
              {/* Badges mejorados */}
              <div className="flex items-center gap-2 flex-wrap">
                {isActive ? (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-sm">
                    <FiActivity className="w-3 h-3 mr-1" />
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="shadow-sm">
                    Inactivo
                  </Badge>
                )}
                {currentGrade !== 'Sin asignar' && (
                  <Badge 
                    variant="outline" 
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800"
                  >
                    <HiOutlineAcademicCap className="w-3 h-3 mr-1" />
                    {currentGrade} {currentSection && `• Sección ${currentSection}`}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Menú de opciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg hover:bg-primary/10 transition-all duration-300"
              >
                <FiMoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleViewDetails} className="cursor-pointer">
                <FiEye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                <FiEdit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isActive ? (
                <DropdownMenuItem
                  onClick={handleStatusChange}
                  className="text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
                >
                  <CgPlayListRemove className="mr-2 h-4 w-4" />
                  Desactivar estudiante
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={handleStatusChange}
                  className="text-green-600 focus:bg-green-50 dark:focus:bg-green-900/20 cursor-pointer"
                >
                  <FiActivity className="mr-2 h-4 w-4" />
                  Activar estudiante
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="relative pt-4 pb-3 space-y-4">
        {/* Grid de información mejorado */}
        <div className="grid grid-cols-2 gap-3">
          {/* Edad y cumpleaños */}
          <div className="group/item flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 hover:shadow-md transition-all duration-300">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-sm">
              <HiOutlineCake className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Cumpleaños</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {formatDate(student.birthDate)}
              </p>
              {age !== null && (
                <p className="text-xs text-gray-600 dark:text-gray-300">{age} años</p>
              )}
            </div>
          </div>

          {/* Género */}
          <div className="group/item flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 hover:shadow-md transition-all duration-300">
            <div className={cn(
              "p-2 rounded-lg text-white shadow-sm",
              student.gender === 'Masculino' 
                ? "bg-gradient-to-br from-blue-400 to-blue-600" 
                : student.gender === 'Femenino'
                ? "bg-gradient-to-br from-pink-400 to-pink-600"
                : "bg-gradient-to-br from-gray-400 to-gray-600"
            )}>
              {student.gender === 'Masculino' ? (
                <FaMale className="h-4 w-4" />
              ) : student.gender === 'Femenino' ? (
                <FaFemale className="h-4 w-4" />
              ) : (
                <FiUser className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Género</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {student.gender || 'No especificado'}
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional con diseño mejorado */}
        <div className="space-y-2">
          {/* Hermanos */}
          {(student.siblingsCount !== null && student.siblingsCount !== undefined && student.siblingsCount > 0) && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30">
                <FiUsers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {student.siblingsCount} {student.siblingsCount === 1 ? 'hermano' : 'hermanos'}
                </span>
                <div className="flex items-center gap-2">
                  {student.brothersCount !== undefined && student.brothersCount > 0 && (
                    <span className="flex items-center gap-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                      <FaMale className="text-blue-600 dark:text-blue-400" /> {student.brothersCount}
                    </span>
                  )}
                  {student.sistersCount !== undefined && student.sistersCount > 0 && (
                    <span className="flex items-center gap-0.5 text-xs bg-pink-100 dark:bg-pink-900/30 px-2 py-0.5 rounded-full">
                      <FaFemale className="text-pink-600 dark:text-pink-400" /> {student.sistersCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Intereses y preferencias con iconos coloridos */}
          <div className="grid grid-cols-2 gap-2">
            {student.favoriteSubject && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
                <HiOutlineSparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Materia favorita</p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {student.favoriteSubject}
                  </p>
                </div>
              </div>
            )}

            {student.hobby && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                <FiFeather className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pasatiempo</p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {student.hobby}
                  </p>
                </div>
              </div>
            )}

            {student.favoriteColor && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20">
                <div 
                  className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                  style={{ backgroundColor: student.favoriteColor }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Color favorito</p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {student.favoriteColor}
                  </p>
                </div>
              </div>
            )}

            {student.medicalInfo && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
                <HiOutlineHeart className="h-4 w-4 text-red-600 dark:text-red-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Salud</p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {student.medicalInfo.hasDisease ? 'Con condición' : 'Saludable'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative pt-3 pb-4 border-t border-gray-100 dark:border-gray-800">
        <Button
          variant="ghost"
          size="sm"
          className="w-full group/btn relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 dark:from-primary/10 dark:to-primary/20 dark:hover:from-primary/20 dark:hover:to-primary/30 transition-all duration-300"
          onClick={handleViewDetails}
        >
          <span className="relative z-10 flex items-center justify-center font-medium">
            <FiUser className="mr-2 h-4 w-4 transition-transform duration-300 group-hover/btn:scale-110" />
            Ver perfil completo
          </span>
        </Button>
      </CardFooter>
    </Card>
  )
}