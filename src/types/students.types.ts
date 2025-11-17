//src/types/students.types.ts

export type EnrollmentStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED';
export type Gender = 'Masculino' | 'Femenino' | 'Otro' | null;
export type RelationshipType = 'Madre' | 'Padre' | 'Tutor' | 'Abuelo' | 'Tío' | 'Otro';

// ✅ NUEVO: Interface para datos de enrollment
export interface EnrollmentData {
  cycleId: number;
  gradeId: number;
  sectionId: number;
  status: EnrollmentStatus;
}

// ✅ NUEVO: Interface para enrollment completo (respuesta del backend)
export interface Enrollment {
  id: number;
  studentId: number;
  cycleId: number;
  gradeId: number;
  sectionId: number;
  status: EnrollmentStatus;
  cycle?: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  section?: {
    id: number;
    name: string;
    capacity: number;
    gradeId: number;
    grade?: {
      id: number;
      name: string;
      level: string;
      order: number;
    };
  };
}

// Interfaces de sub-componentes
export interface Address {
  id?: number;
  street: string;
  zone: string;
  municipality: string | number;
  department: string | number;
  municipalityId?: number | string;
  departmentId?: number | string;
}

export interface MedicalInfo {
  id?: number;
  hasDisease: boolean;
  diseaseDetails?: string | null;
  takesMedication: boolean;
  medicationDetails?: string | null;
  hasAllergies: boolean;
  allergiesDetails?: string | null;
  emergencyMedicationAllowed: boolean;
  emergencyMedicationDetails?: string | null;
  hasLearningDisability: boolean;
  disabilityDetails?: string | null;
  strengths?: string | null;
  areasToImprove?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicRecord {
  id?: number;
  schoolName: string;
  gradeCompleted: string;
  gradePromotedTo: string;
  year: number;
  createdAt?: string;
}

export interface BusService {
  id?: number;
  hasService: boolean;
  pickupPersonName?: string | null;
  dropoffPersonName?: string | null;
  homeAddress?: string | null;
  referencePoints?: string | null;
  emergencyContact?: string | null;
  emergencyDeliveryPerson?: string | null;
  route?: string | null;
  monthlyFee?: number | null;
  acceptedRules: boolean;
  signedDate?: Date | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmergencyContact {
  id?: number;
  name: string;
  relationship: string;
  phone?: string | null;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthorizedPerson {
  id?: number;
  name: string;
  relationship: string;
  phone?: string | null;
  createdAt?: string;
}

export interface Sponsorship {
  id?: number;
  sponsorName?: string | null;
  preferences?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sibling {
  id?: number;
  name: string;
  age: number;
  gender?: string | null;
  birthOrder?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Picture {
  id?: number;
  publicId: string;
  kind: string;
  url: string;
  description?: string | null;
  uploadedAt?: string;
}

// ✅ ACTUALIZADO: Detalles del padre para casos de creación
export interface ParentDetails {
  dpiIssuedAt: string;
  occupation: string;
  workplace: string;
  email?: string | null;
  workPhone?: string | null;
}

// ✅ ACTUALIZADO: Datos de nuevo padre
export interface NewParentData {
  givenNames: string;
  lastNames: string;
  dpi: string;
  phone: string;
  email?: string | null;
  birthDate?: Date | string | null;
  gender?: Gender;
  details: ParentDetails;
}

// ✅ ACTUALIZADO: Link de padre con soporte para crear nuevos padres
export interface ParentLink {
  id?: number;
  userId?: number | null; // Para padres existentes
  newParent?: NewParentData | null; // Para crear nuevos padres
  relationshipType: RelationshipType;
  isPrimaryContact?: boolean;
  hasLegalCustody?: boolean;
  canAccessInfo?: boolean;
  livesWithStudent?: boolean;
  financialResponsible?: boolean;
  emergencyContactPriority?: number;
  receivesSchoolNotices?: boolean;
  
  // Para respuestas del backend (padre ya vinculado)
  parent?: {
    id: number;
    givenNames: string;
    lastNames: string;
    phone: string;
    email?: string | null;
    birthDate?: Date | string | null;
    gender?: Gender;
    parentDetails?: {
      dpiIssuedAt?: string | null;
      occupation?: string | null;
      workplace?: string | null;
      email?: string | null;
      workPhone?: string | null;
    };
  };
}

// ✅ ACTUALIZADO: Interface principal del estudiante (SIN enrollmentStatus)
export interface Student {
  id?: number;
  codeSIRE?: string | null;
  givenNames: string;
  lastNames: string;
  birthDate: Date | string;
  birthPlace?: string | null;
  nationality?: string | null;
  gender?: Gender;
  livesWithText?: string | null;
  financialResponsibleText?: string | null;
  siblingsCount?: number;
  brothersCount?: number;
  sistersCount?: number;
  favoriteColor?: string | null;
  hobby?: string | null;
  favoriteFood?: string | null;
  favoriteSubject?: string | null;
  favoriteToy?: string | null;
  favoriteCake?: string | null;
  addressId?: number | null;
  createdAt?: string;
  updatedAt?: string;
  
  // Relaciones
  address?: Address | null;
  medicalInfo?: MedicalInfo | null;
  academicRecords?: AcademicRecord[];
  busService?: BusService | null;
  authorizedPersons?: AuthorizedPerson[];
  sponsorships?: Sponsorship[];
  emergencyContacts?: EmergencyContact[];
  siblings?: Sibling[];
  pictures?: Picture[];
  parents?: ParentLink[];
  
  // ✅ NUEVO: Enrollments (reemplaza enrollmentStatus)
  enrollments?: Enrollment[];
}

// ✅ ACTUALIZADO: Para formularios de creación (CON enrollment obligatorio)
export interface CreateStudentPayload extends Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'enrollments'> {
  enrollment: EnrollmentData; // Campo obligatorio
  profileImage?: File | string | null;
}

// ✅ NUEVO: Para transferencias de estudiantes
export interface StudentTransferPayload {
  newSectionId: number;
  newGradeId: number;
  cycleId: number;
}

// ✅ ACTUALIZADO: Para respuesta de padres por DPI
// Nota: El servicio devuelve response.data.data, no response.data
export interface ParentDpiResponse {
  available: boolean;
  message: string;
  userInfo?: {
    id: number;
    dpi: string;
    email?: string | null;
    givenNames: string;
    lastNames: string;
    phone?: string | null;
    isActive: boolean;
    canAccessPlatform: boolean;
    roleId: number;
    lastLogin?: string | null;
    createdAt?: string;
    parentDetails?: {
      occupation?: string | null;
      workplace?: string | null;
      workPhone?: string | null;
      isSponsor?: boolean;
      sponsorInfo?: any;
      dpiIssuedAt?: string | null;
    };
  };
}

// ✅ NUEVO: Para selects/dropdowns en formularios
export interface Grade {
  id: number;
  name: string;
  level: string;
  order: number;
  isActive: boolean;
}

export interface Section {
  id: number;
  name: string;
  capacity: number;
  gradeId: number;
  teacherId?: number | null;
  teacher?: {
    id: number;
    givenNames: string;
    lastNames: string;
  } | null;
  // ✅ NUEVO: Campos de disponibilidad
  enrolledCount?: number;
  availableSpots?: number;
  isFull?: boolean;
}

export interface SchoolCycle {
  id: number;
  name: string;
  description?: string | null;
  academicYear: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  canEnroll: boolean;
  isArchived: boolean;
  grades?: Grade[];
}

// ✅ ACTUALIZADO: Ahora soporta array de ciclos (como devuelve el backend)
export interface EnrollmentFormData {
  cycles: SchoolCycle[];
  activeCycle?: SchoolCycle; // Opcional si el backend solo envía cycles
  availableGrades?: Grade[];
  totalGrades?: number;
}

export interface GradeWithSections {
  cycleId: number;
  cycleName: string;
  grades: Grade[];
  totalGrades: number;
}

export interface SectionsAvailability {
  cycleId: number;
  cycleName: string;
  gradeId: number;
  gradeName: string;
  sections: Section[]; // Section ya tiene los campos de disponibilidad
  totalSections: number;
  availableSections: number;
}
