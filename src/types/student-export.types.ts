// src/types/student-export.types.ts

export interface ExportSection {
  id: number;
  name: string;
  capacity: number;
  grade: {
    id: number;
    name: string;
  };
}

export interface ExportGrade {
  id: number;
  name: string;
  level: string;
  sections: ExportSection[];
}

export interface ExportCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  grades: ExportGrade[];
}

export interface ExportStudentData {
  id: number;
  givenNames: string;
  lastNames: string;
  dpi: string;
  codeSIRE?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  gradeId: number;
  sectionId: number;
  enrollmentStatus?: string;
  // Campos opcionales según opciones de exportación
  attendance?: {
    present: number;
    absent: number;
    late: number;
    percentage: number;
  };
  grades?: {
    average: number;
    status: string;
  };
  medicalInfo?: {
    hasDisease: boolean;
    diseaseDetails?: string;
    hasAllergies: boolean;
    allergiesDetails?: string;
  };
}

export interface ExportOptions {
  format?: 'excel' | 'pdf';
  includeAttendance?: boolean;
  includeGrades?: boolean;
  includeMedical?: boolean;
}

export interface ExportResult {
  success: boolean;
  message: string;
  filename: string;
  timestamp: string;
}
