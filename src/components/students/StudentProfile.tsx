//src\components\students\StudentProfile.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Palette,
  Gamepad2,
  Utensils,
  GraduationCap,
  ToyBrick,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useStudentContext } from "@/context/StudentContext";

type UserFormProps = {
  isEditMode?: boolean;
  studentId?: number;
};

export default function StudentProfile({ isEditMode = false, studentId }: UserFormProps) {
    const { studentData } = useStudentContext();

 if (!studentData) return <div>No se encontraron datos del estudiante</div>;

   const profilePicture = studentData.pictures?.find(pic => pic.kind === "profile")?.url;
  const birthDate = new Date(studentData.birthDate);
  const formattedBirthDate = format(birthDate, "PPP", { locale: es }); 

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
     <div className="flex flex-col md:flex-row gap-6 mb-8">
  {/* Avatar */}
  <div className="flex-shrink-0">
    <Avatar className="h-32 w-32 border-4 border-primary shadow-md">
      <AvatarImage src={profilePicture} />
      <AvatarFallback className="text-2xl font-semibold">
        {studentData.givenNames.charAt(0)}{studentData.lastNames.charAt(0)}
      </AvatarFallback>
    </Avatar>
  </div>

  {/* Info */}
  <div className="flex-grow">
    {/* Nombre + estado */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {studentData.givenNames} {studentData.lastNames}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant={studentData.enrollmentStatus === "active" ? "default" : "secondary"}>
            {studentData.enrollmentStatus === "active"
              ? "Activo"
              : studentData.enrollmentStatus === "inactive"
              ? "Inactivo"
              : studentData.enrollmentStatus === "graduated"
              ? "Graduado"
              : "Transferido"}
          </Badge>

          {studentData.codeSIRE && (
            <Badge variant="outline" className="hover:bg-muted cursor-pointer">
              Código SIRE: {studentData.codeSIRE}
            </Badge>
          )}
        </div>
      </div>
    </div>

    {/* Info adicional */}
    <div className="border-t mt-6 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5" />
        <span>{formattedBirthDate}</span>
      </div>

      <div className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        <span>{studentData.gender || "No especificado"}</span>
      </div>

      {studentData.birthPlace && (
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <span>Nacido en {studentData.birthPlace}</span>
        </div>
      )}
    </div>
  </div>
</div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Básica */}
          <Card className="shadow-sm  bg-white dark:bg-slate-900">
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
      <Home className="h-5 w-5 text-primary" />
      Información Básica
    </CardTitle>
  </CardHeader>

  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Dirección */}
      <div className="space-y-1">
        <h3 className="font-medium text-sm text-foreground">Dirección</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {studentData.address?.street}, Zona {studentData.address?.zone} <br />
          {studentData.address?.municipality}, {studentData.address?.department}
        </p>
      </div>

      {/* Vive con */}
      <div className="space-y-1">
        <h3 className="font-medium text-sm text-foreground">Vive con</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {studentData.livesWithText || "No especificado"}
        </p>
      </div>

      {/* Responsable financiero */}
      <div className="space-y-1 border-t md:border-t-0 pt-4 md:pt-0">
        <h3 className="font-medium text-sm text-foreground">Responsable financiero</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {studentData.financialResponsibleText || "No especificado"}
        </p>
      </div>

      {/* Hermanos */}
      <div className="space-y-1 border-t md:border-t-0 pt-4 md:pt-0">
        <h3 className="font-medium text-sm text-foreground">Hermanos</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {studentData.siblingsCount} total ({studentData.brothersCount} hermanos, {studentData.sistersCount} hermanas)
        </p>
      </div>
    </div>
  </CardContent>
        </Card>


          {/* Preferencias */}
          <Card className="shadow-sm bg-white dark:bg-slate-900">
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
      <Palette className="h-5 w-5 text-primary" />
      Preferencias
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {studentData.favoriteColor && (
        <div className="flex items-center gap-3 bg-muted/40 rounded-md px-3 py-2">
          <div
            className="h-5 w-5 rounded-full border shadow"
            style={{ backgroundColor: studentData.favoriteColor }}
            title={studentData.favoriteColor}
          />
          <span className="text-sm text-muted-foreground">
            Color favorito: <span className="text-foreground font-medium">{studentData.favoriteColor}</span>
          </span>
        </div>
      )}
      {studentData.hobby && (
        <div className="flex items-center gap-3 bg-muted/40 rounded-md px-3 py-2">
          <Gamepad2 className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            Hobby: <span className="text-foreground font-medium">{studentData.hobby}</span>
          </span>
        </div>
      )}
      {studentData.favoriteFood && (
        <div className="flex items-center gap-3 bg-muted/40 rounded-md px-3 py-2">
          <Utensils className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            Comida favorita: <span className="text-foreground font-medium">{studentData.favoriteFood}</span>
          </span>
        </div>
      )}
      {studentData.favoriteSubject && (
        <div className="flex items-center gap-3 bg-muted/40 rounded-md px-3 py-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            Materia favorita: <span className="text-foreground font-medium">{studentData.favoriteSubject}</span>
          </span>
        </div>
      )}
      {studentData.favoriteToy && (
        <div className="flex items-center gap-3 bg-muted/40 rounded-md px-3 py-2">
          <ToyBrick className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            Juguete favorito: <span className="text-foreground font-medium">{studentData.favoriteToy}</span>
          </span>
        </div>
      )}
      {studentData.favoriteCake && (
        <div className="flex items-center gap-3 bg-muted/40 rounded-md px-3 py-2">
          <Cake className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            Postre favorito: <span className="text-foreground font-medium">{studentData.favoriteCake}</span>
          </span>
        </div>
      )}
    </div>
  </CardContent>
