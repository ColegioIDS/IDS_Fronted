import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  StudentClassAttendance,
  StudentAttendanceReport,
  Enrollment,
} from '@prisma/client';

/**
 * AttendanceRepository - REFACTORIZADO
 * Handles all database operations for attendance records
 * ✨ CAMBIO: StudentClassAttendance es ahora autónoma (sin StudentAttendance padre)
 * ✨ CAMBIO: Auditoría integrada en StudentClassAttendance (sin StudentAttendanceChange)
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
   * Create class attendance record - NOW AUTONOMOUS
   * ✨ NUEVO: Ya no requiere studentAttendanceId
   * ✨ NUEVO: Ahora incluye enrollmentId y date directamente
   */
  async createClassAttendance(data: {
    enrollmentId: number;
    date: Date;
    scheduleId: number;
    courseAssignmentId: number;
    attendanceStatusId: number;
    status: string;
    arrivalTime?: string | null;
    notes?: string | null;
    recordedBy?: number | null;
  }): Promise<StudentClassAttendance> {
    return this.prisma.studentClassAttendance.create({
      data,
    });
  }

  /**
   * Update class attendance record with audit fields
   * ✨ NUEVO: Actualiza campos de auditoría integrados
   */
  async updateClassAttendance(
    id: number,
    data: {
      attendanceStatusId?: number;
      status?: string;
      arrivalTime?: string | null;
      notes?: string | null;
      lastModifiedBy?: number | null;
      lastModifiedAt?: Date;
      modificationReason?: string | null;
    },
  ): Promise<StudentClassAttendance> {
    return this.prisma.studentClassAttendance.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Find class attendance by ID with full details
   */
  async findClassAttendanceById(
    id: number,
  ): Promise<StudentClassAttendance | null> {
    return this.prisma.studentClassAttendance.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            student: true,
          },
        },
        schedule: true,
        courseAssignment: true,
        attendanceStatus: true,
        recordedByUser: true,
        modifiedByUser: true,
      },
    });
  }

  /**
   * Find class attendances by enrollment and date
   * ✨ NUEVO: Busca directamente en StudentClassAttendance (no en padre)
   */
  async findClassAttendancesByEnrollmentAndDate(
    enrollmentId: number,
    date: Date,
  ): Promise<StudentClassAttendance[]> {
    return this.prisma.studentClassAttendance.findMany({
      where: {
        enrollmentId,
        date,
      },
      include: {
        schedule: {
          include: {
            course: true,
          },
        },
        courseAssignment: true,
        attendanceStatus: true,
        recordedByUser: true,
        modifiedByUser: true,
      },
      orderBy: {
        schedule: {
          startTime: 'asc',
        },
      },
    });
  }

  /**
   * Find class attendances by enrollment in date range
   */
  async findClassAttendancesByEnrollmentAndDateRange(
    enrollmentId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<StudentClassAttendance[]> {
    return this.prisma.studentClassAttendance.findMany({
      where: {
        enrollmentId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        schedule: {
          include: {
            course: true,
          },
        },
        attendanceStatus: true,
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

  /**
   * Obtiene asistencias de una sección en una fecha específica
   * ✨ NUEVO: Retorna directamente desde StudentClassAttendance (es autónoma)
   */
  async getSectionAttendanceByDate(
    sectionId: number,
    cycleId: number,
    date: Date,
  ): Promise<
    {
      enrollmentId: number;
      studentId: number;
      studentName: string;
      date: string;
      dayStatus: string;
      classAttendances: {
        id: number;
        scheduleId: number;
        className: string;
        startTime: string;
        endTime: string;
        attendanceStatusId: number;
        status: string;
        arrivalTime: string | null;
        notes: string | null;
        recordedBy: string | null;
        modifiedBy: string | null;
        modificationReason: string | null;
      }[];
    }[]
  > {
    // Obtener enrollments activos de la sección en el ciclo
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        sectionId,
        cycleId,
        status: 'ACTIVE',
      },
      include: {
        student: {
          select: {
            id: true,
            givenNames: true,
            lastNames: true,
          },
        },
      },
    });

    if (enrollments.length === 0) {
      return [];
    }

    // Obtener StudentClassAttendance para cada enrollment en esa fecha (directamente)
    const classAttendances = await this.prisma.studentClassAttendance.findMany({
      where: {
        enrollmentId: {
          in: enrollments.map((e) => e.id),
        },
        date: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        },
      },
      include: {
        schedule: {
          include: {
            course: {
              select: {
                name: true,
              },
            },
          },
        },
        attendanceStatus: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        recordedByUser: {
          select: {
            id: true,
            givenNames: true,
            lastNames: true,
          },
        },
        modifiedByUser: {
          select: {
            id: true,
            givenNames: true,
            lastNames: true,
          },
        },
      },
      orderBy: [
        { enrollmentId: 'asc' },
        { schedule: { startTime: 'asc' } },
      ],
    });

    // Agrupar por enrollmentId
    const attendancesByEnrollment = new Map<number, typeof classAttendances>();
    classAttendances.forEach((ca) => {
      if (!attendancesByEnrollment.has(ca.enrollmentId)) {
        attendancesByEnrollment.set(ca.enrollmentId, []);
      }
      attendancesByEnrollment.get(ca.enrollmentId)!.push(ca);
    });

    // Construir respuesta estructurada
    const result: {
      enrollmentId: number;
      studentId: number;
      studentName: string;
      date: string;
      dayStatus: string;
      classAttendances: {
        id: number;
        scheduleId: number;
        className: string;
        startTime: string;
        endTime: string;
        attendanceStatusId: number;
        status: string;
        arrivalTime: string | null;
        notes: string | null;
        recordedBy: string | null;
        modifiedBy: string | null;
        modificationReason: string | null;
      }[];
    }[] = [];
    for (const enrollment of enrollments) {
      const attendances = attendancesByEnrollment.get(enrollment.id) || [];

      if (attendances.length === 0) {
        continue; // Skip if no attendance records
      }

      // Calcular status general del día (si todos presentes, si alguno ausente, etc)
      const classStatuses = attendances.map((ca) => ca.status);
      let dayStatus = 'PRESENT'; // Por defecto

      if (classStatuses.includes('ABSENT')) {
        dayStatus = 'ABSENT';
      } else if (classStatuses.some((s) => s === 'TARDY' || s === 'LATE')) {
        dayStatus = 'TARDY';
      } else if (
        classStatuses.includes('EXCUSED') ||
        classStatuses.includes('JUSTIFIED')
      ) {
        dayStatus = 'EXCUSED';
      }

      result.push({
        enrollmentId: enrollment.id,
        studentId: enrollment.studentId,
        studentName: `${enrollment.student.givenNames} ${enrollment.student.lastNames}`,
        date: date.toISOString().split('T')[0],
        dayStatus,
        classAttendances: attendances.map((ca) => ({
          id: ca.id,
          scheduleId: ca.scheduleId,
          className: ca.schedule.course.name,
          startTime: ca.schedule.startTime,
          endTime: ca.schedule.endTime,
          attendanceStatusId: ca.attendanceStatusId,
          status: ca.status,
          arrivalTime: ca.arrivalTime,
          notes: ca.notes,
          recordedBy: ca.recordedByUser
            ? `${ca.recordedByUser.givenNames} ${ca.recordedByUser.lastNames}`
            : null,
          modifiedBy: ca.modifiedByUser
            ? `${ca.modifiedByUser.givenNames} ${ca.modifiedByUser.lastNames}`
            : null,
          modificationReason: ca.modificationReason,
        })),
      });
    }

    return result;
  }
}

