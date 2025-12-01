// src/types/users.types.ts

// ✅ Picture type
export interface Picture {
  id: number;
  userId?: number;
  url: string;
  publicId: string;
  kind: 'profile' | 'document' | 'evidence';
  description: string | null;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
  uploadedAt: string;
  studentId?: number | null;
}

// ✅ Role base (relación)
export interface RoleBasic {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
}

// ✅ User base
export interface User {
  id: number;
  email: string;
  username: string;
  givenNames: string;
  lastNames: string;
  dpi: string;
  phone: string | null;
  gender: 'M' | 'F' | 'O';
  isActive: boolean;
  accountVerified: boolean;
  canAccessPlatform: boolean;
  createdAt: string;
  updatedAt: string;
  roleId: number;
}

// ✅ User con relaciones
export interface UserWithRelations extends User {
  role: RoleBasic;
  pictures?: Picture[];
  parentDetails?: ParentDetails;
  teacherDetails?: TeacherDetails;
  createdBy?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
  modifiedBy?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
}

// ✅ User Stats
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedEmails: number;
  unverifiedEmails: number;
  canAccessPlatform: number;
  cannotAccessPlatform: number;
  usersByRole: Record<string, number>;
}

// ✅ Query params
export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  canAccessPlatform?: boolean;
  roleId?: number;
  sortBy?: 'givenNames' | 'email' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// ✅ Paginated response
export interface PaginatedUsers {
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ Create User DTO
export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  givenNames: string;
  lastNames: string;
  dpi: string;
  phone?: string;
  gender: 'M' | 'F' | 'O';
  roleId: number;
  isActive?: boolean;
  canAccessPlatform?: boolean;
}

// ✅ Update User DTO
export interface UpdateUserDto {
  givenNames?: string;
  lastNames?: string;
  phone?: string;
  gender?: 'M' | 'F' | 'O';
  roleId?: number;
  isActive?: boolean;
  canAccessPlatform?: boolean;
}

// ✅ Change Password DTO
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ✅ Upload Picture DTO
export interface UploadPictureDto {
  file: File;
  kind: 'profile' | 'document' | 'evidence';
  description?: string;
  isDefault?: boolean;
}

// ✅ Picture response after upload
export interface PictureUploadResponse {
  id: number;
  url: string;
  kind: 'profile' | 'document' | 'evidence';
  isDefault: boolean;
}

// ✅ Access control responses
export interface GrantAccessResponse {
  id: number;
  canAccessPlatform: boolean;
  updatedAt: string;
}

export interface RevokeAccessResponse {
  id: number;
  canAccessPlatform: boolean;
  updatedAt: string;
}

export interface VerifyEmailResponse {
  id: number;
  accountVerified: boolean;
  updatedAt: string;
}

// ✅ Error response
export interface UserErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

// ✅ ParentDetails type
export interface ParentDetails {
  id: number;
  userId: number;
  dpiIssuedAt?: string | null;
  email?: string | null;
  workPhone?: string | null;
  occupation?: string | null;
  workplace?: string | null;
  isSponsor: boolean;
  sponsorInfo?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ✅ Update ParentDetails DTO
export interface UpdateParentDetailsDto {
  dpiIssuedAt?: string;
  email?: string;
  workPhone?: string;
  occupation?: string;
  workplace?: string;
  isSponsor?: boolean;
  sponsorInfo?: string;
}

// ✅ TeacherDetails type
export interface TeacherDetails {
  id: number;
  userId: number;
  hiredDate: string;
  isHomeroomTeacher: boolean;
  academicDegree?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ✅ Update TeacherDetails DTO
export interface UpdateTeacherDetailsDto {
  hiredDate?: string;
  isHomeroomTeacher?: boolean;
  academicDegree?: string;
}

// ✅ StudentBasic type (for parent-student links)
export interface StudentBasic {
  id: number;
  codeSIRE: string;
  givenNames: string;
  lastNames: string;
  birthDate?: string;
  gender?: 'M' | 'F' | 'O';
}

// ✅ ParentStudentLink type
export interface ParentStudentLink {
  id: number;
  parentId: number;
  studentId: number;
  relationshipType: string;
  isPrimaryContact: boolean;
  hasLegalCustody: boolean;
  canAccessInfo: boolean;
  livesWithStudent: boolean;
  financialResponsible: boolean;
  emergencyContactPriority: number;
  receivesSchoolNotices: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: UserWithRelations;
  student?: StudentBasic;
}

// ✅ Create ParentStudentLink DTO
export interface CreateParentStudentLinkDto {
  parentId: number;
  studentId: number;
  relationshipType: string;
  isPrimaryContact?: boolean;
  hasLegalCustody?: boolean;
  canAccessInfo?: boolean;
  livesWithStudent?: boolean;
  financialResponsible?: boolean;
  emergencyContactPriority?: number;
  receivesSchoolNotices?: boolean;
}

// ✅ Update ParentStudentLink DTO
export interface UpdateParentStudentLinkDto {
  relationshipType?: string;
  isPrimaryContact?: boolean;
  hasLegalCustody?: boolean;
  canAccessInfo?: boolean;
  livesWithStudent?: boolean;
  financialResponsible?: boolean;
  emergencyContactPriority?: number;
  receivesSchoolNotices?: boolean;
}

// ✅ ParentStudentLink Query Response
export interface PaginatedParentStudentLinks {
  data: ParentStudentLink[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
