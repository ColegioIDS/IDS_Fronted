import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { WeekType, EnrollmentStatus } from '@prisma/client';

/**
 * 🔒 SERVICIO DE VALIDACIONES
 * Centraliza todas las validaciones del sistema de asistencia
 * Cada validación es una capa independiente de seguridad
 */
@Injectable()
export class AttendanceValidationService {
  constructor(private prisma: PrismaService) {}

  /**
   * 1️⃣ VALIDAR USUARIO
   * Verificar que el usuario existe, está activo y es maestro
   */
  async validateUser(userId: number) {
    if (!userId || userId <= 0) {
      throw new BadRequestException('userId inválido');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        teacherDetails: true,
        guidedSections: {
          include: { grade: true },
        },
        courseAssignments: {
          where: { isActive: true },
          include: { section: { include: { grade: true } } },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Usuario inactivo');
    }

    if (!user.teacherDetails) {
      throw new ForbiddenException('Solo maestros pueden registrar asistencia');
    }

    if (!user.role || !user.role.isActive) {
      throw new ForbiddenException('Rol del usuario inválido o inactivo');
    }

    return user;
  }

  /**
   * 2️⃣ VALIDAR ROL Y SCOPE
   * Verificar que el maestro tiene permisos según su scope
   */
  async validateRoleAndScope(
    userId: number,
    gradeId: number,
    sectionId: number,
    roleId: number,
  ) {
    // Obtener permiso de rol
    const rolePermission = await this.prisma.rolePermission.findFirst({
      where: {
        roleId,
        permission: {
          module: 'attendance',
          action: 'create',
        },
      },
      include: {
        permission: true,
      },
    });

    if (!rolePermission) {
      throw new ForbiddenException('No tienes permiso para registrar asistencia');
    }

    const scope = rolePermission.scope || 'all';

    // Validar según scope
    switch (scope) {
      case 'all':
        // Sin restricciones
        break;

      case 'grade':
        // Solo puede registrar su grado
        const guidedSection = await this.prisma.section.findFirst({
          where: {
            id: sectionId,
            gradeId,
            teacherId: userId,
          },
        });

        if (!guidedSection) {
          throw new ForbiddenException('No tienes acceso a esta sección');
        }
        break;

      case 'section':
        // Solo su sección específica
        const ownSection = await this.prisma.section.findFirst({
          where: {
            id: sectionId,
            gradeId,
            teacherId: userId,
          },
        });

        if (!ownSection) {
          throw new ForbiddenException('Solo puedes registrar en tu sección');
        }
        break;

      case 'own':
        // Solo cursos donde está asignado
        const assignedCourse = await this.prisma.courseAssignment.findFirst({
          where: {
            sectionId,
            teacherId: userId,
            isActive: true,
          },
        });

        if (!assignedCourse) {
          throw new ForbiddenException('No estás asignado a cursos en esta sección');
        }
        break;

      default:
        throw new BadRequestException('Scope inválido: ' + scope);
    }

    return { scope, rolePermission };
  }

  /**
   * 3️⃣ VALIDAR FECHA Y CICLO
   * Verificar que la fecha no es futura y existe ciclo activo
   */
  async validateDateAndCycle(date: string) {
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (attendanceDate > today) {
      throw new BadRequestException('No puedes registrar asistencia en fecha futura');
    }

    const cycle = await this.prisma.schoolCycle.findFirst({
      where: {
        startDate: { lte: attendanceDate },
        endDate: { gte: attendanceDate },
        isActive: true,
        isArchived: false,
      },
      include: {
        bimesters: {
          where: {
            startDate: { lte: attendanceDate },
            endDate: { gte: attendanceDate },
            isActive: true,
          },
        },
      },
    });

    if (!cycle) {
      throw new BadRequestException('No existe ciclo académico activo para esta fecha');
    }

    if (cycle.isArchived) {
      throw new BadRequestException('Ciclo académico archivado, no se pueden registrar cambios');
    }

    return cycle;
  }

  /**
   * 4️⃣ VALIDAR BIMESTRE
   * Verificar que existe bimestre activo en la fecha
   */
  async validateBimester(cycleId: number, date: string) {
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const bimester = await this.prisma.bimester.findFirst({
      where: {
        cycleId,
        startDate: { lte: attendanceDate },
        endDate: { gte: attendanceDate },
        isActive: true,
      },
      include: {
        holidays: true,
        weeks: true,
      },
    });

    if (!bimester) {
      throw new BadRequestException('No existe bimestre activo para esta fecha');
    }

    return bimester;
  }

  /**
   * 5️⃣ VALIDAR HOLIDAY
   * Verificar que no sea un día feriado (a menos que esté recuperado)
   */
  async validateHoliday(bimesterId: number, date: string) {
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const holiday = await this.prisma.holiday.findFirst({
      where: {
        bimesterId,
        date: attendanceDate,
      },
    });

    if (holiday && !holiday.isRecovered) {
      throw new BadRequestException(
        `No puedes registrar asistencia en día feriado: ${holiday.description}`,
      );
    }

    return holiday;
  }

  /**
   * 6️⃣ VALIDAR ACADEMICWEEK
   * Verificar que la semana no es de descanso
   */
  async validateAcademicWeek(bimesterId: number, date: string) {
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const academicWeek = await this.prisma.academicWeek.findFirst({
      where: {
        bimesterId,
        startDate: { lte: attendanceDate },
        endDate: { gte: attendanceDate },
      },
    });

    if (academicWeek && academicWeek.weekType === WeekType.BREAK) {
      throw new BadRequestException(
        `No se puede registrar asistencia en semana de descanso (semana ${academicWeek.number})`,
      );
    }

    return academicWeek;
  }

  /**
   * 7️⃣ VALIDAR SCHEDULES
   * Verificar que el maestro tiene clases programadas ese día
   */
  async validateSchedules(userId: number, sectionId: number, dayOfWeek: number) {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        sectionId,
        teacherId: userId,
        dayOfWeek,
        courseAssignment: {
          isActive: true,
        },
      },
      include: {
        course: true,
        courseAssignment: true,
        section: true,
      },
    });

    if (schedules.length === 0) {
      throw new BadRequestException(
        'No tienes clases programadas para este día en esta sección',
      );
    }

    return schedules;
  }

  /**
   * 8️⃣ VALIDAR ENROLLMENTS
   * Verificar que existen estudiantes matriculados activos
   */
  async validateEnrollments(sectionId: number, cycleId: number, date: string) {
    const attendanceDate = new Date(date);

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        sectionId,
        cycleId,
        status: EnrollmentStatus.ACTIVE,
        dateEnrolled: { lte: attendanceDate },
      },
      include: {
        student: true,
      },
    });

    if (enrollments.length === 0) {
      throw new BadRequestException('No hay estudiantes matriculados activos en esta sección');
    }

    return enrollments;
  }

  /**
   * 9️⃣ VALIDAR ATTENDANCE STATUS
   * Verificar que el estado de asistencia existe y usuario tiene permisos
   */
  async validateAttendanceStatus(statusId: number, roleId: number) {
    const status = await this.prisma.attendanceStatus.findUnique({
      where: { id: statusId },
    });

    if (!status) {
      throw new NotFoundException('Estado de asistencia no encontrado');
    }

    if (!status.isActive) {
      throw new BadRequestException('Estado de asistencia inactivo');
    }

    // Validar permisos del rol para este estado
    const permission = await this.prisma.roleAttendancePermission.findUnique({
      where: {
        roleId_attendanceStatusId: {
          roleId,
          attendanceStatusId: statusId,
        },
      },
    });

    if (!permission) {
      throw new ForbiddenException(
        `Tu rol no tiene acceso al estado: ${status.name}`,
      );
    }

    if (!permission.canCreate) {
      throw new ForbiddenException('No tienes permiso para CREAR este estado de asistencia');
    }

    if (permission.canModify) {
      throw new ForbiddenException('Los maestros no pueden MODIFICAR asistencia, solo crear');
    }

    return { status, permission };
  }

  /**
   * 🔟 VALIDAR ATTENDANCE CONFIG
   * Obtener configuración activa (crear default si no existe)
   */
  async validateAttendanceConfig() {
    let config = await this.prisma.attendanceConfig.findFirst({
      where: { isActive: true },
    });

    // Si no existe, crear configuración por defecto
    if (!config) {
      config = await this.prisma.attendanceConfig.create({
        data: {
          name: 'Configuración por defecto',
          description: 'Configuración generada automáticamente',
          riskThresholdPercentage: 80.0,
          consecutiveAbsenceAlert: 3,
          lateThresholdTime: '08:30',
          markAsTardyAfterMinutes: 15,
          justificationRequiredAfter: 3,
          maxJustificationDays: 365,
          autoApproveJustification: false,
          autoApprovalAfterDays: 7,
          isActive: true,
        },
      });
    }

    return config;
  }

  /**
   * 1️⃣1️⃣ VALIDAR TEACHER ABSENCE
   * Verificar que el maestro no está en ausencia aprobada
   */
  async validateTeacherAbsence(userId: number, date: string) {
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const absence = await this.prisma.teacherAbsence.findFirst({
      where: {
        teacherId: userId,
        startDate: { lte: attendanceDate },
        endDate: { gte: attendanceDate },
        status: { in: ['approved', 'active'] },
      },
    });

    if (absence) {
      throw new BadRequestException(
        `No puedes registrar asistencia mientras estés de ausencia (${absence.reason})`,
      );
    }

    return null;
  }

  /**
   * 1️⃣2️⃣ CALCULAR MINUTOS TARDE
   * Calcular minutos de retraso basado en hora de llegada
   */
  calculateMinutesLate(
    arrivalTime: string,
    lateThresholdTime: string,
    markAsTardyAfterMinutes: number,
  ): number {
    if (!arrivalTime) {
      return 0;
    }

    const [arrivalHour, arrivalMin] = arrivalTime.split(':').map(Number);
    const [thresholdHour, thresholdMin] = lateThresholdTime.split(':').map(Number);

    const arrivalMinutes = arrivalHour * 60 + arrivalMin;
    const thresholdMinutes = thresholdHour * 60 + thresholdMin;

    if (arrivalMinutes <= thresholdMinutes) {
      return 0; // Llegó a tiempo
    }

    const minutesLate = arrivalMinutes - thresholdMinutes;

    // Si es mayor que el umbral, retornar minutos, si no retornar 0
    return minutesLate >= markAsTardyAfterMinutes ? minutesLate : 0;
  }

  /**
   * 1️⃣3️⃣ VALIDAR EXISTENCIA DE ASISTENCIA
   * Verificar que no existe ya un registro para ese día
   */
  async validateAttendanceNotExists(enrollmentId: number, date: string) {
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existing = await this.prisma.studentAttendance.findFirst({
      where: {
        enrollmentId,
        date: attendanceDate,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Ya existe un registro de asistencia para este estudiante en esta fecha. Debes editar el existente.',
      );
    }

    return null;
  }

  /**
   * 1️⃣4️⃣ VALIDAR GRADO Y SECCIÓN
   * Verificar que grado y sección existen y están activos
   */
  async validateGradeAndSection(gradeId: number, sectionId: number) {
    const grade = await this.prisma.grade.findUnique({
      where: { id: gradeId },
    });

    if (!grade) {
      throw new NotFoundException('Grado no encontrado');
    }

    if (!grade.isActive) {
      throw new BadRequestException('Grado inactivo');
    }

    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: { grade: true },
    });

    if (!section) {
      throw new NotFoundException('Sección no encontrada');
    }

    if (section.gradeId !== gradeId) {
      throw new BadRequestException('Sección no pertenece al grado seleccionado');
    }

    return { grade, section };
  }
}
