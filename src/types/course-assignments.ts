// ==================== TYPES ====================
// types/course-assignments.ts

export type AssignmentType = 'titular' | 'specialist';

export interface Teacher {
  id: number;
  givenNames: string;
  lastNames: string;
}

export interface Course {
  id: number;
  name: string;
  code: string;
  color?: string;
}

export interface Section {
  id: number;
  name: string;
  grade: {
    id: number;
    name: string;
    order: number;
  };
}

export interface CourseAssignment {
  id: number;
  sectionId: number;
  courseId: number;
  teacherId: number;
  assignmentType: AssignmentType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  section: Section;
  course: Course;
  teacher: Teacher;
}

export interface TeacherCourse extends Course {
  sectionId: number;
  sectionName: string;
  assignmentType: AssignmentType;
  assignmentId: number;
}

export interface GradeCourseConfig {
  id: number;
  name: string;
  teacher: Teacher;
  courseAssignments: {
    id: number;
    course: Course;
    teacher: Teacher;
    assignmentType: AssignmentType;
    isActive: boolean;
  }[];
}

export interface CreateCourseAssignmentRequest {
  sectionId: number;
  courseId: number;
  teacherId: number;
  assignmentType?: AssignmentType;
  isActive?: boolean;
}

export interface UpdateCourseAssignmentRequest {
  teacherId?: number;
  assignmentType?: AssignmentType;
  isActive?: boolean;
}

export interface BulkUpdateRequest {
  gradeId: number;
  assignments: {
    sectionId: number;
    courseId: number;
    teacherId: number;
  }[];
}

export interface CourseAssignmentFilters {
  sectionId?: number;
  teacherId?: number;
  courseId?: number;
  assignmentType?: AssignmentType;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: 'course' | 'teacher' | 'section' | 'assignmentType' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}

export interface CourseAssignmentResponse {
  data: CourseAssignment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CourseAssignmentStats {
  totalAssignments: number;
  titularAssignments: number;
  specialistAssignments: number;
  activeAssignments: number;
  inactiveAssignments: number;
  assignmentsByType: {
    type: AssignmentType;
    count: number;
  }[];
  teachersWithSpecialties: number;
}

