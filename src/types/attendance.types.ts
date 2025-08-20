// types/attendance.types.ts
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface BaseAttendance {
  id: number;
  enrollmentId: number;
  bimesterId: number;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceStudent {
  id: number;
  givenNames: string;
  lastNames: string;
  codeSIRE?: string;
}

export interface AttendanceGrade {
  id: number;
  name: string;
  level: string;
}

export interface AttendanceSection {
  id: number;
  name: string;
  grade: AttendanceGrade;
}

export interface AttendanceEnrollment {
  id: number;
  student: AttendanceStudent;
  section: AttendanceSection;
}

export interface AttendanceBimester {
  id: number;
  name: string;
  number: number;
  startDate?: Date;
  endDate?: Date;
}

export interface Attendance extends BaseAttendance {
  enrollment: AttendanceEnrollment;
  bimester: AttendanceBimester;
}

export interface CreateAttendanceRequest {
  enrollmentId: number;
  bimesterId: number;
  date: Date | string;
  status: AttendanceStatus;
  notes?: string;
}

export interface UpdateAttendanceRequest {
  enrollmentId?: number;
  bimesterId?: number;
  date?: Date | string;
  status?: AttendanceStatus;
  notes?: string;
}

export interface AttendanceFilters {
  enrollmentId?: number;
  bimesterId?: number;
  studentId?: number;
  status?: AttendanceStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: string;
}

export interface AttendanceResponse {
  data: Attendance[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BulkAttendanceRequest {
  attendances: CreateAttendanceRequest[];
}

// Para formularios y estados
export interface AttendanceFormData {
  enrollmentId: string;
  bimesterId: string;
  date: string;
  status: AttendanceStatus;
  notes: string;
}

export interface UpdateAttendanceFormData {
  enrollmentId?: string;
  bimesterId?: string;
  date?: string;
  status?: AttendanceStatus;
  notes?: string;
}

export interface AttendanceTableRow extends Attendance {
  studentName: string;
  gradeName: string;
  sectionName: string;
  bimesterName: string;
  formattedDate: string;
}

// Para el estado del store
export interface AttendanceState {
  attendances: Attendance[];
  attendance: Attendance | null;
  stats: AttendanceStats | null;
  loading: boolean;
  error: string | null;
  filters: AttendanceFilters;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Para selectores y opciones
export interface AttendanceStatusOption {
  value: AttendanceStatus;
  label: string;
  color: string;
  icon?: string;
}

export interface EnrollmentOption {
  value: number;
  label: string;
  studentId: number;
  studentName: string;
  section: string;
  grade: string;
}

export interface BimesterOption {
  value: number;
  label: string;
  number: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}