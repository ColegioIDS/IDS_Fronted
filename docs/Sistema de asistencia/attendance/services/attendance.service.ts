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

        // ✅ CAMBIO: Crear UN registro StudentAttendance por estudiante/día
        // Luego crear un StudentClassAttendance por cada clase
        
        for (const enrollment of enrollments) {
          // 1️⃣5️⃣ VALIDATION LAYER 15: Ensure no duplicate for this day
          await this.validationService.validateAttendanceNotExists(
            enrollment.id,
            validatedDto.date,
          );

          // Create StudentAttendance (contenedor del día - SIN status)
          const studentAttendance = await tx.studentAttendance.create({
            data: {
              enrollmentId: enrollment.id,
              date: attendanceDate,
              arrivalTime: validatedDto.arrivalTime || null,
              departureTime: validatedDto.departureTime || null,
              notes: validatedDto.notes || null,
              recordedBy: user.userId,
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

          // Create StudentClassAttendance para CADA clase (aquí está el status real)
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

            // Calcular minutesLate si aplica
            let arrivalTimeForClass = validatedDto.arrivalTime;
            let minutesLate = 0;

            if (
              validatedDto.arrivalTime &&
              attendanceStatus.code === 'T' // T = Tardío
            ) {
              minutesLate = this.validationService.calculateMinutesLate(
                validatedDto.arrivalTime,
                config.lateThresholdTime,
                config.markAsTardyAfterMinutes,
              );
            }

            await tx.studentClassAttendance.create({
              data: {
                studentAttendanceId: studentAttendance.id,
                scheduleId: schedule.id,
                courseAssignmentId: schedule.courseAssignmentId,
                attendanceStatusId: attendanceStatus.id,
                status: attendanceStatus.code,
                arrivalTime: arrivalTimeForClass || null,
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
   * ✅ CAMBIO: Ahora edita StudentClassAttendance (clases individuales)
   * no StudentAttendance (que es solo contenedor del día)
   *
   * Flow:
   * 1. Validate DTO structure
   * 2. Find existing StudentClassAttendance (por clase específica)
   * 3. Check permissions (user must have canModify)
   * 4. Validate changeReason is provided
   * 5. Start transaction
   *    a. Create StudentAttendanceChange (audit trail)
   *    b. Update StudentClassAttendance
   *    c. Recalculate StudentAttendanceReport
   * 6. Return updated record
   *
   * @param classAttendanceId StudentClassAttendance ID
   * @param dto UpdateAttendanceDto with new values
   * @param user UserContext with authenticated user info
   * @returns Updated attendance record
   * @throws BadRequestException, ForbiddenException, NotFoundException
   */
  async updateAttendance(
    classAttendanceId: number,
    dto: UpdateAttendanceDto,
    user: UserContext,
  ): Promise<{
    success: boolean;
    updated: StudentClassAttendance;
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

    // 3️⃣ Find existing class attendance
    const existingClassAttendance = await this.prisma.studentClassAttendance.findUnique({
      where: { id: classAttendanceId },
      include: {
        studentAttendance: {
          include: {
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
          },
        },
        schedule: true,
      },
    });

    if (!existingClassAttendance) {
      throw new NotFoundException('Class attendance record not found');
    }

    const enrollmentCycleId = (existingClassAttendance as any).studentAttendance.enrollment.cycleId;

    // 4️⃣ Verify user has canModify permission for this status
    if (validatedDto.attendanceStatusId) {
      const permission = await this.prisma.roleAttendancePermission.findUnique({
        where: {
          roleId_attendanceStatusId: {
            roleId: user.roleId,
            attendanceStatusId: validatedDto.attendanceStatusId,
          },
        },
      });

      if (!permission || !permission.canModify) {
        throw new ForbiddenException(
          'You do not have permission to modify attendance with this status',
        );
      }
    }

    // 5️⃣ Load config for calculations
    const config = await this.validationService.validateAttendanceConfig();

    // ✅ ALL VALIDATIONS PASSED - START TRANSACTION
    const result = await this.prisma.$transaction(async (tx) => {
      // Get new status if provided
      let newStatusCode = existingClassAttendance.status;
      if (validatedDto.attendanceStatusId) {
        const newStatus = await tx.attendanceStatus.findUnique({
          where: { id: validatedDto.attendanceStatusId },
        });
        newStatusCode = newStatus?.code || existingClassAttendance.status;
      }

      // Create audit trail entry
      const changeHistory = await tx.studentAttendanceChange.create({
        data: {
          studentAttendanceId: existingClassAttendance.studentAttendanceId,
          statusBefore: existingClassAttendance.status,
          statusAfter: newStatusCode,
          notesBefore: existingClassAttendance.notes,
          notesAfter: validatedDto.notes || existingClassAttendance.notes,
          arrivalTimeBefore: existingClassAttendance.arrivalTime,
          arrivalTimeAfter:
            validatedDto.arrivalTime || existingClassAttendance.arrivalTime,
          changeReason: validatedDto.changeReason,
          changedBy: user.userId,
          changedAt: new Date(),
        },
      });

      // Update StudentClassAttendance
      const updatedClassAttendance = await tx.studentClassAttendance.update({
        where: { id: classAttendanceId },
        data: {
          status: newStatusCode,
          notes: validatedDto.notes ?? existingClassAttendance.notes,
          arrivalTime:
            validatedDto.arrivalTime ?? existingClassAttendance.arrivalTime,
          updatedAt: new Date(),
        },
      });

      // Recalculate report for this enrollment
      await this.recalculateReports(
        [existingClassAttendance.studentAttendanceId],
        enrollmentCycleId,
        undefined,
        tx,
      );

      return {
        success: true,
        updated: updatedClassAttendance,
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

      // ✅ CHANGED: Count attendance by status from StudentClassAttendance (per-class records)
      // StudentAttendance is now a container - actual status is in StudentClassAttendance
      const classAttendances = await prismaClient.studentClassAttendance.findMany({
        where: {
          studentAttendance: {
            enrollmentId,
            date: {
              gte: new Date('2025-01-01'), // Customize based on bimester dates
            },
          },
        },
        include: {
          attendanceStatus: true,
        },
      });

      // ✅ DYNAMIC: Count based on AttendanceStatus properties, not hardcoded codes
      const counts = {
        present: 0,
        absent: 0,
        absentJustified: 0,
        temporal: 0,
        tardy: 0,
      };

      for (const classAttendance of classAttendances) {
        const statusInfo = classAttendance.attendanceStatus;

        // Clasificar dinámicamente según propiedades del estado
        if (statusInfo.code === 'P') {
          counts.present++;
        } else if (statusInfo.isNegative) {
          // Estados negativos pueden ser justificados o no
          if (statusInfo.isExcused) {
            counts.absentJustified++;
          } else {
            counts.absent++;
          }
        } else if (statusInfo.isTemporal) {
          counts.temporal++;
        } else {
          // Para estados no clasificados, usar código como fallback
          // (esto es flexible para estados personalizados)
          counts.absent++;
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
      // ✅ REMOVED cycleId - not part of StudentAttendanceReport model
      await prismaClient.studentAttendanceReport.upsert({
        where: { enrollmentId },
        create: {
          enrollmentId,
          bimesterId: actualBimesterId,
          countPresent: counts.present,
          countAbsent: counts.absent,
          countAbsentJustified: counts.absentJustified,
          countTemporal: counts.temporal,
          attendancePercentage,
          absencePercentage: 100 - attendancePercentage,
          isAtRisk,
          consecutiveAbsences: 0, // TODO: Calculate consecutive absences
        },
        update: {
          countPresent: counts.present,
          countAbsent: counts.absent,
          countAbsentJustified: counts.absentJustified,
          countTemporal: counts.temporal,
          attendancePercentage,
          absencePercentage: 100 - attendancePercentage,
          isAtRisk,
          lastRecalculatedAt: new Date(),
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

  /**
   * Get holidays for a specific bimester or all holidays from active cycle
   * 
   * @param bimesterId - Optional bimester ID to filter holidays
   * @returns Array of holidays ordered by date
   * @throws NotFoundException - If no holidays found
   */
  async getHolidays(bimesterId?: number) {
    // If bimesterId provided, filter by that bimester
    if (bimesterId) {
      const holidays = await this.attendanceRepository.findHolidaysByBimester(
        bimesterId,
      );

      if (holidays.length === 0) {
        throw new NotFoundException({
          success: false,
          message: `No holidays found for bimester ${bimesterId}`,
          statusCode: 404,
        });
      }

      return holidays;
    }

    // If no bimesterId, get all holidays from active cycle
    const activeCycle = await this.getActiveCycle();
    const holidays = await this.attendanceRepository.findHolidaysByCycle(
      activeCycle.id,
    );

    if (holidays.length === 0) {
      throw new NotFoundException({
        success: false,
        message: 'No holidays found for active cycle',
        statusCode: 404,
      });
    }

    return holidays;
  }

  /**
   * Get the active bimester based on current date
   * 
   * @returns Active bimester with cycle details
   * @throws NotFoundException - If no active bimester found
   */
  async getActiveBimester() {
    const today = new Date();

    const bimester = await this.attendanceRepository.findActiveBimesterByDate(
      today,
    );

    if (!bimester) {
      throw new NotFoundException({
        success: false,
        message: 'No active bimester found for current date',
        statusCode: 404,
      });
    }

    return bimester;
  }

  /**
   * Get enrollments for a specific section in active cycle
   * Simplified version without date filtering
   * 
   * @param sectionId - Section ID
   * @param includeInactive - Include inactive students (default: false)
   * @returns Array of enrollments with student and section details
   * @throws NotFoundException - If section not found or no enrollments
   */
  async getEnrollmentsBySection(
    sectionId: number,
    includeInactive: boolean = false,
  ) {
    // Verify section exists
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException({
        success: false,
        message: 'Section not found',
        statusCode: 404,
      });
    }

    // Get active cycle
    const activeCycle = await this.getActiveCycle();

    // Build filter
    const where: any = {
      sectionId: sectionId,
      cycleId: activeCycle.id,
    };

    if (!includeInactive) {
      where.status = 'ACTIVE';
    }

    // Get enrollments
    const enrollments = await this.prisma.enrollment.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            codeSIRE: true,
            givenNames: true,
            lastNames: true,
            birthDate: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
            gradeId: true,
            capacity: true,
            grade: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
          },
        },
      },
      orderBy: {
        student: {
          givenNames: 'asc',
        },
      },
    });

    if (enrollments.length === 0) {
      throw new NotFoundException({
        success: false,
        message: `No enrollments found for section ${sectionId}`,
        statusCode: 404,
      });
    }

    return enrollments;
  }

  /**
   * CREAR ASISTENCIA DE UN ESTUDIANTE ESPECÍFICO
   * Para registros unitarios (ej: estudiante tardío que llega después del registro masivo)
   */
  async createSingleAttendance(
    dto: any, // SingleAttendanceDto
    user: UserContext,
  ) {
    // Validar DTO
    const { singleAttendanceSchema } = await import('../dto');
    const validatedDto = singleAttendanceSchema.parse(dto);

    // Obtener enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: validatedDto.enrollmentId },
      include: { student: true, section: true },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment no encontrado');
    }

    // Validaciones
    const attendanceDate = new Date(validatedDto.date);
    const dayOfWeek = attendanceDate.getDay();

    await this.validationService.validateUser(user.userId);
    const schoolCycle = await this.validationService.validateDateAndCycle(
      validatedDto.date,
    );
    const bimester = await this.validationService.validateBimester(
      schoolCycle.id,
      validatedDto.date,
    );
    await this.validationService.validateHoliday(bimester.id, validatedDto.date);
    await this.validationService.validateAttendanceNotExists(
      validatedDto.enrollmentId,
      validatedDto.date,
    );

    const { status: attendanceStatus } =
      await this.validationService.validateAttendanceStatus(
        validatedDto.attendanceStatusId,
        user.roleId,
      );

    const config = await this.validationService.validateAttendanceConfig();

    // Obtener schedules del estudiante para ese día
    const schedules = await this.prisma.schedule.findMany({
      where: {
        sectionId: enrollment.sectionId,
        dayOfWeek,
        courseAssignment: { isActive: true },
      },
    });

    if (schedules.length === 0) {
      throw new BadRequestException(
        'No hay clases programadas para este día en la sección del estudiante',
      );
    }

    // Crear registros en transacción
    const result = await this.prisma.$transaction(async (tx) => {
      // Crear StudentAttendance
      const studentAttendance = await tx.studentAttendance.create({
        data: {
          enrollmentId: validatedDto.enrollmentId,
          date: attendanceDate,
          arrivalTime: validatedDto.arrivalTime || null,
          departureTime: validatedDto.departureTime || null,
          notes: validatedDto.notes || null,
          recordedBy: user.userId,
        },
      });

      // Crear StudentClassAttendance para cada clase
      const classAttendances: any[] = [];
      for (const schedule of schedules) {
        if (
          validatedDto.courseAssignmentIds &&
          !validatedDto.courseAssignmentIds.includes(
            schedule.courseAssignmentId,
          )
        ) {
          continue;
        }

        const classAttendance = await tx.studentClassAttendance.create({
          data: {
            studentAttendanceId: studentAttendance.id,
            scheduleId: schedule.id,
            courseAssignmentId: schedule.courseAssignmentId,
            attendanceStatusId: attendanceStatus.id,
            status: attendanceStatus.code,
            arrivalTime: validatedDto.arrivalTime || null,
            notes: validatedDto.notes || null,
            recordedBy: user.userId,
          },
        });
        classAttendances.push(classAttendance);
      }

      // Recalcular reporte
      await this.recalculateReports(
        [validatedDto.enrollmentId],
        schoolCycle.id,
        bimester.id,
        tx,
      );

      return {
        success: true,
        studentAttendance,
        classAttendances,
        message: `Asistencia registrada para ${enrollment.student.givenNames} ${enrollment.student.lastNames}`,
      };
    });

    return result;
  }

  /**
   * ACTUALIZAR UN REGISTRO DE CLASE ESPECÍFICO
   * Para modificar la asistencia de una sola clase
   */
  async updateSingleClassAttendance(
    classAttendanceId: number,
    dto: any, // UpdateSingleClassAttendanceDto
    user: UserContext,
  ) {
    const { updateSingleClassAttendanceSchema } = await import('../dto');
    const validatedDto = updateSingleClassAttendanceSchema.parse(dto);

    // Obtener el registro
    const classAttendance =
      await this.prisma.studentClassAttendance.findUnique({
        where: { id: classAttendanceId },
        include: {
          studentAttendance: {
            include: { enrollment: { include: { student: true } } },
          },
          attendanceStatus: true,
        },
      });

    if (!classAttendance) {
      throw new NotFoundException('Registro de clase no encontrado');
    }

    // Validar permisos
    const { status: newStatus } =
      await this.validationService.validateAttendanceStatus(
        validatedDto.attendanceStatusId,
        user.roleId,
      );

    // Actualizar en transacción
    const result = await this.prisma.$transaction(async (tx) => {
      // Crear audit trail
      const change = await tx.studentAttendanceChange.create({
        data: {
          studentAttendanceId: classAttendance.studentAttendanceId,
          statusBefore: classAttendance.status,
          statusAfter: newStatus.code,
          notesBefore: classAttendance.notes,
          notesAfter: validatedDto.notes || classAttendance.notes,
          arrivalTimeBefore: classAttendance.arrivalTime,
          arrivalTimeAfter: validatedDto.arrivalTime || classAttendance.arrivalTime,
          changeReason: validatedDto.changeReason,
          changedBy: user.userId,
          changedAt: new Date(),
        },
      });

      // Actualizar clase
      const updated = await tx.studentClassAttendance.update({
        where: { id: classAttendanceId },
        data: {
          status: newStatus.code,
          attendanceStatusId: validatedDto.attendanceStatusId,
          arrivalTime: validatedDto.arrivalTime ?? classAttendance.arrivalTime,
          notes: validatedDto.notes ?? classAttendance.notes,
          updatedAt: new Date(),
        },
      });

      // Recalcular reporte
      await this.recalculateReports(
        [classAttendance.studentAttendance.enrollmentId],
        undefined,
        undefined,
        tx,
      );

      return {
        success: true,
        updated,
        changeHistory: change,
        message: `Asistencia actualizada para ${classAttendance.studentAttendance.enrollment.student.givenNames}`,
      };
    });

    return result;
  }

  /**
   * ACTUALIZAR MÚLTIPLES REGISTROS EN LOTE
   * Para cambios masivos a registros específicos
   */
  async bulkUpdateAttendance(
    dto: any, // BulkUpdateAttendanceDto
    user: UserContext,
  ) {
    const { bulkUpdateAttendanceSchema } = await import('../dto');
    const validatedDto = bulkUpdateAttendanceSchema.parse(dto);

    // Validar que todos los registros existen
    const classAttendances =
      await this.prisma.studentClassAttendance.findMany({
        where: {
          id: { in: validatedDto.updates.map((u) => u.classAttendanceId) },
        },
        include: {
          studentAttendance: { include: { enrollment: true } },
          attendanceStatus: true,
        },
      });

    if (classAttendances.length !== validatedDto.updates.length) {
      throw new NotFoundException(
        'Algunos registros no fueron encontrados',
      );
    }

    // Validar status
    const newStatus = await this.prisma.attendanceStatus.findUnique({
      where: { id: validatedDto.updates[0].attendanceStatusId },
    });

    if (!newStatus) {
      throw new NotFoundException('Estado de asistencia no encontrado');
    }

    const { status: attendanceStatus } =
      await this.validationService.validateAttendanceStatus(
        validatedDto.updates[0].attendanceStatusId,
        user.roleId,
      );

    // Actualizar en transacción
    const result = await this.prisma.$transaction(async (tx) => {
      const updates: any[] = [];
      const enrollmentIds = new Set<number>();

      for (const update of validatedDto.updates) {
        const classAttendance = classAttendances.find(
          (ca) => ca.id === update.classAttendanceId,
        );

        if (!classAttendance) continue;

        // Crear audit
        await tx.studentAttendanceChange.create({
          data: {
            studentAttendanceId: classAttendance.studentAttendanceId,
            statusBefore: classAttendance.status,
            statusAfter: attendanceStatus.code,
            notesBefore: classAttendance.notes,
            notesAfter: update.notes || classAttendance.notes,
            arrivalTimeBefore: classAttendance.arrivalTime,
            arrivalTimeAfter: update.arrivalTime || classAttendance.arrivalTime,
            changeReason: validatedDto.changeReason,
            changedBy: user.userId,
            changedAt: new Date(),
          },
        });

        // Actualizar
        const updated = await tx.studentClassAttendance.update({
          where: { id: update.classAttendanceId },
          data: {
            status: attendanceStatus.code,
            attendanceStatusId: update.attendanceStatusId,
            arrivalTime: update.arrivalTime ?? classAttendance.arrivalTime,
            notes: update.notes ?? classAttendance.notes,
            updatedAt: new Date(),
          },
        });

        updates.push(updated);
        enrollmentIds.add(classAttendance.studentAttendance.enrollmentId);
      }

      // Recalcular reportes
      await this.recalculateReports(Array.from(enrollmentIds), undefined, undefined, tx);

      return {
        success: true,
        updated: updates.length,
        message: `${updates.length} registros actualizados`,
      };
    });

    return result;
  }
}
