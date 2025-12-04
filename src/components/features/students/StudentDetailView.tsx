'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Heart,
  BookOpen,
  Bus,
  Users,
  Shield,
  GraduationCap,
  Home,
  Briefcase,
  AlertCircle,
  Check,
  X,
  Clock,
  FileText,
  Palette,
  Utensils,
  Gamepad2,
  Cake,
  Star,
  Building,
  Globe,
  Languages,
} from 'lucide-react';
import { Student } from '@/types/students.types';

interface StudentDetailViewProps {
  student: Student;
}

// Componente para sección con header
const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, children, className = '' }) => (
  <Card className={`border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${className}`}>
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

// Componente para campo de información
const InfoField: React.FC<{
  label: string;
  value: string | number | null | undefined;
  icon?: React.ReactNode;
  highlight?: boolean;
}> = ({ label, value, icon, highlight = false }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
      {icon}
      {label}
    </p>
    <p className={`text-sm ${highlight ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'}`}>
      {value || 'N/A'}
    </p>
  </div>
);

// Componente para badge de estado
const StatusBadge: React.FC<{ active: boolean; activeText?: string; inactiveText?: string }> = ({
  active,
  activeText = 'Sí',
  inactiveText = 'No',
}) => (
  <Badge
    variant="outline"
    className={
      active
        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
    }
  >
    {active ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
    {active ? activeText : inactiveText}
  </Badge>
);

export const StudentDetailView: React.FC<StudentDetailViewProps> = ({ student }) => {
  const getInitials = (givenNames: string, lastNames: string) => {
    const given = givenNames?.split(' ')[0]?.[0] || '';
    const last = lastNames?.split(' ')[0]?.[0] || '';
    return `${given}${last}`.toUpperCase();
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (birthDate: Date | string | null | undefined) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(student.birthDate);
  const enrollment = student.enrollments?.[0];
  const address = (student as any).address;
  const medicalInfo = (student as any).medicalInfo;
  const busService = (student as any).busService;
  const parents = (student as any).parents || [];
  const emergencyContacts = (student as any).emergencyContacts || [];
  const authorizedPersons = (student as any).authorizedPersons || [];
  const academicRecords = (student as any).academicRecords || [];

  return (
    <div className="space-y-6">
      {/* Header con foto y datos principales */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32 border-4 border-slate-100 dark:border-slate-800">
                <AvatarImage src={student.pictures?.[0]?.url} />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-3xl font-bold">
                  {getInitials(student.givenNames, student.lastNames)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Info principal */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {student.givenNames} {student.lastNames}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Badge variant="outline" className="font-mono bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                    {student.codeSIRE}
                  </Badge>
                  {enrollment && (
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {enrollment.section?.grade?.name} - Sección {enrollment.section?.name}
                    </Badge>
                  )}
                  {enrollment?.status === 'ACTIVE' && (
                    <Badge className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                      Activo
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <InfoField label="Edad" value={age ? `${age} años` : 'N/A'} icon={<Calendar className="w-3 h-3" />} />
                <InfoField label="Género" value={student.gender} icon={<User className="w-3 h-3" />} />
                <InfoField label="Nacionalidad" value={student.nationality} icon={<Globe className="w-3 h-3" />} />
                <InfoField label="Ciclo" value={enrollment?.cycle?.name} icon={<GraduationCap className="w-3 h-3" />} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid de secciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información Personal */}
        <Section title="Información Personal" icon={<User className="w-5 h-5 text-blue-600 dark:text-blue-400" />}>
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Fecha de Nacimiento" value={formatDate(student.birthDate)} icon={<Calendar className="w-3 h-3" />} />
            <InfoField label="Lugar de Nacimiento" value={(student as any).birthPlace} icon={<MapPin className="w-3 h-3" />} />
            <InfoField label="Municipio de Nacimiento" value={(student as any).birthTown} icon={<Building className="w-3 h-3" />} />
            <InfoField label="Idioma Materno" value={(student as any).nativeLanguage} icon={<Languages className="w-3 h-3" />} />
            <InfoField label="Segundo Idioma" value={(student as any).secondLanguage} icon={<Languages className="w-3 h-3" />} />
            <InfoField label="Etnia" value={(student as any).ethnicity} icon={<Users className="w-3 h-3" />} />
          </div>
          <Separator className="my-4" />
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Biblioteca:</span>
              <StatusBadge active={(student as any).hasLibrary || false} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Almuerzos:</span>
              <StatusBadge active={(student as any).hasLunches || false} />
            </div>
          </div>
        </Section>

        {/* Información Familiar */}
        <Section title="Información Familiar" icon={<Home className="w-5 h-5 text-purple-600 dark:text-purple-400" />}>
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Vive con" value={(student as any).livesWithText} icon={<Home className="w-3 h-3" />} />
            <InfoField label="Responsable Financiero" value={(student as any).financialResponsibleText} icon={<Briefcase className="w-3 h-3" />} />
            <InfoField label="Hermanos" value={(student as any).siblingsCount?.toString()} />
            <InfoField label="Hermanas" value={(student as any).sistersCount?.toString()} />
          </div>
        </Section>

        {/* Gustos y Preferencias */}
        <Section title="Gustos y Preferencias" icon={<Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />}>
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Color Favorito" value={(student as any).favoriteColor} icon={<Palette className="w-3 h-3" />} />
            <InfoField label="Pasatiempo" value={(student as any).hobby} icon={<Star className="w-3 h-3" />} />
            <InfoField label="Comida Favorita" value={(student as any).favoriteFood} icon={<Utensils className="w-3 h-3" />} />
            <InfoField label="Materia Favorita" value={(student as any).favoriteSubject} icon={<BookOpen className="w-3 h-3" />} />
            <InfoField label="Juguete Favorito" value={(student as any).favoriteToy} icon={<Gamepad2 className="w-3 h-3" />} />
            <InfoField label="Pastel Favorito" value={(student as any).favoriteCake} icon={<Cake className="w-3 h-3" />} />
          </div>
        </Section>

        {/* Dirección */}
        {address && (
          <Section title="Dirección" icon={<MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />}>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Calle" value={address.street} />
              <InfoField label="Zona" value={address.zone} />
              <InfoField label="Municipio" value={address.municipality?.name} />
              <InfoField label="Departamento" value={address.department?.name} />
            </div>
          </Section>
        )}

        {/* Información Médica */}
        {medicalInfo && (
          <Section title="Información Médica" icon={<AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />} className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-sm text-slate-600 dark:text-slate-400">Enfermedad</span>
                <StatusBadge active={medicalInfo.hasDisease} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-sm text-slate-600 dark:text-slate-400">Medicamentos</span>
                <StatusBadge active={medicalInfo.takesMedication} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-sm text-slate-600 dark:text-slate-400">Alergias</span>
                <StatusBadge active={medicalInfo.hasAllergies} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-sm text-slate-600 dark:text-slate-400">Dificultad Aprendizaje</span>
                <StatusBadge active={medicalInfo.hasLearningDisability} />
              </div>
            </div>
            {(medicalInfo.diseaseDetails || medicalInfo.medicationDetails || medicalInfo.allergiesDetails || medicalInfo.disabilityDetails) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {medicalInfo.diseaseDetails && <InfoField label="Detalles Enfermedad" value={medicalInfo.diseaseDetails} />}
                {medicalInfo.medicationDetails && <InfoField label="Detalles Medicamentos" value={medicalInfo.medicationDetails} />}
                {medicalInfo.allergiesDetails && <InfoField label="Detalles Alergias" value={medicalInfo.allergiesDetails} />}
                {medicalInfo.disabilityDetails && <InfoField label="Detalles Dificultad" value={medicalInfo.disabilityDetails} />}
              </div>
            )}
            <Separator className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Fortalezas</p>
                <p className="text-sm text-slate-900 dark:text-slate-100 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900">
                  {medicalInfo.strengths || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Áreas a Mejorar</p>
                <p className="text-sm text-slate-900 dark:text-slate-100 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-100 dark:border-amber-900">
                  {medicalInfo.areasToImprove || 'N/A'}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Medicación de emergencia permitida:</span>
              <StatusBadge active={medicalInfo.emergencyMedicationAllowed} activeText="Permitida" inactiveText="No Permitida" />
            </div>
          </Section>
        )}

        {/* Padres/Encargados */}
        {parents.length > 0 && (
          <Section title="Padres / Encargados" icon={<Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />} className="lg:col-span-2">
            <div className="space-y-4">
              {parents.map((rel: any, index: number) => (
                <div key={index} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                        <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {rel.parent?.givenNames} {rel.parent?.lastNames}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{rel.relationshipType}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rel.isPrimaryContact && (
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                          Contacto Principal
                        </Badge>
                      )}
                      {rel.hasLegalCustody && (
                        <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                          Custodia Legal
                        </Badge>
                      )}
                      {rel.financialResponsible && (
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                          Responsable Financiero
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">{rel.parent?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">{rel.parent?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">{rel.parent?.parentDetails?.occupation || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">{rel.parent?.parentDetails?.workplace || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Contactos de Emergencia */}
        {emergencyContacts.length > 0 && (
          <Section title="Contactos de Emergencia" icon={<Phone className="w-5 h-5 text-red-600 dark:text-red-400" />}>
            <div className="space-y-3">
              {emergencyContacts.map((contact: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-sm font-bold text-red-600 dark:text-red-400">
                      {contact.priority}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{contact.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{contact.relationship}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4" />
                    {contact.phone}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Personas Autorizadas */}
        {authorizedPersons.length > 0 && (
          <Section title="Personas Autorizadas" icon={<Shield className="w-5 h-5 text-green-600 dark:text-green-400" />}>
            <div className="space-y-3">
              {authorizedPersons.map((person: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{person.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{person.relationship}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4" />
                    {person.phone}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Servicio de Transporte */}
        {busService && (
          <Section title="Servicio de Transporte" icon={<Bus className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />} className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">Estado del servicio:</span>
              <StatusBadge active={busService.hasService} activeText="Activo" inactiveText="Inactivo" />
            </div>
            {busService.hasService && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <InfoField label="Ruta" value={busService.route} />
                  <InfoField label="Cuota Mensual" value={busService.monthlyFee ? `Q${busService.monthlyFee}` : null} />
                  <InfoField label="Recoge" value={busService.pickupPersonName} />
                  <InfoField label="Entrega" value={busService.dropoffPersonName} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="Dirección de Casa" value={busService.homeAddress} icon={<Home className="w-3 h-3" />} />
                  <InfoField label="Puntos de Referencia" value={busService.referencePoints} icon={<MapPin className="w-3 h-3" />} />
                  <InfoField label="Contacto Emergencia" value={busService.emergencyContact} icon={<Phone className="w-3 h-3" />} />
                  <InfoField label="Persona Emergencia" value={busService.emergencyDeliveryPerson} icon={<User className="w-3 h-3" />} />
                </div>
              </>
            )}
          </Section>
        )}

        {/* Historial Académico */}
        {academicRecords.length > 0 && (
          <Section title="Historial Académico" icon={<FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />} className="lg:col-span-2">
            <div className="space-y-3">
              {academicRecords.map((record: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{record.schoolName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Año {record.year}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Grado completado: <span className="font-medium text-slate-900 dark:text-white">{record.gradeCompleted}</span>
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Promovido a: <span className="font-medium text-slate-900 dark:text-white">{record.gradePromotedTo}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Footer con fechas */}
      <div className="flex items-center justify-end gap-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Creado: {formatDate((student as any).createdAt)}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Actualizado: {formatDate((student as any).updatedAt)}
        </div>
      </div>
    </div>
  );
};
