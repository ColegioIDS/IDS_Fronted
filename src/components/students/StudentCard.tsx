import { cn } from "@/lib/utils"
import { getInitials } from "@/utils/getInitials"
import { Student } from "@/types/student"
import { useRouter } from "next/navigation"
import { FaMale, FaFemale } from "react-icons/fa"
import { FiUsers, FiActivity, FiHeart, FiBook, FiFeather, FiStar, FiCalendar, FiUser, FiEye, FiEdit, FiMoreVertical } from "react-icons/fi"
import { CgPlayListRemove } from "react-icons/cg"
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

  const handleViewDetails = () => onViewDetails(student.id || 0)
  const handleEdit = () => onEdit(student.id || 0)
  const handleStatusChange = () => onStatusChange(student.id || 0, student.enrollmentStatus === 'active')

  return (
    <Card
      key={student.id}
      className={cn(
        "transition-all duration-300 hover:shadow-xl hover:-translate-y-1  rounded-xl   dark:bg-white/[0.03]",
        !student.enrollmentStatus && "opacity-60 grayscale-[0.3]",
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-0">
        <div className="flex flex-row items-center space-x-4">
          <div className="relative">
            <Avatar className="h-14 w-14 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
              <AvatarImage
                src={
                  student.pictures?.find(p => p.kind === 'profile')?.url ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${student.givenNames} ${student.lastNames}`
                }
              />
              <AvatarFallback className="text-base">
                {getInitials(student.givenNames, student.lastNames)}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                student.enrollmentStatus === 'active' ? "bg-green-500" : "bg-red-500"
              )}
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold leading-tight tracking-tight">
              {`${student.givenNames} ${student.lastNames}`}
            </h3>
            <div className="flex items-center gap-2">
              {student.enrollmentStatus === 'active' ? (
                <Badge variant="outline" className="text-green-600 border-green-600 bg-green-100/30">
                  Activo
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  {student.enrollmentStatus}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10">
              <FiMoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {student.enrollmentStatus === 'active' ? (
              <>
                <DropdownMenuItem onClick={handleViewDetails}>
                  <FiEye className="mr-2 h-4 w-4" />
                  <span>Ver detalles</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <FiEdit className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleStatusChange}
                  className="text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                >
                  <CgPlayListRemove className="mr-2 h-4 w-4" />
                  <span>Desactivar cuenta</span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onClick={handleStatusChange}
                className="text-green-600 focus:bg-green-50 dark:focus:bg-green-900/20"
              >
                <CgPlayListRemove className="mr-2 h-4 w-4" />
                <span>Activar cuenta</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="pt-4 pb-2 rounded-b-xl">
        <div className="space-y-3 text-sm">
          {[
            {
              icon: <FiCalendar className="h-4 w-4" />,
              text: student.birthDate ? new Date(student.birthDate).toLocaleDateString() : 'N/A',
              label: "Fecha de nacimiento",
            },
            {
              icon: <FiUser className="h-4 w-4" />,
              text: student.gender,
              label: "Género",
            },
            {
              icon: <FiUsers className="h-4 w-4" />,
              label: "Hermanos",
              customContent: (
                <span className="flex items-center gap-2">
                  {student.siblingsCount} hermanos
                  <span className="flex items-center gap-1">
                    <FaMale className="text-blue-500" /> {student.brothersCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaFemale className="text-pink-500" /> {student.sistersCount}
                  </span>
                </span>
              ),
            },
            {
              icon: <FiActivity className="h-4 w-4" />,
              text: student.enrollmentStatus === 'active' ? 'Activo' : 'Inactivo',
              label: "Estado de inscripción",
            },
            {
              icon: <FiBook className="h-4 w-4" />,
              text: student.academicRecords?.[0]?.gradeCompleted ?? 'Sin registros',
              label: "Último grado cursado",
            },
            {
              icon: <FiStar className="h-4 w-4" />,
              text: student.favoriteSubject ?? 'No indicado',
              label: "Materia favorita",
            },
            {
              icon: <FiFeather className="h-4 w-4" />,
              text: student.hobby ?? 'No indicado',
              label: "Pasatiempo",
            },
            {
              icon: <FiHeart className="h-4 w-4" />,
              text: student.medicalInfo?.hasDisease ? 'Sí' : 'No',
              label: "¿Tiene enfermedades?",
            },
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
              <span className="truncate">
                {item.customContent ?? item.text}
              </span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full ml-auto border-primary/30 hover:border-primary/50 group transition-all"
          onClick={handleViewDetails}
        >
          <FiUser className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          Ver perfil completo
        </Button>
      </CardFooter>
    </Card>
  )
}