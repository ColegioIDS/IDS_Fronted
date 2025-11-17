/**
 * =========================
 * ATTENDANCE SERVICE - HTTP Handlers
 * =========================
 * 
 * Complete HTTP service for all attendance operations
 * All 4 backend endpoints implemented
 * Built with Axios + React Query
 */

import { api as apiClient } from '@/config/api';
import {
  CreateAttendancePayload,
  BulkCreateAttendancePayload,
  BulkTeacherAttendancePayload,
  BulkBySchedulesPayload,
  UpdateAttendancePayload,
  BulkUpdateAttendancePayload,
  BulkApplyStatusPayload,
  BulkDeleteAttendancePayload,
  CreateJustificationPayload,
  UpdateJustificationPayload,
  AttendanceQueryParams,
  AttendanceQueryWithScope,
  StudentAttendanceWithRelations,
  BulkAttendanceResponse,
  PaginatedAttendanceResponse,
  AttendanceReport,
  AttendanceReportResponse,
  StudentJustification,
  AttendanceConfigurationResponse,
  GradesAndSectionsResponse,
  HolidaysResponse,
} from '../types/attendance.types';
import {
  validateCreateAttendance,
  validateUpdateAttendance,
  validateBulkCreate,
  validateBulkTeacherAttendance,
  validateBulkBySchedules,
  formatValidationErrors,
} from '../types/attendance.schemas';

// ============================================================================
// API ENDPOINTS
// ============================================================================

const BASE_URL = '/api/attendance';

// ============================================================================
// ATTENDANCE RECORD OPERATIONS
// ============================================================================

/**
 * Register attendance - Individual or bulk creation
 * POST /api/attendance/register
 * 
 * @param payload - Attendance record(s) to create
 * @returns Created record(s)
 */
