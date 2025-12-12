/**
 * Índice de exportaciones del módulo de Assignments
 * Centraliza todas las exports para fácil importación
 */

// ==================== TYPES ====================
export type {
  Assignment,
  AssignmentSubmission,
  Student,
  Teacher,
  Course,
  Bimester,
  Grade,
  Section,
  CreateAssignmentDTO,
  UpdateAssignmentDTO,
  SubmitAssignmentDTO,
  GradeSubmissionDTO,
  AssignmentResponse,
  AssignmentSubmissionResponse,
  SubmissionsListResponse,
  PaginatedResponse,
  AssignmentFilters,
  SubmissionFilters,
  GradeOption,
  SectionOption,
  CourseOption,
  BimesterOption,
  CascadeFormState,
  CascadeFormActions,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  AssignmentFormData,
  FormValidationError,
} from '@/types/assignments.types';

export {
  AssignmentStatus,
  SubmissionStatus,
} from '@/types/assignments.types';

// ==================== SCHEMAS ====================
export {
  createAssignmentSchema,
  updateAssignmentSchema,
  submitAssignmentSchema,
  gradeSubmissionSchema,
  assignmentFiltersSchema,
  validateCreateAssignment,
  validateUpdateAssignment,
  validateSubmitAssignment,
  validateGradeSubmission,
  validateAssignmentFilters,
} from '@/schemas/assignments.schema';

export type {
  CreateAssignmentInput,
  UpdateAssignmentInput,
  SubmitAssignmentInput,
  GradeSubmissionInput,
  AssignmentFiltersInput,
} from '@/schemas/assignments.schema';

// ==================== SERVICES ====================
export {
  assignmentsCascadeService,
  assignmentsService,
} from '@/services/assignments.service';

// ==================== HOOKS ====================
export { useAssignmentsCascade } from '@/hooks/useAssignmentsCascade';
export type { UseAssignmentsCascadeReturn } from '@/hooks/useAssignmentsCascade';

// ==================== COMPONENTES ====================
export { AssignmentsCascadeForm } from '@/components/features/assignments/AssignmentsCascadeForm';
export { AssignmentsPageContent } from '@/components/features/assignments/AssignmentsPageContent';
export { AssignmentsForm } from '@/components/features/assignments/AssignmentsForm';
export { CreateAssignmentForm } from '@/components/features/assignments/CreateAssignmentForm';
export { AssignmentsListTable } from '@/components/features/assignments/AssignmentsListTable';

