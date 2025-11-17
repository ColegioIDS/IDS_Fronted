import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AttendanceRepository } from '../repositories';
import { AttendanceValidationService } from './attendance-validation.service';
import { UserContext } from '../attendance.types';
import {
  CreateAttendanceDto,
  createAttendanceSchema,
  BulkTeacherAttendanceDto,
  bulkTeacherAttendanceSchema,
  UpdateAttendanceDto,
  updateAttendanceSchema,
} from '../dto';
import {
  AttendanceStatus,
  StudentAttendance,
  StudentAttendanceReport,
  Enrollment,
  StudentClassAttendance,
  StudentAttendanceChange,
} from '@prisma/client';

/**
 * AttendanceService - Main business logic for attendance registration and management
 *
 * Responsibilities:
 * - Create teacher attendance (bulk registration for all courses)
 * - Update attendance records (with audit trail)
 * - Query attendance history
 * - Recalculate attendance reports automatically
 * - Manage transactional operations
 */
@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    private attendanceRepository: AttendanceRepository,
    private validationService: AttendanceValidationService,
  ) {}

  /**
   * CREAR ASISTENCIA MASIVA (Maestro registra todos sus estudiantes de una vez)
   *
   * Flow:
   * 1. Validate DTO structure
   * 2. Execute 17 validation layers sequentially
   * 3. Find all enrollments for the section
   * 4. Start transaction
   *    a. Create StudentAttendance records
   *    b. Create StudentClassAttendance for each schedule
   *    c. Recalculate StudentAttendanceReport
   * 5. Return created records
   *
   * @param dto BulkTeacherAttendanceDto with date, section, status
   * @param user UserContext with authenticated user info
   * @returns Created attendance records
   * @throws BadRequestException, ForbiddenException, NotFoundException
   */
  async createTeacherAttendance(
    dto: BulkTeacherAttendanceDto,
    user: UserContext,
  ): Promise<{
    success: boolean;
    createdAttendances: number;
    createdClassAttendances: number;
    createdReports: number;
    records: StudentAttendance[];
  }> {
    // 1️⃣ Validate DTO
    const validatedDto = bulkTeacherAttendanceSchema.parse(dto);

    // 2️⃣ Extract date and calculate day of week
    const attendanceDate = new Date(validatedDto.date);
    const dayOfWeek = attendanceDate.getDay();

    // 3️⃣ VALIDATION LAYER 1: Authenticate user
    const authUser = await this.validationService.validateUser(user.userId);

    // 4️⃣ VALIDATION LAYER 2: Validate role and scope
    await this.validationService.validateRoleAndScope(
      user.userId,
      validatedDto.gradeId,
      validatedDto.sectionId,
      user.roleId,
    );

    // 5️⃣ VALIDATION LAYER 3-7: Date and cycle validations
    const schoolCycle = await this.validationService.validateDateAndCycle(
      validatedDto.date,
    );
    const bimester = await this.validationService.validateBimester(
      schoolCycle.id,
      validatedDto.date,
    );
    await this.validationService.validateHoliday(bimester.id, validatedDto.date);
    await this.validationService.validateAcademicWeek(
      bimester.id,
      validatedDto.date,
    );

    // 6️⃣ VALIDATION LAYER 8: Check schedules exist for this day
    const schedules = await this.validationService.validateSchedules(
      user.userId,
      validatedDto.sectionId,
      dayOfWeek,
    );

    // 7️⃣ VALIDATION LAYER 9: Get active enrollments
    const enrollments = await this.validationService.validateEnrollments(
      validatedDto.sectionId,
      schoolCycle.id,
      validatedDto.date,
    );

    if (enrollments.length === 0) {
      throw new BadRequestException('No active students in this section');
    }

    // 8️⃣ VALIDATION LAYER 10-11: Validate attendance status and permissions
    const { status: attendanceStatus, permission } =
      await this.validationService.validateAttendanceStatus(
        validatedDto.attendanceStatusId,
        user.roleId,
      );

    // 9️⃣ VALIDATION LAYER 12: Load attendance configuration
    const config = await this.validationService.validateAttendanceConfig();

    // 🔟 VALIDATION LAYER 13: Check teacher is not on leave
    await this.validationService.validateTeacherAbsence(
      user.userId,
      validatedDto.date,
    );

    // 1️⃣1️⃣ VALIDATION LAYER 14: Grade and section relationship
    const { grade, section } =
      await this.validationService.validateGradeAndSection(
        validatedDto.gradeId,
        validatedDto.sectionId,
      );

    // ✅ ALL VALIDATIONS PASSED - START TRANSACTION
    const result = await this.prisma.$transaction(
      async (tx) => {
        const createdAttendances: StudentAttendance[] = [];
        const createdReports = new Set<number>();

        // Create StudentAttendance for each enrollment
        for (const enrollment of enrollments) {
          // 1️⃣5️⃣ VALIDATION LAYER 15: Ensure no duplicate for this day
          await this.validationService.validateAttendanceNotExists(
            enrollment.id,
            validatedDto.date,
          );

          // Calculate minutes late if applicable
          let minutesLate = 0;
          if (
            validatedDto.arrivalTime &&
            attendanceStatus.code === 'T' // T = Tardío (Late)
          ) {
            minutesLate = this.validationService.calculateMinutesLate(
              validatedDto.arrivalTime,
              config.lateThresholdTime,
              config.markAsTardyAfterMinutes,
            );
          }

          // Create StudentAttendance record
          const studentAttendance = await tx.studentAttendance.create({
            data: {
              enrollmentId: enrollment.id,
              date: attendanceDate,
              attendanceStatusId: validatedDto.attendanceStatusId,
              arrivalTime: validatedDto.arrivalTime || null,
              minutesLate,
              departureTime: validatedDto.departureTime || null,
              notes: validatedDto.notes || null,
              recordedBy: user.userId,
              courseAssignmentId: validatedDto.courseAssignmentIds?.[0] || null,
            },
            include: {
              enrollment: {
                include: {
                  student: true,
                },
              },
            },
          });

          createdAttendances.push(studentAttendance);

          // Create StudentClassAttendance for each schedule
          for (const schedule of schedules) {
            // Filter by courseAssignmentIds if provided
            if (
              validatedDto.courseAssignmentIds &&
              !validatedDto.courseAssignmentIds.includes(
                schedule.courseAssignmentId,
              )
            ) {
              continue;
            }

            await tx.studentClassAttendance.create({
              data: {
                studentAttendanceId: studentAttendance.id,
                scheduleId: schedule.id,
                courseAssignmentId: schedule.courseAssignmentId,
                status: attendanceStatus.code,
                arrivalTime: validatedDto.arrivalTime || null,
                notes: validatedDto.notes || null,
                recordedBy: user.userId,
              },
            });
          }

          // Mark enrollment for report recalculation
          createdReports.add(enrollment.id);
        }

        // Recalculate attendance reports for affected enrollments
        const reportCount = await this.recalculateReports(
          Array.from(createdReports),
          schoolCycle.id,
          bimester.id,
          tx,
        );

        return {
          success: true,
          createdAttendances: createdAttendances.length,
          createdClassAttendances: createdAttendances.length * schedules.length,
          createdReports: reportCount,
          records: createdAttendances,
        };
      },
      {
        timeout: 30000, // 30 seconds for large batches
      },
    );

    return result;
  }

  /**
   * EDITAR ASISTENCIA (Secretaria o Coordinador modifica registro)
   *
   * Flow:
   * 1. Validate DTO structure
   * 2. Find existing StudentAttendance
   * 3. Check permissions (user must have canModify)
   * 4. Validate changeReason is provided
   * 5. Start transaction
   *    a. Create StudentAttendanceChange (audit trail)
   *    b. Update StudentAttendance
   *    c. Update StudentClassAttendance
   *    d. Recalculate StudentAttendanceReport
   * 6. Return updated record
   *
   * @param attendanceId StudentAttendance ID
   * @param dto UpdateAttendanceDto with new values
   * @param user UserContext with authenticated user info
   * @returns Updated attendance record
   * @throws BadRequestException, ForbiddenException, NotFoundException
   */
  async updateAttendance(
    attendanceId: number,
    dto: UpdateAttendanceDto,
    user: UserContext,
  ): Promise<{
    success: boolean;
    updated: StudentAttendance;
    changeHistory: StudentAttendanceChange;
  }> {
    // 1️⃣ Validate DTO
    const validatedDto = updateAttendanceSchema.parse(dto);

    // 2️⃣ Validate changeReason is mandatory
    if (!validatedDto.changeReason) {
      throw new BadRequestException(
        'changeReason is mandatory for audit trail',
      );
    }

    // 3️⃣ Find existing attendance
    const existingAttendance = await this.prisma.studentAttendance.findUnique({
      where: { id: attendanceId },
      include: {
        status: true,
        enrollment: {
          include: {
            student: true,
            section: {
              include: {
                grade: true,
              },
            },
          },
        },
        classAttendances: true,
      },
    });

    if (!existingAttendance) {
      throw new NotFoundException('Attendance record not found');
    }

    // Store cycle ID before transaction (cast type since Prisma doesn't infer from include)
    const enrollmentCycleId = (
      existingAttendance as any
    ).enrollment.cycleId;

    // 4️⃣ Verify user has canModify permission
    const permission = await this.prisma.roleAttendancePermission.findUnique({
      where: {
        roleId_attendanceStatusId: {
          roleId: user.roleId,
          attendanceStatusId:
            validatedDto.attendanceStatusId ||
            existingAttendance.attendanceStatusId,
        },
      },
    });

    if (!permission || !permission.canModify) {
      throw new ForbiddenException(
        'You do not have permission to modify attendance',
      );
    }

    // 5️⃣ Load config for calculations
    const config = await this.validationService.validateAttendanceConfig();

    // ✅ ALL VALIDATIONS PASSED - START TRANSACTION
    const result = await this.prisma.$transaction(async (tx) => {
      // Create audit trail entry
      const changeHistory = await tx.studentAttendanceChange.create({
        data: {
          studentAttendanceId: attendanceId,
          attendanceStatusIdBefore: existingAttendance.attendanceStatusId,
          attendanceStatusIdAfter:
            validatedDto.attendanceStatusId ||
            existingAttendance.attendanceStatusId,
          notesBefore: existingAttendance.notes,
          notesAfter: validatedDto.notes || existingAttendance.notes,
          arrivalTimeBefore: existingAttendance.arrivalTime,
          arrivalTimeAfter:
            validatedDto.arrivalTime || existingAttendance.arrivalTime,
          changeReason: validatedDto.changeReason,
          changedBy: user.userId,
          changedAt: new Date(),
        },
      });

      // Calculate new minutesLate if arrivalTime changed
      let newMinutesLate = existingAttendance.minutesLate;
      if (validatedDto.arrivalTime) {
        const newStatus = await tx.attendanceStatus.findUnique({
          where: {
            id:
              validatedDto.attendanceStatusId ||
              existingAttendance.attendanceStatusId,
          },
        });

        if (newStatus?.code === 'T') {
          newMinutesLate = this.validationService.calculateMinutesLate(
            validatedDto.arrivalTime,
            config.lateThresholdTime,
            config.markAsTardyAfterMinutes,
          );
        } else {
          newMinutesLate = 0;
        }
      }

      // Update StudentAttendance
      const updatedAttendance = await tx.studentAttendance.update({
        where: { id: attendanceId },
        data: {
          attendanceStatusId:
            validatedDto.attendanceStatusId ||
            existingAttendance.attendanceStatusId,
          notes: validatedDto.notes ?? existingAttendance.notes,
          arrivalTime:
            validatedDto.arrivalTime ?? existingAttendance.arrivalTime,
          minutesLate: newMinutesLate,
          departureTime:
            validatedDto.departureTime ?? existingAttendance.departureTime,
          updatedAt: new Date(),
        },
      });

      // Update all StudentClassAttendance for consistency
      if (validatedDto.attendanceStatusId) {
        const newStatus = await tx.attendanceStatus.findUnique({
          where: { id: validatedDto.attendanceStatusId },
        });

        if (newStatus?.code) {
          await tx.studentClassAttendance.updateMany({
            where: { studentAttendanceId: attendanceId },
            data: {
              status: newStatus.code,
              arrivalTime: validatedDto.arrivalTime ?? undefined,
            },
          });
        }
      }

      // Recalculate report for this enrollment
      await this.recalculateReports(
        [existingAttendance.enrollmentId],
        enrollmentCycleId,
        undefined,
        tx,
      );

      return {
        success: true,
        updated: updatedAttendance,
        changeHistory,
      };
    });

    return result;
  }

  /**
   * OBTENER HISTORIAL DE ASISTENCIA (Con auditoría)
   *
   * @param enrollmentId Enrollment ID
   * @param limit Page size (default 50)
   * @param offset Page offset (default 0)
   * @returns Paginated attendance records with change history
   */
  async getStudentAttendance(
    enrollmentId: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{
    total: number;
    data: (StudentAttendance & {
      changeHistory: StudentAttendanceChange[];
      classAttendances: StudentClassAttendance[];
    })[];
  }> {
    // Verify enrollment exists
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Count total records
    const total = await this.prisma.studentAttendance.count({
      where: { enrollmentId },
    });

    // Fetch with relations and pagination
    const data = await this.prisma.studentAttendance.findMany({
      where: { enrollmentId },
      include: {
        changeHistory: {
          orderBy: { changedAt: 'desc' },
        },
        classAttendances: {
          include: {
            schedule: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    });

    return {
      total,
      data,
    };
  }

  /**
   * OBTENER REPORTE DE ASISTENCIA
   *
   * @param enrollmentId Enrollment ID
   * @returns StudentAttendanceReport with statistics
   */
  async getAttendanceReport(
    enrollmentId: number,
  ): Promise<StudentAttendanceReport | null> {
    return this.prisma.studentAttendanceReport.findUnique({
      where: { enrollmentId },
      include: {
        enrollment: {
          include: {
            student: true,
            section: true,
          },
        },
      },
    });
  }

  /**
   * HELPER: Recalculate StudentAttendanceReport
   *
   * Aggregates attendance data and determines risk status
   *
   * @param enrollmentIds Array of enrollment IDs
   * @param cycleId School cycle ID (optional)
   * @param bimesterId Bimester ID (optional)
   * @param tx Prisma transaction client
   * @returns Number of reports recalculated
   *
   * @private
   */
  private async recalculateReports(
    enrollmentIds: number[],
    cycleId?: number,
    bimesterId?: number,
    tx?: any,
  ): Promise<number> {
    const prismaClient = tx || this.prisma;
    let reportCount = 0;

    for (const enrollmentId of enrollmentIds) {
      // Get enrollment info
      const enrollment = await prismaClient.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          section: true,
        },
      });

      if (!enrollment) {
        continue;
      }

      // Use provided cycleId or query from enrollment
      const actualCycleId = cycleId || enrollment.cycleId;
      const actualBimesterId =
        bimesterId ||
        (
          await prismaClient.bimester.findFirst({
            where: {
              cycleId: actualCycleId,
              isActive: true,
            },
          })
        )?.id;

      // Count attendance by status
      const attendances = await prismaClient.studentAttendance.findMany({
        where: {
          enrollmentId,
          date: {
            gte: new Date('2025-01-01'), // Customize based on bimester dates
          },
        },
        include: {
          status: true,
        },
      });

      const counts = {
        present: 0,
        absent: 0,
        absentJustified: 0,
        temporal: 0,
        tardy: 0,
      };

      for (const attendance of attendances) {
        switch (attendance.status.code) {
          case 'P':
            counts.present++;
            break;
          case 'A':
            counts.absent++;
            break;
          case 'AJ':
            counts.absentJustified++;
            break;
          case 'TEMP':
            counts.temporal++;
            break;
          case 'T':
            counts.tardy++;
            break;
        }
      }

      const totalDays =
        counts.present +
        counts.absent +
        counts.absentJustified +
        counts.temporal +
        counts.tardy;
      const attendancePercentage =
        totalDays > 0
          ? ((counts.present + counts.temporal) / totalDays) * 100
          : 100;
      const isAtRisk = attendancePercentage < 80;

      // Upsert report
      await prismaClient.studentAttendanceReport.upsert({
        where: { enrollmentId },
        create: {
          enrollmentId,
          bimesterId: actualBimesterId,
          cycleId: actualCycleId,
          countPresent: counts.present,
          countAbsent: counts.absent,
          countAbsentJustified: counts.absentJustified,
          countTemporal: counts.temporal,
          countTardy: counts.tardy,
          attendancePercentage,
          absencePercentage: 100 - attendancePercentage,
          isAtRisk,
          consecutiveAbsences: 0, // TODO: Calculate consecutive absences
          updatedAt: new Date(),
        },
        update: {
          countPresent: counts.present,
          countAbsent: counts.absent,
          countAbsentJustified: counts.absentJustified,
          countTemporal: counts.temporal,
          countTardy: counts.tardy,
          attendancePercentage,
          absencePercentage: 100 - attendancePercentage,
          isAtRisk,
          updatedAt: new Date(),
        },
      });

      reportCount++;
    }

    return reportCount;
  }

  /**
   * Get the active school cycle
   * Used in attendance module initialization
   */
  async getActiveCycle() {
    const cycle = await this.attendanceRepository.getActiveCycle();

    if (!cycle) {
      throw new NotFoundException({
        success: false,
        message: 'No hay un ciclo escolar activo',
        details: ['Active un ciclo escolar para continuar'],
      });
    }

    return cycle;
  }

  /**
   * Get grades associated with the active school cycle
   * Includes grade details and cycle information
   */
  async getGradesByActiveCycle() {
    const grades = await this.attendanceRepository.getGradesByActiveCycle();

    if (!grades) {
      throw new NotFoundException({
        success: false,
        message: 'No hay un ciclo escolar activo',
        details: ['Active un ciclo escolar para continuar'],
      });
    }

    if (grades.length === 0) {
      throw new NotFoundException({
        success: false,
        message: 'No hay grados asociados al ciclo escolar activo',
        details: ['Asigna al menos un grado al ciclo escolar activo'],
      });
    }

    return grades;
  }

  /**
   * Get sections for a specific grade
   */
  async getSectionsByGrade(gradeId: number) {
    // Validate that the grade exists
    const grade = await this.prisma.grade.findUnique({
      where: { id: gradeId },
    });

    if (!grade) {
      throw new NotFoundException({
        success: false,
        message: `Grado con ID ${gradeId} no encontrado`,
        details: ['Verifica el ID del grado e intenta de nuevo'],
      });
    }

    const sections = await this.attendanceRepository.getSectionsByGrade(gradeId);

    if (sections.length === 0) {
      throw new NotFoundException({
        success: false,
        message: `No hay secciones para el grado "${grade.name}"`,
        details: ['Crea al menos una sección para este grado'],
      });
    }

    return sections;
  }

  /**
   * Validate bimester for a specific date
   */
  async validateBimesterByDate(cycleId: number, date: string) {
    const parsedDate = new Date(date);

    const bimester = await this.attendanceRepository.findBimesterByDate(
      cycleId,
      parsedDate,
    );

    if (!bimester) {
      throw new BadRequestException({
        success: false,
        error: 'BIMESTER_NOT_FOUND',
        message: 'No active bimester found for this date',
        date,
      });
    }

    if (!bimester.isActive) {
      throw new BadRequestException({
        success: false,
        error: 'BIMESTER_INACTIVE',
        message: 'Bimester exists but is not active',
        bimesterId: bimester.id,
      });
    }

    return bimester;
  }

  /**
   * Validate holiday for a specific date
   */
  async validateHolidayByDate(bimesterId: number, date: string) {
    const parsedDate = new Date(date);

    const holiday = await this.attendanceRepository.findHolidayByDate(
      bimesterId,
      parsedDate,
    );

    if (!holiday) {
      return null; // No es feriado
    }

    if (!holiday.isRecovered) {
      throw new BadRequestException({
        success: false,
        error: 'HOLIDAY_NOT_RECOVERED',
        message: 'Cannot record attendance on non-recovered holiday',
        holiday: {
          id: holiday.id,
          date: holiday.date,
          description: holiday.description,
          isRecovered: holiday.isRecovered,
        },
      });
    }

    // Es feriado pero está recuperado
    return holiday;
  }

  /**
   * Validate academic week for a specific date
   */
  async validateAcademicWeekByDate(bimesterId: number, date: string) {
    const parsedDate = new Date(date);

    const week = await this.attendanceRepository.findAcademicWeekByDate(
      bimesterId,
      parsedDate,
    );

    if (!week) {
      return null; // No está en ninguna semana
    }

    if (week.weekType === 'BREAK') {
      throw new BadRequestException({
        success: false,
        error: 'BREAK_WEEK',
        message: 'Cannot record attendance during break week',
        week: {
          id: week.id,
          number: week.number,
          startDate: week.startDate,
          endDate: week.endDate,
          weekType: week.weekType,
        },
      });
    }

    return week;
  }

  /**
   * Validate teacher schedules for specific day and section
   */
  async validateTeacherSchedules(
    teacherId: number,
    dayOfWeek: number,
    sectionId: number,
  ) {
    const schedules =
      await this.attendanceRepository.findTeacherSchedulesByDayAndSection(
        teacherId,
        dayOfWeek,
        sectionId,
      );

    if (schedules.length === 0) {
      throw new NotFoundException({
        success: false,
        error: 'NO_SCHEDULES_FOUND',
        message: 'Teacher has no scheduled classes for this day',
        teacherId,
        dayOfWeek,
        sectionId,
      });
    }

    return schedules;
  }

  /**
   * Validate teacher absence for specific date
   */
  async validateTeacherAbsenceByDate(teacherId: number, date: string) {
    const parsedDate = new Date(date);

    const absence =
      await this.attendanceRepository.findTeacherAbsenceByDate(
        teacherId,
        parsedDate,
      );

    if (absence) {
      throw new BadRequestException({
        success: false,
        error: 'TEACHER_ON_LEAVE',
        message: 'Teacher is on approved absence for this date',
        absence: {
          id: absence.id,
          teacherId: absence.teacherId,
          startDate: absence.startDate,
          endDate: absence.endDate,
          reason: absence.reason,
          status: absence.status,
          approvedAt: absence.approvedAt,
        },
      });
    }

    return null;
  }

  /**
   * Get active attendance configuration
   */
  async getActiveAttendanceConfig() {
    const config = await this.attendanceRepository.findActiveAttendanceConfig();

    if (!config) {
      // Return default config
      return {
        id: null,
        name: 'DEFAULT',
        description: 'Configuración por defecto',
        riskThresholdPercentage: 80.0,
        consecutiveAbsenceAlert: 3,
        lateThresholdTime: '08:30',
        markAsTardyAfterMinutes: 15,
        justificationRequiredAfter: 3,
        maxJustificationDays: 365,
        autoApproveJustification: false,
        autoApprovalAfterDays: 7,
        isActive: true,
      };
    }

    return config;
  }

  /**
   * Get active enrollments for section and cycle
   */
  async getActiveEnrollmentsBySectionAndCycle(
    sectionId: number,
    cycleId: number,
    date: string,
  ) {
    const parsedDate = new Date(date);

    const enrollments =
      await this.attendanceRepository.findActiveEnrollmentsBySectionAndCycle(
        sectionId,
        cycleId,
        parsedDate,
      );

    if (enrollments.length === 0) {
      throw new NotFoundException({
        success: false,
        error: 'NO_STUDENTS_FOUND',
        message: 'No active students enrolled for this section',
        sectionId,
        cycleId,
        date,
      });
    }

    return enrollments;
  }

  /**
   * Get allowed attendance statuses for role
   */
  async getAllowedAttendanceStatusesByRole(roleId: number) {
    const statuses =
      await this.attendanceRepository.findAllowedAttendanceStatusesByRole(
        roleId,
      );

    if (statuses.length === 0) {
      throw new ForbiddenException({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Role has no permission to create attendance records',
        roleId,
      });
    }

    return statuses;
  }
}