</Card>


          {/* Historial Académico */}

          <Card className="shadow-sm bg-white dark:bg-slate-900">
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
      <BookOpen className="h-5 w-5 text-primary" />
      Historial Académico
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {studentData.academicRecords.map((record, index) => (
        <div key={index} className="bg-muted/40 rounded-md p-4 shadow-sm border-l-4 border-primary">
          <h3 className="text-base font-semibold text-foreground">{record.schoolName}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Año: <span className="text-foreground">{record.year}</span><br />
            Grado completado: <span className="text-foreground">{record.gradeCompleted}</span><br />
            Promovido a: <span className="text-foreground">{record.gradePromotedTo}</span>
          </p>
        </div>
      ))}
    </div>
  </CardContent>
</Card>

        
          {/* Información Médica */}
        <Card className="shadow-sm bg-white dark:bg-slate-900">
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
      <FirstAid className="h-5 w-5 text-primary" />
      Información Médica
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { label: "Enfermedades", value: studentData.medicalInfo?.hasDisease ? studentData.medicalInfo?.diseaseDetails || "Sí (sin detalles)" : "Ninguna" },
        { label: "Medicamentos", value: studentData.medicalInfo?.takesMedication ? studentData.medicalInfo?.medicationDetails || "Sí (sin detalles)" : "Ninguno" },
        { label: "Alergias", value: studentData.medicalInfo?.hasAllergies ? studentData.medicalInfo?.allergiesDetails || "Sí (sin detalles)" : "Ninguna" },
        { label: "Medicación de emergencia", value: studentData.medicalInfo?.emergencyMedicationAllowed ? "Permitida" : "No permitida" },
        { label: "Discapacidad de aprendizaje", value: studentData.medicalInfo?.hasLearningDisability ? studentData.medicalInfo?.disabilityDetails || "Sí (sin detalles)" : "Ninguna" },
        { label: "Fortalezas", value: studentData.medicalInfo?.strengths },
        { label: "Áreas a mejorar", value: studentData.medicalInfo?.areasToImprove }
      ].map(({ label, value }, i) => (
        value && (
          <div key={i} className="space-y-1 bg-muted/40 rounded-md px-4 py-3">
            <h3 className="font-medium text-sm text-foreground">{label}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{value}</p>
          </div>
        )
      ))}
    </div>
  </CardContent>
</Card>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Transporte Escolar */}
        <Card className="shadow-sm bg-white dark:bg-slate-900">
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
      <Bus className="h-5 w-5 text-primary" />
      Transporte Escolar
    </CardTitle>
  </CardHeader>
  <CardContent>
    {studentData.busService?.hasService ? (
      <div className="space-y-3">
        {[
          { label: "Ruta", value: studentData.busService?.route },
          { label: "Persona que recoge", value: studentData.busService?.pickupPersonName },
          { label: "Persona que deja", value: studentData.busService?.dropoffPersonName },
          {
            label: "Tarifa mensual",
            value: studentData.busService?.monthlyFee ? `Q${studentData.busService.monthlyFee.toFixed(2)}` : undefined
          }
        ].map(({ label, value }, i) => (
          value && (
            <div key={i} className="space-y-1">
              <h3 className="font-medium text-sm text-foreground">{label}</h3>
              <p className="text-sm text-muted-foreground">{value}</p>
            </div>
          )
        ))}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">
        El estudiante no utiliza el servicio de transporte escolar.
      </p>
    )}
  </CardContent>
</Card>


          {/* Padres/Tutores */}
          <Card className="bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Padres/Tutores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentData.parents.map((parent, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4 py-2">
                    <h3 className="font-medium">
                      {parent.newParent?.givenNames} {parent.newParent?.lastNames}
                      {parent.isPrimaryContact && (
                        <Badge variant="secondary" className="ml-2">Contacto principal</Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {parent.relationshipType}<br />
                      Teléfono: {parent.newParent?.phone}<br />
                      {parent.newParent?.email && `Email: ${parent.newParent}`}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {parent.hasLegalCustody && (
                        <Badge variant="outline">Custodia legal</Badge>
                      )}
                      {parent.livesWithStudent && (
                        <Badge variant="outline">Vive con el estudiante</Badge>
                      )}
                      {parent.financialResponsible && (
                        <Badge variant="outline">Responsable financiero</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contactos de Emergencia */}
          <Card className="bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contactos de Emergencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studentData.emergencyContacts?.map((contact, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4 py-2">
                    <h3 className="font-medium">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {contact.relationship}<br />
                      Teléfono: {contact.phone}<br />
                    
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personas Autorizadas */}
          <Card className="bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Personas Autorizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studentData.authorizedPersons?.map((person, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4 py-2">
                    <h3 className="font-medium">{person.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {person.relationship}<br />
                      Teléfono: {person.phone || "No especificado"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hermanos */}
        {Array.isArray(studentData.siblings) && studentData.siblings.length > 0 && (

            <Card className="bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Hermanos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentData.siblings?.map((sibling, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4 py-2">
                      <h3 className="font-medium">{sibling.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Edad: {sibling.age} años<br />
                        Género: {sibling.gender || "No especificado"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}