import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  Cake,
  BookOpen,
  Bus,
  BriefcaseMedical as FirstAid,
  Home,
  Users,
  Phone,
  Mail,
  MapPin,
  Gamepad2,
  Utensils,
  GraduationCap,
  ToyBrick,
  Heart,
  Shield,
  UserCheck,
  DollarSign,
  Activity,
  Clock,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  User,
  Baby,
  School,
  Info,
  HeartHandshake,
  UserCircle,
  Building,
  Pill,
  Brain,
  Target,
  AlertTriangle
} from "lucide-react";
import { FaMale, FaFemale } from "react-icons/fa";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useStudentContext } from "@/context/StudentContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type UserFormProps = {
  isEditMode?: boolean;
  studentId?: number;
};

export default function StudentProfile({ isEditMode = false, studentId }: UserFormProps) {
  const { studentData } = useStudentContext();
  const router = useRouter();

  if (!studentData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">
            No se encontraron datos del estudiante
          </p>
          <Button 
            variant="outline"
            onClick={() => router.push('/students')}
          >
            Volver a estudiantes
          </Button>
        </div>
      </div>
    );
  }

  const profilePicture = studentData.pictures?.find(pic => pic.kind === "profile")?.url;
  const birthDate = studentData.birthDate ? new Date(studentData.birthDate) : null;
  
  // Calcular edad
  const calculateAge = () => {
    if (!birthDate) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  const age = calculateAge();

  console.log(studentData, "studentData")
  
  // Obtener enrollment activo


const activeEnrollment = studentData.enrollment;
const isActive = activeEnrollment?.status === 'active';

  // Función para iconos de género
  const GenderIcon = ({ gender }: { gender?: string }) => {
    if (gender === 'Masculino') {
      return <FaMale className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    }
    if (gender === 'Femenino') {
      return <FaFemale className="h-4 w-4 text-pink-600 dark:text-pink-400" />;
    }
    return <User className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-border">
                    {profilePicture ? (
                      <AvatarImage src={profilePicture} className="object-cover" />
                    ) : (
                      <AvatarFallback className="text-2xl font-semibold">
                        {studentData.givenNames.charAt(0)}{studentData.lastNames.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {/* Status Indicator */}
                  <div className={cn(
                    "absolute bottom-2 right-2 h-8 w-8 rounded-full border-4 border-background flex items-center justify-center",
                    isActive ? "bg-green-500" : "bg-gray-400"
                  )}>
                    {isActive ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : (
                      <XCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>

                {/* Info Principal */}
                <div className="flex-1 text-center lg:text-left">
                  <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                    {studentData.givenNames} {studentData.lastNames}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-4">
                    {age ? `${age} años` : ''} • {studentData.gender || 'No especificado'} • {studentData.nationality || 'Guatemala'}
                  </p>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {isActive ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Activity className="w-4 h-4 mr-2" />
                        Estudiante Activo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="w-4 h-4 mr-2" />
                        Inactivo
                      </Badge>
                    )}
                    
                    {activeEnrollment && (
                      <Badge variant="outline">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Grado {activeEnrollment.gradeId} • Sección {activeEnrollment.sectionId}
                      </Badge>
                    )}

                    {studentData.codeSIRE && (
                      <Badge variant="outline">
                        <Shield className="w-4 h-4 mr-2" />
                        SIRE: {studentData.codeSIRE}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => router.push(`/students/edit/${studentId}`)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button>
                    <Phone className="h-4 w-4 mr-2" />
                    Contactar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Cake className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cumpleaños</p>
                  <p className="font-semibold">
                    {birthDate ? format(birthDate, "dd MMM", { locale: es }) : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">{age ? `${age} años` : ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hermanos</p>
                  <p className="font-semibold">{studentData.siblingsCount || 0}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    {studentData.brothersCount > 0 && <span>{studentData.brothersCount} ♂</span>}
                    {studentData.sistersCount > 0 && <span>{studentData.sistersCount} ♀</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Bus className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transporte</p>
                  <p className="font-semibold">
                    {studentData.busService?.hasService ? 'Sí' : 'No'}
                  </p>
                  {studentData.busService?.route && (
                    <p className="text-xs text-muted-foreground">Ruta: {studentData.busService.route}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Materia Favorita</p>
                  <p className="font-semibold text-sm">
                    {studentData.favoriteSubject || 'No especificada'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Familia
            </TabsTrigger>
            <TabsTrigger value="academic" className="flex items-center gap-2">
              <School className="w-4 h-4" />
              Académico
            </TabsTrigger>
            <TabsTrigger value="medical" className="flex items-center gap-2">
              <FirstAid className="w-4 h-4" />
              Médico
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contactos
            </TabsTrigger>
          </TabsList>

          {/* Personal Tab */}
          <TabsContent value="personal" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información Básica */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Información Básica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        Fecha de Nacimiento
                      </div>
                      <p className="font-medium">
                        {birthDate ? format(birthDate, "dd/MM/yyyy") : 'N/A'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <GenderIcon gender={studentData.gender} />
                        Género
                      </div>
                      <p className="font-medium">
                        {studentData.gender || 'No especificado'}
                      </p>
                    </div>

                    {studentData.birthPlace && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          Lugar de Nacimiento
                        </div>
                        <p className="font-medium">{studentData.birthPlace}</p>
                      </div>
                    )}

                    {studentData.nationality && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building className="h-4 w-4" />
                          Nacionalidad
                        </div>
                        <p className="font-medium">{studentData.nationality}</p>
                      </div>
                    )}
                  </div>

                  {studentData.address && (
                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Home className="h-4 w-4" />
                        Dirección
                      </div>
                      <div>
                        <p className="font-medium">
                          {studentData.address.street}, Zona {studentData.address.zone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {studentData.address.municipality}, {studentData.address.department}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gustos y Preferencias */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Gustos y Preferencias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {studentData.favoriteColor && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-6 w-6 rounded-full border-2 border-muted"
                            style={{ backgroundColor: studentData.favoriteColor }}
                          />
                          <div>
                            <p className="text-sm text-muted-foreground">Color favorito</p>
                            <p className="font-medium">{studentData.favoriteColor}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {studentData.hobby && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <Gamepad2 className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Pasatiempo</p>
                            <p className="font-medium">{studentData.hobby}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {studentData.favoriteFood && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <Utensils className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Comida favorita</p>
                            <p className="font-medium">{studentData.favoriteFood}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {studentData.favoriteSubject && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Materia favorita</p>
                            <p className="font-medium">{studentData.favoriteSubject}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {studentData.favoriteToy && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <ToyBrick className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Juguete favorito</p>
                            <p className="font-medium">{studentData.favoriteToy}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {studentData.favoriteCake && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <Cake className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Postre favorito</p>
                            <p className="font-medium">{studentData.favoriteCake}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Family Tab */}
          <TabsContent value="family" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Padres/Tutores */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Padres y Tutores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {studentData.parents && studentData.parents.length > 0 ? (
                    <div className="space-y-4">
                      {studentData.parents.map((parent, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">
                                {parent.newParent?.givenNames} {parent.newParent?.lastNames}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {parent.relationshipType}
                              </p>
                            </div>
                            {parent.isPrimaryContact && (
                              <Badge variant="secondary">
                                <Star className="w-3 h-3 mr-1" />
                                Contacto Principal
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            {parent.newParent?.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {parent.newParent.phone}
                              </div>
                            )}
                            {parent.newParent?.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                {parent.newParent.email}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {parent.hasLegalCustody && (
                              <Badge variant="outline">
                                <Shield className="w-3 h-3 mr-1" />
                                Custodia Legal
                              </Badge>
                            )}
                            {parent.livesWithStudent && (
                              <Badge variant="outline">
                                <Home className="w-3 h-3 mr-1" />
                                Convive
                              </Badge>
                            )}
                            {parent.financialResponsible && (
                              <Badge variant="outline">
                                <DollarSign className="w-3 h-3 mr-1" />
                                Resp. Financiero
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No hay padres/tutores registrados</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Hermanos y Convivencia */}
              <div className="space-y-6">
                {/* Hermanos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Baby className="h-5 w-5" />
                      Hermanos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {studentData.siblings && studentData.siblings.length > 0 ? (
                      <div className="space-y-3">
                        {studentData.siblings.map((sibling, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-muted rounded-lg">
                                {sibling.gender === 'Masculino' ? (
                                  <FaMale className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                ) : sibling.gender === 'Femenino' ? (
                                  <FaFemale className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                                ) : (
                                  <User className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{sibling.name}</h4>
                                <p className="text-sm text-muted-foreground">{sibling.age} años</p>
                              </div>
                            </div>
                            <Badge variant="outline">#{index + 1}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Baby className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Sin hermanos registrados</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Convivencia */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Situación Familiar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {studentData.livesWithText && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <HeartHandshake className="h-4 w-4" />
                          Vive con
                        </div>
                        <p className="font-medium">{studentData.livesWithText}</p>
                      </div>
                    )}
                    
                    {studentData.financialResponsibleText && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          Responsable Financiero
                        </div>
                        <p className="font-medium">{studentData.financialResponsibleText}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Historial Académico */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <School className="h-5 w-5" />
                      Historial Académico
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {studentData.academicRecords && studentData.academicRecords.length > 0 ? (
                      <div className="space-y-4">
                        {studentData.academicRecords.map((record, index) => (
                          <div key={index} className="p-4 border-l-4 border-primary bg-muted/50 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-2">{record.schoolName}</h3>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Año</p>
                                    <p className="font-medium flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {record.year}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Completado</p>
                                    <p className="font-medium flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                                      {record.gradeCompleted}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Promovido a</p>
                                    <p className="font-medium flex items-center gap-1">
                                      <Star className="h-3 w-3 text-yellow-600" />
                                      {record.gradePromotedTo}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline">#{index + 1}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <School className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No hay registros académicos</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Transporte Escolar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="h-5 w-5" />
                    Transporte Escolar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {studentData.busService?.hasService ? (
                    <div className="space-y-4">
                      {studentData.busService.route && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            Ruta
                          </div>
                          <p className="font-medium">{studentData.busService.route}</p>
                        </div>
                      )}
                      
                      {studentData.busService.pickupPersonName && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <UserCheck className="h-4 w-4" />
                            Recoge
                          </div>
                          <p className="font-medium">{studentData.busService.pickupPersonName}</p>
                        </div>
                      )}
                      
                      {studentData.busService.dropoffPersonName && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <UserCheck className="h-4 w-4" />
                            Entrega
                          </div>
                          <p className="font-medium">{studentData.busService.dropoffPersonName}</p>
                        </div>
                      )}
                      
                      {studentData.busService.monthlyFee && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            Tarifa Mensual
                          </div>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            Q{studentData.busService.monthlyFee.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No utiliza transporte escolar</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Medical Tab */}
          <TabsContent value="medical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FirstAid className="h-5 w-5" />
                  Información Médica
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentData.medicalInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Enfermedades */}
                    <div className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                          <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <h4 className="font-medium">Enfermedades</h4>
                      </div>
                      <p className="text-sm">
                        {studentData.medicalInfo.hasDisease ? (
                          <span className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            {studentData.medicalInfo.diseaseDetails || "Sí, sin detalles"}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            No presenta
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Medicamentos */}
                    <div className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <Pill className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-medium">Medicamentos</h4>
                      </div>
                      <p className="text-sm">
                        {studentData.medicalInfo.takesMedication ? (
                          <span className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            {studentData.medicalInfo.medicationDetails || "Sí, sin detalles"}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            No toma medicamentos
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Alergias */}
                    <div className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h4 className="font-medium">Alergias</h4>
                      </div>
                      <p className="text-sm">
                        {studentData.medicalInfo.hasAllergies ? (
                          <span className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            {studentData.medicalInfo.allergiesDetails || "Sí, sin detalles"}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            Sin alergias
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Medicación de Emergencia */}
                    <div className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                          <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <h4 className="font-medium">Medicación de Emergencia</h4>
                      </div>
                      <p className="text-sm">
                        {studentData.medicalInfo.emergencyMedicationAllowed ? (
                          <span className="flex items-center gap-2 text-green-600 font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Autorizada
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-red-600 font-medium">
                            <XCircle className="h-4 w-4" />
                            No Autorizada
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Discapacidad de Aprendizaje */}
                    {studentData.medicalInfo.hasLearningDisability && (
                      <div className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h4 className="font-medium">Discapacidad de Aprendizaje</h4>
                        </div>
                        <p className="text-sm">
                          {studentData.medicalInfo.disabilityDetails || "Sí, sin detalles especificados"}
                        </p>
                      </div>
                    )}

                    {/* Fortalezas */}
                    {studentData.medicalInfo.strengths && (
                      <div className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-lg">
                            <Star className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          </div>
                          <h4 className="font-medium">Fortalezas</h4>
                        </div>
                        <p className="text-sm">{studentData.medicalInfo.strengths}</p>
                      </div>
                    )}

                    {/* Áreas a Mejorar */}
                    {studentData.medicalInfo.areasToImprove && (
                      <div className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                            <Target className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <h4 className="font-medium">Áreas a Mejorar</h4>
                        </div>
                        <p className="text-sm">{studentData.medicalInfo.areasToImprove}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FirstAid className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No hay información médica registrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contactos de Emergencia */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contactos de Emergencia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {studentData.emergencyContacts && studentData.emergencyContacts.length > 0 ? (
                    <div className="space-y-4">
                      {studentData.emergencyContacts.map((contact, index) => (
                        <div key={index} className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50/50 dark:bg-red-900/10">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                              <Phone className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{contact.name}</h3>
                              <Badge variant="outline" className="mb-3 border-red-200 text-red-700 dark:border-red-800 dark:text-red-300">
                                {contact.relationship}
                              </Badge>
                              
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{contact.phone}</span>
                              </div>
                            </div>
                            
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Phone className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No hay contactos de emergencia</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Personas Autorizadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Personas Autorizadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {studentData.authorizedPersons && studentData.authorizedPersons.length > 0 ? (
                    <div className="space-y-4">
                      {studentData.authorizedPersons.map((person, index) => (
                        <div key={index} className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50/50 dark:bg-green-900/10">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                              
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">{person.name}</h3>
                                <Badge variant="outline" className="mb-3 border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">
                                  {person.relationship}
                                </Badge>
                                
                                {person.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{person.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <UserCheck className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No hay personas autorizadas</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="text-center lg:text-left">
                <h3 className="text-lg font-semibold mb-1">
                  ¿Necesitas realizar alguna acción?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Puedes editar la información, imprimir el perfil o contactar a los padres
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline"
                  onClick={() => window.print()}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir
                </Button>
                
                <Button 
                  onClick={() => router.push(`/students/edit/${studentId}`)}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Información
                </Button>
                
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Contactar Padres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}