export async function registerAttendance(
  payload: CreateAttendancePayload | BulkCreateAttendancePayload
): Promise<BulkAttendanceResponse> {
  // Validate payload client-side first
  const isBulk = 'attendances' in payload;
  const schema = isBulk ? validateBulkCreate(payload) : validateCreateAttendance(payload);

  if (!schema.success) {
    const errors = formatValidationErrors(schema.error);
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  const response = await apiClient.post<BulkAttendanceResponse>(
    `${BASE_URL}/register`,
    isBulk ? payload : { attendances: [payload] }
  );

  return response.data;
}

/**
 * Register attendance by teacher (bulk for all their courses)
 * POST /api/attendance/register/by-teacher
 * 
 * @param payload - Teacher attendance payload
 * @returns Created records
 */
export async function registerTeacherAttendance(
  payload: BulkTeacherAttendancePayload
): Promise<BulkAttendanceResponse> {
  // Validate payload client-side
  const validation = validateBulkTeacherAttendance(payload);

  if (!validation.success) {
    const errors = formatValidationErrors(validation.error);
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  const response = await apiClient.post<BulkAttendanceResponse>(
    `${BASE_URL}/register/by-teacher`,
    payload
  );

  return response.data;
}

/**
 * Register attendance by schedules
 * POST /api/attendance/register/by-schedules
 * 
 * @param payload - Schedule-based attendance payload
 * @returns Created records
 */
export async function registerBySchedules(
  payload: BulkBySchedulesPayload
): Promise<BulkAttendanceResponse> {
  // Validate payload client-side
  const validation = validateBulkBySchedules(payload);

  if (!validation.success) {
    const errors = formatValidationErrors(validation.error);
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  const response = await apiClient.post<BulkAttendanceResponse>(
    `${BASE_URL}/register/by-schedules`,
    payload
  );

  return response.data;
}

/**
 * Update attendance record
 * PATCH /api/attendance/:id
 * ⚠️ changeReason is MANDATORY
 * 
 * @param id - Attendance record ID
 * @param payload - Updated data with mandatory changeReason
 * @returns Updated record
 */
export async function updateAttendance(
  id: number,
  payload: UpdateAttendancePayload
): Promise<StudentAttendanceWithRelations> {
  // Validate payload client-side
  const validation = validateUpdateAttendance(payload);

  if (!validation.success) {
    const errors = formatValidationErrors(validation.error);
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  const response = await apiClient.patch<StudentAttendanceWithRelations>(
    `${BASE_URL}/${id}`,
    payload
  );

  return response.data;
}

/**
 * Bulk update attendance records
 * PATCH /api/attendance/bulk/update
 * 
 * @param payload - IDs and update data
 * @returns Update results
 */
export async function bulkUpdateAttendance(
  payload: BulkUpdateAttendancePayload
): Promise<BulkAttendanceResponse> {
  const response = await apiClient.patch<BulkAttendanceResponse>(
    `${BASE_URL}/bulk/update`,
    payload
  );

  return response.data;
}

/**
 * Bulk apply status to multiple students
 * PATCH /api/attendance/bulk/apply-status
 * 
 * @param payload - Enrollments and status
 * @returns Results
 */
export async function bulkApplyStatus(
  payload: BulkApplyStatusPayload
): Promise<BulkAttendanceResponse> {
  const response = await apiClient.patch<BulkAttendanceResponse>(
    `${BASE_URL}/bulk/apply-status`,
    payload
  );

  return response.data;
}

/**
 * Bulk delete attendance records
 * DELETE /api/attendance/bulk
 * 
 * @param payload - IDs to delete
 * @returns Deletion results
 */
export async function bulkDeleteAttendance(
  payload: BulkDeleteAttendancePayload
): Promise<BulkAttendanceResponse> {
  const response = await apiClient.delete<BulkAttendanceResponse>(
    `${BASE_URL}/bulk`,
    { data: payload }
  );

  return response.data;
}

// ============================================================================
// ATTENDANCE RETRIEVAL
// ============================================================================

/**
 * Get attendance history with pagination
 * GET /api/attendance/enrollment/:enrollmentId
 * 
 * @param enrollmentId - Student enrollment ID
 * @param params - Query parameters (page, limit, filters, scope)
 * @returns Paginated attendance records
 */
export async function getAttendanceHistory(
  enrollmentId: number,
  params?: AttendanceQueryWithScope
): Promise<PaginatedAttendanceResponse> {
  const response = await apiClient.get<PaginatedAttendanceResponse>(
    `${BASE_URL}/enrollment/${enrollmentId}`,
    { params }
  );

  return response.data;
}

/**
 * Get attendance report
 * GET /api/attendance/report/:enrollmentId
 * 
 * @param enrollmentId - Student enrollment ID
 * @param params - Query parameters (dateFrom, dateTo, bimesterId)
 * @returns Consolidated attendance report
 */
export async function getAttendanceReport(
  enrollmentId: number,
  params?: Pick<AttendanceQueryParams, 'dateFrom' | 'dateTo' | 'bimesterId'>
): Promise<AttendanceReportResponse> {
  const response = await apiClient.get<AttendanceReportResponse>(
    `${BASE_URL}/report/${enrollmentId}`,
    { params }
  );

  return response.data;
}

/**
 * Get attendance statistics by section
 * GET /api/attendance/section/:sectionId/stats
 * 
 * @param sectionId - Section ID
 * @param params - Query parameters
 * @returns Statistics for all students in section
 */
export async function getSectionAttendanceStats(
  sectionId: number,
  params?: AttendanceQueryParams
): Promise<PaginatedAttendanceResponse> {
  const response = await apiClient.get<PaginatedAttendanceResponse>(
    `${BASE_URL}/section/${sectionId}/stats`,
    { params }
  );

  return response.data;
}

// ============================================================================
// JUSTIFICATIONS
// ============================================================================

/**
 * Create absence justification
 * POST /api/attendance/justifications
 * 
 * @param payload - Justification data
 * @returns Created justification
 */
export async function createJustification(
  payload: CreateJustificationPayload
): Promise<StudentJustification> {
  const response = await apiClient.post<StudentJustification>(
    `${BASE_URL}/justifications`,
    payload
  );

  return response.data;
}

/**
 * Update justification status
 * PATCH /api/attendance/justifications/:id
 * 
 * @param id - Justification ID
 * @param payload - Updated data
 * @returns Updated justification
 */
export async function updateJustification(
  id: number,
  payload: UpdateJustificationPayload
): Promise<StudentJustification> {
  const response = await apiClient.patch<StudentJustification>(
    `${BASE_URL}/justifications/${id}`,
    payload
  );

  return response.data;
}

/**
 * Get justifications by enrollment
 * GET /api/attendance/justifications/enrollment/:enrollmentId
 * 
 * @param enrollmentId - Enrollment ID
 * @param params - Query parameters
 * @returns List of justifications
 */
export async function getJustifications(
  enrollmentId: number,
  params?: AttendanceQueryParams
): Promise<PaginatedAttendanceResponse> {
  const response = await apiClient.get<PaginatedAttendanceResponse>(
    `${BASE_URL}/justifications/enrollment/${enrollmentId}`,
    { params }
  );

  return response.data;
}

// ============================================================================
// CONFIGURATION & HELPERS
// ============================================================================

/**
 * Get active cycle
 * GET /api/attendance/cycle/active
 *
 * @returns Active school cycle
 */
export async function getActiveCycle() {
  const response = await apiClient.get<any>(`${BASE_URL}/cycle/active`);
  return response.data;
}

/**
 * Get grades from active cycle
 * GET /api/attendance/cycle/active/grades
 *
 * @returns List of grades for active cycle
 */
export async function getGradesFromActiveCycle(): Promise<any> {
  const response = await apiClient.get<any>(`${BASE_URL}/cycle/active/grades`);
  return response.data;
}

/**
 * Get sections by grade
 * GET /api/attendance/grades/:gradeId/sections
 *
 * @param gradeId - Grade ID
 * @returns List of sections for the grade
 */
export async function getSectionsByGrade(gradeId: number): Promise<any> {
  const response = await apiClient.get<any>(`${BASE_URL}/grades/${gradeId}/sections`);
  return response.data;
}

/**
 * Get grades and sections combined (for compatibility)
 * Uses /api/attendance/cycle/active/grades
 *
 * Note: This function loads grades first, then loads ALL sections for all grades
 * @returns Grades and sections for selection
 */
export async function getGradesAndSections(): Promise<GradesAndSectionsResponse> {
  try {
    // Get grades from active cycle
    const gradesData = await getGradesFromActiveCycle();

    // Extract grade IDs to load sections
    const grades = gradesData || [];
    const gradeIds = grades.map((gc: any) => gc.grade?.id || gc.gradeId).filter(Boolean);

    // Load sections for each grade in parallel
    const sectionsPromises = gradeIds.map((gradeId: number) =>
      getSectionsByGrade(gradeId).catch(() => [])
    );

    const sectionsArrays = await Promise.all(sectionsPromises);
    const sections = sectionsArrays.flat();

    // Extract just the grade objects
    const gradeObjects = grades.map((gc: any) => gc.grade || gc);

    return {
      success: true,
      data: {
        grades: gradeObjects,
        sections: sections,
      },
      message: 'Grades and sections loaded successfully',
    };
  } catch (error) {
    console.error('[getGradesAndSections] Error:', error);
    throw error;
  }
}

/**
 * Get allowed attendance statuses for a role
 * GET /api/attendance/status/allowed/role/:roleId
 *
 * @param roleId - Role ID
 * @returns List of allowed attendance statuses
 */
export async function getAllowedAttendanceStatusesByRole(roleId: number) {
  const response = await apiClient.get<any>(
    `${BASE_URL}/status/allowed/role/${roleId}`
  );
  return response.data;
}

/**
 * Get attendance statuses (uses role-based endpoint)
 * Compatibility function - requires roleId from auth context
 *
 * @param roleId - Role ID from authenticated user
 * @returns List of available attendance statuses
 */
export async function getAttendanceStatuses(roleId?: number): Promise<AttendanceConfigurationResponse> {
  if (!roleId) {
    throw new Error('roleId is required to fetch attendance statuses');
  }

  const response = await getAllowedAttendanceStatusesByRole(roleId);

  return {
    success: response.success || true,
    data: {
      attendanceStatuses: response.data || [],
    },
    message: response.message || 'Attendance statuses retrieved successfully',
  };
}

/**
 * Validate if date is a holiday
 * GET /api/attendance/holiday/by-date
 *
 * @param bimesterId - Bimester ID
 * @param date - Date to check (YYYY-MM-DD)
 * @returns Holiday data or null
 */
export async function validateHolidayByDate(bimesterId: number, date: string) {
  const response = await apiClient.get<any>(
    `${BASE_URL}/holiday/by-date`,
    { params: { bimesterId, date } }
  );
  return response.data;
}

/**
 * Get holidays (compatibility function)
 * Note: Backend only has validation endpoint, not list endpoint
 *
 * @param bimesterId - Optional bimester ID
 * @returns Empty array (endpoint not available in backend)
 */
export async function getHolidays(bimesterId?: number): Promise<HolidaysResponse> {
  console.warn('[getHolidays] Backend does not have a list holidays endpoint. Use validateHolidayByDate instead.');

  return {
    success: true,
    data: [],
    message: 'Holidays list endpoint not available. Use validateHolidayByDate for specific dates.',
  };
}

/**
 * Get attendance configuration
 * GET /api/attendance/config/active
 *
 * @returns Active attendance configuration
 */
export async function getAttendanceConfig(): Promise<AttendanceConfigurationResponse> {
  const response = await apiClient.get<any>(`${BASE_URL}/config/active`);

  return {
    success: response.success || true,
    data: response.data || {},
    message: response.message || 'Config retrieved successfully',
  };
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Format API error messages for display
 * @param error - Error from API
 * @returns User-friendly error message
 */
export function formatAttendanceError(error: unknown): string {
  if (error instanceof Error) {
    // Zod validation error
    if (error.message.includes('Validation failed')) {
      return error.message;
    }

    // API error with response
    if ('response' in error) {
      const response = (error as any).response;
      const message = response?.data?.error?.message || response?.data?.message;
      return message || 'An error occurred while processing attendance';
    }

    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Check if error is a validation error
 * @param error - Error to check
 * @returns true if validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('Validation failed');
  }
  return false;
}

// ============================================================================
// EXPORT GROUPS FOR EASIER IMPORTING
// ============================================================================

/**
 * All mutation operations (create, update, delete)
 */
export const attendanceMutations = {
  registerAttendance,
  registerTeacherAttendance,
  registerBySchedules,
  updateAttendance,
  bulkUpdateAttendance,
  bulkApplyStatus,
  bulkDeleteAttendance,
};

/**
 * All query operations (get, list, search)
 */
export const attendanceQueries = {
  getAttendanceHistory,
  getAttendanceReport,
  getSectionAttendanceStats,
  getActiveCycle,
  getGradesFromActiveCycle,
  getSectionsByGrade,
  getGradesAndSections,
  getAllowedAttendanceStatusesByRole,
  getAttendanceStatuses,
  validateHolidayByDate,
  getHolidays,
  getAttendanceConfig,
};

/**
 * All justification operations
 */
export const justificationOperations = {
  createJustification,
  updateJustification,
  getJustifications,
};
