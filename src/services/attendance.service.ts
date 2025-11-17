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
const CONFIG_URL = '/api/attendance-config';

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
// CONFIGURATION
// ============================================================================

/**
 * Get attendance statuses
 * GET /api/attendance-config/statuses
 * 
 * @returns List of available attendance statuses
 */
export async function getAttendanceStatuses(): Promise<AttendanceConfigurationResponse> {
  const response = await apiClient.get<AttendanceConfigurationResponse>(
    `${CONFIG_URL}/statuses`
  );

  return response.data;
}

/**
 * Get grades and sections
 * GET /api/attendance-config/grades-sections
 *
 * @param schoolCycleId - Optional school cycle ID
 * @returns Grades and sections for selection
 */
export async function getGradesAndSections(
  schoolCycleId?: number
): Promise<GradesAndSectionsResponse> {
  try {
    // Try the combined endpoint first
    const response = await apiClient.get<GradesAndSectionsResponse>(
      `${CONFIG_URL}/grades-sections`,
      { params: { schoolCycleId } }
    );

    // Check if response is successful
    if (response.data?.success) {
      return response.data;
    }

    // If not successful or has validation errors, fall back to separate endpoints
    console.warn('[getGradesAndSections] Combined endpoint failed, using fallback endpoints');

    // Load grades and sections separately
    const [gradesResponse, sectionsResponse] = await Promise.all([
      apiClient.get<{ success: boolean; data: any[] }>('/api/grades'),
      apiClient.get<{ success: boolean; data: any[] }>('/api/sections'),
    ]);

    return {
      success: true,
      data: {
        grades: gradesResponse.data?.data || [],
        sections: sectionsResponse.data?.data || [],
      },
      message: 'Grades and sections loaded successfully (fallback)',
    };
  } catch (error) {
    console.error('[getGradesAndSections] Error:', error);

    // Last resort: try separate endpoints
    try {
      const [gradesResponse, sectionsResponse] = await Promise.all([
        apiClient.get<{ success: boolean; data: any[] }>('/api/grades'),
        apiClient.get<{ success: boolean; data: any[] }>('/api/sections'),
      ]);

      return {
        success: true,
        data: {
          grades: gradesResponse.data?.data || [],
          sections: sectionsResponse.data?.data || [],
        },
        message: 'Grades and sections loaded successfully (fallback)',
      };
    } catch (fallbackError) {
      console.error('[getGradesAndSections] Fallback also failed:', fallbackError);
      throw error; // Throw original error
    }
  }
}

/**
 * Get holidays
 * GET /api/attendance-config/holidays
 * 
 * @param bimesterId - Optional bimester ID
 * @returns List of holidays
 */
export async function getHolidays(
  bimesterId?: number
): Promise<HolidaysResponse> {
  const response = await apiClient.get<HolidaysResponse>(
    `${CONFIG_URL}/holidays`,
    { params: { bimesterId } }
  );

  return response.data;
}

/**
 * Get complete attendance configuration
 * GET /api/attendance-config
 * 
 * @param schoolCycleId - Optional school cycle ID
 * @returns Complete configuration
 */
export async function getAttendanceConfig(
  schoolCycleId?: number
): Promise<AttendanceConfigurationResponse> {
  const response = await apiClient.get<AttendanceConfigurationResponse>(
    CONFIG_URL,
    { params: { schoolCycleId } }
  );

  return response.data;
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
  getAttendanceStatuses,
  getGradesAndSections,
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
