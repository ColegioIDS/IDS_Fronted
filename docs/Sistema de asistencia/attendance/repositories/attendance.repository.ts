import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  StudentAttendance,
  StudentClassAttendance,
  StudentAttendanceChange,
  StudentAttendanceReport,
  Enrollment,
} from '@prisma/client';

/**
 * AttendanceRepository
 * Handles all database operations for attendance records
 * Abstracts Prisma queries and provides clean data access layer
 */
@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all enrollments for a specific section
   */
  async findEnrollmentsBySection(
    sectionId: number,
    cycleId: number,
  ): Promise<Enrollment[]> {
    return this.prisma.enrollment.findMany({
      where: {
        sectionId,
        cycleId,
        status: 'ACTIVE',
      },
      include: {
        student: true,
      },
    });
  }

  /**
   * Create a student attendance record
   */
  async createStudentAttendance(data: {
    enrollmentId: number;
    date: Date;
    attendanceStatusId: number;
    notes?: string;
    arrivalTime?: string;
    minutesLate?: number;
    recordedBy: number;
  }): Promise<StudentAttendance> {
    return this.prisma.studentAttendance.create({
      data,
    });
  }

  /**
   * Create class attendance records
   * ✅ CHANGED: Now requires attendanceStatusId (FK to AttendanceStatus model)
   */
  async createClassAttendance(data: {
    studentAttendanceId: number;
    scheduleId: number;
    courseAssignmentId: number;
    attendanceStatusId: number;
    status: string;
    arrivalTime?: string;
    notes?: string;
    recordedBy: number;
  }): Promise<StudentClassAttendance> {
    return this.prisma.studentClassAttendance.create({
      data,
    });
  }

  /**
   * Update student attendance
   */
  async updateStudentAttendance(
    id: number,
    data: Partial<StudentAttendance>,
  ): Promise<StudentAttendance> {
    return this.prisma.studentAttendance.update({
      where: { id },
      data,
    });
  }

  /**
   * Find student attendance by ID
   */
  async findStudentAttendanceById(
    id: number,
  ): Promise<StudentAttendance | null> {
    return this.prisma.studentAttendance.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            student: true,
          },
        },
      },
    });
  }

  /**
   * Find attendance records for a student in a date range
   */
  async findAttendanceByEnrollmentAndDateRange(
    enrollmentId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<StudentAttendance[]> {
    return this.prisma.studentAttendance.findMany({
      where: {
        enrollmentId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  /**
   * Get attendance config
   */
  async getAttendanceConfig() {
    return this.prisma.attendanceConfig.findFirst({
      where: { isActive: true },
    });
  }

  /**
   * Get config status mappings by type
   */
  async getConfigStatusMappings(mappingType: 'negative' | 'notes_required') {
    return this.prisma.configStatusMapping.findMany({
      where: {
        mappingType,
        config: {
          isActive: true,
        },
      },
      include: {
        status: true,
      },
    });
  }

  /**
   * Create attendance change record (audit trail)
   */
  async createAttendanceChange(data: {
    studentAttendanceId: number;
    attendanceStatusIdBefore: number;
    attendanceStatusIdAfter: number;
    notesBefore?: string;
    notesAfter?: string;
    arrivalTimeBefore?: string;
    arrivalTimeAfter?: string;
    changeReason?: string;
    changedBy: number;
  }): Promise<StudentAttendanceChange> {
    return this.prisma.studentAttendanceChange.create({
      data,
    });
  }

  /**
   * Find or create attendance report
   */
  async upsertAttendanceReport(data: {
    enrollmentId: number;
    bimesterId: number;
    courseId?: number;
  }) {
    // First, try to find existing report
    const existingReport = await this.prisma.studentAttendanceReport.findFirst({
      where: {
        enrollmentId: data.enrollmentId,
        bimesterId: data.bimesterId,
        courseId: data.courseId || null,
      },
    });

    // If exists, update; otherwise create
    if (existingReport) {
      return this.prisma.studentAttendanceReport.update({
        where: { id: existingReport.id },
        data: {
          lastRecalculatedAt: new Date(),
        },
      });
    }

    return this.prisma.studentAttendanceReport.create({
      data: {
        enrollmentId: data.enrollmentId,
        bimesterId: data.bimesterId,
        courseId: data.courseId,
      },
    });
  }

  /**
   * Find attendance statuses
   */
  async findAttendanceStatuses(where?: any) {
    return this.prisma.attendanceStatus.findMany({
      where: where || { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Find attendance status by code
   */
  async findAttendanceStatusByCode(code: string) {
    return this.prisma.attendanceStatus.findUnique({
      where: { code },
    });
  }

  /**
   * Find sections with their courses
   */
  async findSectionsWithGrades() {
    return this.prisma.section.findMany({
      include: {
        grade: true,
        courseAssignments: {
          include: {
            course: true,
          },
        },
      },
    });
  }

  /**
   * Find all grades
   */
  async findGrades() {
    return this.prisma.grade.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Get the active school cycle
   */
  async getActiveCycle() {
    return this.prisma.schoolCycle.findFirst({
      where: { isActive: true },
    });
  }

  /**
   * Get grades associated with the active school cycle
   */
  async getGradesByActiveCycle() {
    const activeCycle = await this.prisma.schoolCycle.findFirst({
      where: { isActive: true },
    });

    if (!activeCycle) {
      return null;
    }

    return this.prisma.gradeCycle.findMany({
      where: { cycleId: activeCycle.id },
      include: {
        grade: {
          select: {
            id: true,
            name: true,
            level: true,
            order: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        grade: {
          order: 'asc',
        },
      },
    });
  }

  /**
   * Get sections for a specific grade
   */
  async getSectionsByGrade(gradeId: number) {
    return this.prisma.section.findMany({
      where: { gradeId },
      select: {
        id: true,
        name: true,
        capacity: true,
        gradeId: true,
        teacherId: true,
        teacher: {
          select: {
            id: true,
            givenNames: true,
            lastNames: true,
            email: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find bimester by date within cycle
   */
  async findBimesterByDate(cycleId: number, date: Date) {
    return this.prisma.bimester.findFirst({
      where: {
        cycleId,
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });
  }

  /**
   * Find holiday by date within bimester
   */
  async findHolidayByDate(bimesterId: number, date: Date) {
    return this.prisma.holiday.findFirst({
      where: {
        bimesterId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
    });
  }

  /**
   * Find academic week by date within bimester
   */
  async findAcademicWeekByDate(bimesterId: number, date: Date) {
    return this.prisma.academicWeek.findFirst({
      where: {
        bimesterId,
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });
  }

  /**
   * Find schedules for teacher on specific day and section
   */
  async findTeacherSchedulesByDayAndSection(
    teacherId: number,
    dayOfWeek: number,
    sectionId: number,
  ) {
    return this.prisma.schedule.findMany({
      where: {
        teacherId,
        dayOfWeek,
        sectionId,
        courseAssignment: {
          isActive: true,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        courseAssignment: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * Find active teacher absence for specific date
   */
  async findTeacherAbsenceByDate(teacherId: number, date: Date) {
    return this.prisma.teacherAbsence.findFirst({
      where: {
        teacherId,
        startDate: { lte: date },
        endDate: { gte: date },
        status: { in: ['approved', 'active'] },
      },
    });
  }

  /**
   * Find active attendance config
   */
  async findActiveAttendanceConfig() {
    return this.prisma.attendanceConfig.findFirst({
      where: { isActive: true },
    });
  }

  /**
   * Find active enrollments for section and cycle
   */
  async findActiveEnrollmentsBySectionAndCycle(
    sectionId: number,
    cycleId: number,
    date: Date,
  ) {
    // ✅ FIXED: Normalize date to end of day to include same-day enrollments
    const normalizedDate = new Date(date);
    normalizedDate.setHours(23, 59, 59, 999);

    return this.prisma.enrollment.findMany({
      where: {
        sectionId,
        cycleId,
        status: 'ACTIVE',
        dateEnrolled: { lte: normalizedDate },
      },
      include: {
        student: {
          select: {
            id: true,
            codeSIRE: true,
            givenNames: true,
            lastNames: true,
            birthDate: true,
            gender: true,
          },
        },
      },
      orderBy: {
        student: { givenNames: 'asc' },
      },
    });
  }

  /**
   * Find allowed attendance statuses for role
   */
  async findAllowedAttendanceStatusesByRole(roleId: number) {
    const permissions = await this.prisma.roleAttendancePermission.findMany({
      where: {
        roleId,
        canCreate: true,
      },
      include: {
        attendanceStatus: true,
      },
    });

    // Filter only active statuses and sort by order
    const statuses = permissions
      .filter((perm) => perm.attendanceStatus.isActive)
      .sort((a, b) => a.attendanceStatus.order - b.attendanceStatus.order);

    return statuses.map((perm) => ({
      ...perm.attendanceStatus,
      permission: {
        canView: perm.canView,
        canCreate: perm.canCreate,
        canModify: perm.canModify,
        canDelete: perm.canDelete,
        requiresNotes: perm.requiresNotes,
      },
    }));
  }

  /**
   * Find all holidays for a specific bimester
   */
  async findHolidaysByBimester(bimesterId: number) {
    return this.prisma.holiday.findMany({
      where: {
        bimesterId,
      },
      include: {
        bimester: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  /**
   * Find all holidays for a specific cycle
   */
  async findHolidaysByCycle(cycleId: number) {
    return this.prisma.holiday.findMany({
      where: {
        bimester: {
          cycleId,
        },
      },
      include: {
        bimester: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  /**
   * Find active bimester by date
   */
  async findActiveBimesterByDate(date: Date) {
    return this.prisma.bimester.findFirst({
      where: {
        startDate: {
          lte: date,
        },
        endDate: {
          gte: date,
        },
        isActive: true,
      },
      include: {
        cycle: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });
  }
}
