// src/types/config-status-mapping.types.ts

export interface CreateConfigStatusMappingDto {
  configId: number;
  statusId: number;
  mappingType: 'negative' | 'notesRequired'; // ⭐ REQUIRED - Define the type of mapping
}

export interface UpdateConfigStatusMappingDto {
  configId?: number;
  statusId?: number;
  mappingType?: 'negative' | 'notesRequired';
}

export interface ConfigStatusMappingResponseDto {
  id: number;
  configId: number;
  statusId: number;
  mappingType: 'negative' | 'notesRequired'; // ⭐ Mapping type returned from backend
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Setup/Config endpoints
export interface AttendanceConfigDto {
  id: number;
  name: string;
  description: string;
  riskThresholdPercentage: number;
  consecutiveAbsenceAlert: number;
  defaultNotesPlaceholder: string | null;
  lateThresholdTime: string;
  markAsTardyAfterMinutes: number;
  justificationRequiredAfter: number;
  maxJustificationDays: number;
  autoApproveJustification: boolean;
  autoApprovalAfterDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStatusDto {
  id: number;
  code: string;
  name: string;
  description: string;
  requiresJustification: boolean;
  canHaveNotes: boolean;
  isNegative: boolean;
  isExcused: boolean;
  isTemporal: boolean;
  colorCode: string;
  order: number;
  isActive: boolean;
}

// Complete setup endpoint response
export interface CurrentCompleteResponseDto {
  config: AttendanceConfigDto;
  statusMappings: {
    negative: ConfigStatusMappingResponseDto[];
    notesRequired: ConfigStatusMappingResponseDto[];
    [key: string]: ConfigStatusMappingResponseDto[];
  };
  summary?: {
    totalMappings: number;
    activeStatuses: number;
  };
}