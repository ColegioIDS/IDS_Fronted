// Enums y tipos base
export type EnrollmentStatus = 'active' | 'inactive' | 'graduated' | 'transferred';
export type Gender = 'Masculino' | 'Femenino' | 'Otro' | null;
export type RelationshipType = 'Madre' | 'Padre' | 'Tutor' | 'Abuelo' | 'Tío' | 'Otro';

// Interfaces de sub-componentes
export interface Address {
  id?: number;
  street: string;
  zone: string;
  municipality: string;
  department: string;
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

export interface ParentLink {
  id?: number;
  parentId?: number;
  
  relationshipType: RelationshipType;
  isPrimaryContact?: boolean;
  hasLegalCustody?: boolean;
  canAccessInfo?: boolean;
  livesWithStudent?: boolean;
  financialResponsible?: boolean;
  emergencyContactPriority?: number;
  receivesSchoolNotices?: boolean;
  parent?: {
    givenNames: string;
    lastNames: string;
    phone: string;
    email?: string | null;
    birthDate?: Date | string | null;
    gender?: Gender;
  };
}

// Interface principal del estudiante
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
  enrollmentStatus: EnrollmentStatus;
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
}

// Para formularios
export interface CreateStudentPayload extends Omit<Student, 'id' | 'createdAt' | 'updatedAt'> {}

// Para respuesta de padres
export interface ParentDpiResponse {
  user: {
    id: number;
    givenNames: string;
    lastNames: string;
    dpi: string;
    phone?: string | null;
    email?: string | null;
    birthDate?: Date | string | null;
    gender?: Gender;
  };
  parentDetails: {
    id: number;
    userId: number;
    dpiIssuedAt?: string | null;
    occupation?: string | null;
    workplace?: string | null;
    email?: string | null;
    workPhone?: string | null;
    isSponsor?: boolean;
    sponsorInfo?: any;
    createdAt?: string;
    updatedAt?: string;
  };
  parentLinks?: {
    relationshipType?: RelationshipType | null;
  };
}