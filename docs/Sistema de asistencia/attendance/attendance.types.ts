/**
 * Context object passed with authenticated requests
 */
export interface UserContext {
  userId: number;
  roleId: number;
  email: string;
}

/**
 * Response types for attendance operations
 */
export interface AttendanceCreateResponse {
  success: boolean;
  createdAttendances: number;
  createdClassAttendances: number;
  createdReports: number;
  records: any[];
}

export interface AttendanceUpdateResponse {
  success: boolean;
  updated: number;
  record: any;
}

export interface AttendanceStatsResponse {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  justifiedAbsentDays: number;
  tardyDays: number;
  attendancePercentage: number;
  consecutiveAbsences: number;
  isAtRisk: boolean;
}

export interface AttendanceConfigDetailsResponseDto {
  id: number;
  name: string;
  description?: string;
  riskThresholdPercentage: number;
  consecutiveAbsenceAlert: number;
  lateThresholdTime: string;
  markAsTardyAfterMinutes: number;
  justificationRequiredAfter: number;
  maxJustificationDays: number;
  autoApproveJustification: boolean;
  autoApprovalAfterDays: number;
  isActive: boolean;
}
