// src/types/justification.ts

export interface StudentJustification {
  id: number;
  enrollmentId: number;
  startDate: string;
  endDate: string;
  type: 'medical' | 'personal' | 'administrative' | 'other';
  reason: string;
  description?: string;
  documentUrl?: string;
  documentType?: 'pdf' | 'image' | 'doc';
  documentName?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: number;
  approvedAt?: string;
  rejectionReason?: string;
  needsFollowUp: boolean;
  followUpNotes?: string;
  submittedBy: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJustificationDto {
  enrollmentId: number;
  startDate: string;
  endDate: string;
  type: 'medical' | 'personal' | 'administrative' | 'other';
  reason: string;
  description?: string;
  documentUrl?: string;
  documentType?: 'pdf' | 'image' | 'doc';
  documentName?: string;
}

export interface ApproveJustificationDto {
  approvalNotes?: string;
  autoUpdateAttendance?: boolean;
}

export interface RejectJustificationDto {
  rejectionReason: string;
}

export interface BulkApproveJustificationDto {
  justificationIds: number[];
  autoUpdateAttendance?: boolean;
}

export interface BulkRejectJustificationDto {
  justificationIds: number[];
  rejectionReason: string;
}

export interface JustificationResponse {
  data: StudentJustification;
  success: boolean;
  statusCode: number;
  timestamp: string;
}

export interface JustificationListResponse {
  data: StudentJustification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  success: boolean;
  statusCode: number;
  timestamp: string;
}

export interface BulkJustificationResponse {
  approved?: number;
  rejected?: number;
  failed: number;
  results?: any[];
  errors?: any[];
  success: boolean;
  statusCode: number;
  timestamp: string;
}

export interface JustificationApprovalResult {
  justificationId: number;
  success: boolean;
  attendanceUpdated?: number;
  error?: string;
}

export interface JustificationFilters {
  enrollmentId?: number;
  status?: 'pending' | 'approved' | 'rejected';
  type?: 'medical' | 'personal' | 'administrative' | 'other';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  needsFollowUp?: boolean;
}

export interface JustificationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  pendingApproval: StudentJustification[];
}