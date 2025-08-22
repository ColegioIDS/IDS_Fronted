// enrollment.types.ts - Types para Frontend

// ==================== ENUMS ====================
export enum EnrollmentStatus {
  ACTIVE = 'active',
  GRADUATED = 'graduated',
  TRANSFERRED = 'transferred'
}

// ==================== BASE TYPES ====================
export interface BaseEnrollment {
  id: number;
  studentId: number;
  cycleId: number;
  gradeId: number;
  sectionId: number;
  status: EnrollmentStatus;
}

// ==================== RELATED ENTITIES ====================
export interface Student {
  id: number;
  codeSIRE?: string;
  givenNames: string;
  lastNames: string;
  birthDate: string; // ISO date string
  birthPlace?: string;
  nationality?: string;
  gender?: string;
  livesWithText?: string;
  financialResponsibleText?: string;
  siblingsCount: number;
  brothersCount: number;
  sistersCount: number;
  favoriteColor?: string;
  hobby?: string;
  favoriteFood?: string;
  favoriteSubject?: string;
  favoriteToy?: string;
  favoriteCake?: string;
  addressId?: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface SchoolCycle {
  id: number;
  name: string; // "2024-2025"
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  isActive: boolean;
  isClosed: boolean;
  createdAt: string; // ISO date string
}

export interface Grade {
  id: number;
  name: string; // "Primero Básico"
  level: string; // "Primaria", "Secundaria"
  order: number;
  isActive: boolean;
}

export interface Section {
  id: number;
  name: string; // "A", "B"
  capacity: number;
  gradeId: number;
  teacherId?: number;
    grade?: Grade;
}

export interface Attendance {
  id: number;
  enrollmentId: number;
  bimesterId: number;
  date: string; // ISO date string
  status: string; // present/absent/late/excused
  notes?: string;
}

export interface StudentGrade {
  id: number;
  enrollmentId: number;
  courseId: number;
  bimesterId: number;
  value: number; // 0-100
  comments?: string;
}

// ==================== ENROLLMENT WITH RELATIONS ====================
export interface EnrollmentWithStudent extends BaseEnrollment {
  student: Student;
}

export interface EnrollmentWithCycle extends BaseEnrollment {
  cycle: SchoolCycle;
}

export interface EnrollmentWithSection extends BaseEnrollment {
  section: Section;
}

export interface EnrollmentWithBasicRelations extends BaseEnrollment {
  student: Student;
  cycle: SchoolCycle;
  section: Section;
}

export interface EnrollmentWithFullRelations extends BaseEnrollment {
  student: Student;
  cycle: SchoolCycle;
  section: Section;
  attendances: Attendance[];
  grades: StudentGrade[];
}

// ==================== DTOs ====================
export interface CreateEnrollmentDto {
  studentId: number;
  cycleId: number;
  gradeId: number;
  sectionId: number;
  status?: EnrollmentStatus;
}

export interface UpdateEnrollmentDto {
  studentId?: number;
  cycleId?: number;
  gradeId?: number;
  sectionId?: number;
  status?: EnrollmentStatus;
}

export interface EnrollmentFilterDto {
  studentId?: number;
  cycleId?: number;
  gradeId?: number;
  sectionId?: number;
  status?: EnrollmentStatus;
}

// ==================== API RESPONSES ====================
export interface EnrollmentResponse extends EnrollmentWithBasicRelations {}

export interface EnrollmentDetailResponse extends EnrollmentWithFullRelations {}

export interface EnrollmentListResponse {
  data: EnrollmentResponse[];
  total: number;
  page?: number;
  limit?: number;
}

export interface EnrollmentStatsResponse {
  total: number;
  active: number;
  graduated: number;
  transferred: number;
}

// ==================== API ERROR RESPONSES ====================
export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}

export interface ValidationError extends ApiError {
  details?: string[];
}

// ==================== QUERY PARAMETERS ====================
export interface EnrollmentQueryParams {
  studentId?: string;
  cycleId?: string;
  gradeId?: string;
  sectionId?: string;
  status?: EnrollmentStatus;
  includeRelations?: boolean;
  page?: number;
  limit?: number;
}

export interface EnrollmentStatsQueryParams {
  cycleId?: string;
}

// ==================== FORM DATA TYPES ====================
export interface EnrollmentFormData {
  studentId: number | '';
  cycleId: number | '';
  gradeId: number | '';
  sectionId: number | '';
  status: EnrollmentStatus;
}

export interface EnrollmentFormErrors {
  studentId?: string;
  cycleId?: string;
  gradeId?: string;
  sectionId?: string;
  status?: string;
  general?: string;
}

// ==================== TABLE/LIST TYPES ====================
export interface EnrollmentTableRow {
  id: number;
  studentName: string;
  cycleName: string;
  gradeName: string;
  sectionName: string;
  status: EnrollmentStatus;
  statusLabel: string;
  studentCode?: string;
}

export interface EnrollmentTableColumn {
  key: keyof EnrollmentTableRow;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// ==================== HELPER TYPES ====================
export type EnrollmentStatusOption = {
  value: EnrollmentStatus;
  label: string;
  color?: string;
};

export type EnrollmentAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'graduate'
  | 'transfer'
  | 'reactivate'
  | 'view';

// ==================== CONSTANTS ====================
export const ENROLLMENT_STATUS_OPTIONS: EnrollmentStatusOption[] = [
  { 
    value: EnrollmentStatus.ACTIVE, 
    label: 'Activo', 
    color: 'green' 
  },
  { 
    value: EnrollmentStatus.GRADUATED, 
    label: 'Graduado', 
    color: 'blue' 
  },
  { 
    value: EnrollmentStatus.TRANSFERRED, 
    label: 'Transferido', 
    color: 'orange' 
  }
];

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  [EnrollmentStatus.ACTIVE]: 'Activo',
  [EnrollmentStatus.GRADUATED]: 'Graduado',
  [EnrollmentStatus.TRANSFERRED]: 'Transferido'
};

// ==================== UTILITY FUNCTIONS TYPES ====================
export type EnrollmentTransformer = (enrollment: EnrollmentWithBasicRelations) => EnrollmentTableRow;

export type EnrollmentValidator = (data: CreateEnrollmentDto | UpdateEnrollmentDto) => EnrollmentFormErrors | null;

export type EnrollmentStatusChecker = (status: EnrollmentStatus) => {
  canEdit: boolean;
  canDelete: boolean;
  canGraduate: boolean;
  canTransfer: boolean;
  canReactivate: boolean;
};

// ==================== HOOK TYPES ====================
export interface UseEnrollmentReturn {
  enrollments: EnrollmentResponse[];
  loading: boolean;
  error: string | null;
  create: (data: CreateEnrollmentDto) => Promise<EnrollmentResponse>;
  update: (id: number, data: UpdateEnrollmentDto) => Promise<EnrollmentResponse>;
  remove: (id: number) => Promise<void>;
  graduate: (id: number) => Promise<EnrollmentResponse>;
  transfer: (id: number) => Promise<EnrollmentResponse>;
  reactivate: (id: number) => Promise<EnrollmentResponse>;
  refetch: () => Promise<void>;
}

export interface UseEnrollmentStatsReturn {
  stats: EnrollmentStatsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ==================== CONTEXT TYPES ====================
export interface EnrollmentContextValue {
  selectedEnrollment: EnrollmentDetailResponse | null;
  setSelectedEnrollment: (enrollment: EnrollmentDetailResponse | null) => void;
  filters: EnrollmentFilterDto;
  setFilters: (filters: EnrollmentFilterDto) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}