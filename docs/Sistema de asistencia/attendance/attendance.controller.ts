import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AttendanceService } from './services/attendance.service';
import { UserContext } from './attendance.types';
import {
  BulkTeacherAttendanceDto,
  bulkTeacherAttendanceSchema,
  SingleAttendanceDto,
  singleAttendanceSchema,
  UpdateAttendanceDto,
  updateAttendanceSchema,
  UpdateSingleClassAttendanceDto,
  updateSingleClassAttendanceSchema,
  BulkUpdateAttendanceDto,
  bulkUpdateAttendanceSchema,
} from './dto';
import { ValidatedBody, ValidatedParam, ValidatedQuery } from '../../common/decorators/validated';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { z } from 'zod';

/**
 * Schema para validar parámetro ID de asistencia
 */
const attendanceIdParamSchema = z.object({
  id: z.preprocess(
    (v) => Number(v),
    z.number().int().positive({ message: 'El ID de asistencia debe ser un número positivo' })
  ),
});

/**
 * Schema para validar parámetro enrollmentId
 */
const enrollmentIdParamSchema = z.object({
  enrollmentId: z.preprocess(
    (v) => Number(v),
    z.number().int().positive({ message: 'El ID de matrícula debe ser un número positivo' })
  ),
});

/**
 * Schema para validar parámetro gradeId
 */
const gradeIdParamSchema = z.object({
  gradeId: z.preprocess(
    (v) => Number(v),
    z.number().int().positive({ message: 'El ID del grado debe ser un número positivo' })
  ),
});

/**
 * Schema para validar query parameters de paginación
 */
const paginationQuerySchema = z.object({
  limit: z.preprocess(
    (v) => Number(v),
    z.number().int().positive().default(50)
  ).optional(),
  offset: z.preprocess(
    (v) => Number(v),
    z.number().int().nonnegative().default(0)
  ).optional(),
});

/**
 * Controlador REST para la gestión de asistencia de estudiantes
 * 
 * Maneja:
 * - Registro masivo de asistencia (maestros)
 * - Edición de registros de asistencia (secretarias/coordinadores)
 * - Consulta de historial de asistencia
 * 
 * Base URL: /api/attendance
 */
@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
  ) {}

  /**
   * POST /api/attendance/register
   * 
   * Registra asistencia masiva para todos los estudiantes de un maestro
   * 
   * El maestro selecciona:
   * - Fecha del registro
   * - Grado y sección
   * - Estado de asistencia (Presente, Ausente, Tardío, etc.)
   * - Tiempos opcionales (llegada, salida)
   * - Notas opcionales
   * 
   * El sistema:
   * 1. Valida 17 capas de validación
   * 2. Crea StudentAttendance para cada alumno activo
   * 3. Crea StudentClassAttendance para cada clase programada
   * 4. Recalcula StudentAttendanceReport automáticamente
   * 5. Todo dentro de una transacción atómica
   * 
   * @param dto BulkTeacherAttendanceDto con los datos
   * @param req Request con usuario autenticado
   * @returns Resumen de registros creados
   * @throws BadRequestException (400) - Validación fallida
   * @throws ForbiddenException (403) - Permiso insuficiente
   * @throws NotFoundException (404) - Recursos no encontrados
   * 
   * @example
   * ```bash
   * POST /api/attendance/register
   * Content-Type: application/json
   * Authorization: Bearer <token>
   * 
   * {
   *   "date": "2025-11-13",
   *   "gradeId": 1,
   *   "sectionId": 1,
   *   "attendanceStatusId": 1,
   *   "arrivalTime": "08:00",
   *   "departureTime": "13:00",
   *   "notes": "Todos presentes",
   *   "courseAssignmentIds": [1, 2, 3]
   * }
   * 
   * Response (201 Created):
   * {
   *   "success": true,
   *   "createdAttendances": 30,
   *   "createdClassAttendances": 90,
   *   "createdReports": 30,
   *   "records": [...]
   * }
   * ```
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('attendance', 'create')
  async createTeacherAttendance(
    @ValidatedBody(bulkTeacherAttendanceSchema)
    dto: BulkTeacherAttendanceDto,
    @Request() req: any,
  ) {
    // Extraer contexto del usuario autenticado
    const userContext: UserContext = {
      userId: req.user.id,
      roleId: req.user.roleId,
      email: req.user.email,
    };

    return this.attendanceService.createTeacherAttendance(dto, userContext);
  }

  /**
   * POST /api/attendance/single
   * 
   * Registra asistencia de UN ESTUDIANTE ESPECÍFICO
   * Para registros unitarios (ej: estudiante tardío que llega después del registro masivo)
   * 
   * @example
   * POST /api/attendance/single
   * {
   *   "enrollmentId": 5,
   *   "date": "2025-11-17",
   *   "attendanceStatusId": 2,
   *   "arrivalTime": "08:30"
   * }
   */
  @Post('single')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('attendance', 'create')
  async createSingleAttendance(
    @ValidatedBody(singleAttendanceSchema)
    dto: SingleAttendanceDto,
    @Request() req: any,
  ) {
    const userContext: UserContext = {
      userId: req.user.id,
      roleId: req.user.roleId,
      email: req.user.email,
    };

    return this.attendanceService.createSingleAttendance(dto, userContext);
  }

  /**
   * PATCH /api/attendance/class/:classAttendanceId
   * 
   * Actualiza UN REGISTRO de StudentClassAttendance
   * Para modificar la asistencia de una clase específica
   * 
   * @example
   * PATCH /api/attendance/class/201
   * {
   *   "classAttendanceId": 201,
   *   "attendanceStatusId": 3,
   *   "changeReason": "Estudiante estaba enfermo"
   * }
   */
  @Patch('class/:classAttendanceId')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'modify')
  async updateSingleClassAttendance(
    @ValidatedParam(z.object({ classAttendanceId: z.preprocess((v) => Number(v), z.number().positive()) }))
    params: { classAttendanceId: number },
    @ValidatedBody(updateSingleClassAttendanceSchema)
    dto: UpdateSingleClassAttendanceDto,
    @Request() req: any,
  ) {
    const userContext: UserContext = {
      userId: req.user.id,
      roleId: req.user.roleId,
      email: req.user.email,
    };

    return this.attendanceService.updateSingleClassAttendance(
      params.classAttendanceId,
      dto,
      userContext,
    );
  }

  /**
   * PATCH /api/attendance/bulk-update
   * 
   * Actualiza MÚLTIPLES registros en lote
   * Para cambios masivos a registros específicos
   * 
   * @example
   * PATCH /api/attendance/bulk-update
   * {
   *   "updates": [
   *     { "classAttendanceId": 201, "attendanceStatusId": 3 },
   *     { "classAttendanceId": 202, "attendanceStatusId": 3 },
   *     { "classAttendanceId": 203, "attendanceStatusId": 3 }
   *   ],
   *   "changeReason": "Todos sin justificación"
   * }
   */
  @Patch('bulk-update')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'modify')
  async bulkUpdateAttendance(
    @ValidatedBody(bulkUpdateAttendanceSchema)
    dto: BulkUpdateAttendanceDto,
    @Request() req: any,
  ) {
    const userContext: UserContext = {
      userId: req.user.id,
      roleId: req.user.roleId,
      email: req.user.email,
    };

    return this.attendanceService.bulkUpdateAttendance(dto, userContext);
  }

  /**
   * PATCH /api/attendance/:id
   * 
   * Edita un registro de asistencia existente
   * 
   * Permite a secretarias/coordinadores:
   * - Cambiar estado de asistencia
   * - Ajustar tiempos (llegada, salida)
   * - Agregar o modificar notas
   * - Registrar razón del cambio (para auditoría)
   * 
   * El sistema:
   * 1. Valida permisos (canModify)
   * 2. Requiere changeReason OBLIGATORIO para auditoría
   * 3. Crea StudentAttendanceChange (historial)
   * 4. Actualiza StudentAttendance y StudentClassAttendance
   * 5. Recalcula StudentAttendanceReport automáticamente
   * 6. Todo dentro de una transacción atómica
   * 
   * @param id ID del registro de asistencia
   * @param dto UpdateAttendanceDto con nuevos valores
   * @param req Request con usuario autenticado
   * @returns Registro actualizado y cambios registrados
   * @throws BadRequestException (400) - changeReason requerido
   * @throws ForbiddenException (403) - Permiso insuficiente
   * @throws NotFoundException (404) - Registro no encontrado
   * 
   * @example
   * ```bash
   * PATCH /api/attendance/123
   * Content-Type: application/json
   * Authorization: Bearer <token>
   * 
   * {
   *   "attendanceStatusId": 3,
   *   "arrivalTime": "08:15",
   *   "notes": "Llegó 15 minutos tarde",
   *   "changeReason": "Estudiante llegó tarde por tráfico, autorizado por coordinador"
   * }
   * 
   * Response (200 OK):
   * {
   *   "success": true,
   *   "updated": {
   *     "id": 123,
   *     "enrollmentId": 1,
   *     "date": "2025-11-13",
   *     "attendanceStatusId": 3,
   *     "arrivalTime": "08:15",
   *     "minutesLate": 15,
   *     "notes": "Llegó 15 minutos tarde",
   *     ...
   *   },
   *   "changeHistory": {
   *     "id": 456,
   *     "studentAttendanceId": 123,
   *     "attendanceStatusIdBefore": 1,
   *     "attendanceStatusIdAfter": 3,
   *     "arrivalTimeBefore": "08:00",
   *     "arrivalTimeAfter": "08:15",
   *     "changeReason": "Estudiante llegó tarde por tráfico, autorizado por coordinador",
   *     "changedBy": 5,
   *     "changedAt": "2025-11-13T10:30:00Z"
   *   }
   * }
   * ```
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'modify')
  async updateAttendance(
    @ValidatedParam(attendanceIdParamSchema) params: { id: number },
    @ValidatedBody(updateAttendanceSchema)
    dto: UpdateAttendanceDto,
    @Request() req: any,
  ) {
    // Extraer contexto del usuario autenticado
    const userContext: UserContext = {
      userId: req.user.id,
      roleId: req.user.roleId,
      email: req.user.email,
    };

    return this.attendanceService.updateAttendance(params.id, dto, userContext);
  }

  /**
   * GET /api/attendance/enrollment/:enrollmentId
   * 
   * Obtiene el historial completo de asistencia de un estudiante
   * 
   * Incluye:
   * - Todos los registros de asistencia (paginados)
   * - Historial de cambios (auditoría)
   * - Asistencia por clase individual
   * - Ordenado por fecha descendente (más reciente primero)
   * 
   * @param enrollmentId ID de la matrícula
   * @param limit Número de registros por página (default: 50)
   * @param offset Número de registros a saltar (default: 0)
   * @returns Historial paginado con auditoría
   * @throws NotFoundException (404) - Matrícula no encontrada
   * 
   * @example
   * ```bash
   * GET /api/attendance/enrollment/123?limit=20&offset=0
   * Authorization: Bearer <token>
   * 
   * Response (200 OK):
   * {
   *   "total": 45,
   *   "data": [
   *     {
   *       "id": 1,
   *       "enrollmentId": 123,
   *       "date": "2025-11-13",
   *       "attendanceStatusId": 1,
   *       "arrivalTime": "08:00",
   *       "minutesLate": 0,
   *       "notes": null,
   *       "changeHistory": [
   *         {
   *           "id": 456,
   *           "attendanceStatusIdBefore": 2,
   *           "attendanceStatusIdAfter": 1,
   *           "changeReason": "Corrección por secretaria",
   *           "changedAt": "2025-11-13T10:30:00Z"
   *         }
   *       ],
   *       "classAttendances": [
   *         {
   *           "id": 789,
   *           "scheduleId": 10,
   *           "status": "P",
   *           "arrivalTime": "08:00"
   *         }
   *       ]
   *     }
   *   ]
   * }
   * ```
   */
  @Get('enrollment/:enrollmentId')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'view')
  async getStudentAttendance(
    @ValidatedParam(enrollmentIdParamSchema) params: { enrollmentId: number },
    @ValidatedQuery(paginationQuerySchema) query: { limit?: number; offset?: number },
  ) {
    const limit = query.limit || 50;
    const offset = query.offset || 0;

    return this.attendanceService.getStudentAttendance(
      params.enrollmentId,
      limit,
      offset,
    );
  }

  /**
   * GET /api/attendance/report/:enrollmentId
   * 
   * Obtiene el reporte de asistencia consolidado para un estudiante
   * 
   * Incluye:
   * - Conteo total de presentes, ausentes, justificados
   * - Percentaje de asistencia
   * - Status de riesgo (< 80%)
   * - Detalles de enrollment, estudiante y sección
   * 
   * @param enrollmentId ID de la matrícula
   * @returns Reporte de asistencia consolidado
   * @throws NotFoundException (404) - Matrícula no encontrada
   * 
   * @example
   * ```bash
   * GET /api/attendance/report/123
   * Authorization: Bearer <token>
   * 
   * Response (200 OK):
   * {
   *   "id": 1,
   *   "enrollmentId": 123,
   *   "bimesterId": 1,
   *   "cycleId": 1,
   *   "countPresent": 18,
   *   "countAbsent": 2,
   *   "countAbsentJustified": 3,
   *   "countTemporal": 1,
   *   "countTardy": 1,
   *   "attendancePercentage": 95.35,
   *   "absencePercentage": 4.65,
   *   "isAtRisk": false,
   *   "enrollment": {
   *     "student": {
   *       "firstName": "Juan",
   *       "lastName": "Pérez"
   *     },
   *     "section": {
   *       "name": "6to A",
   *       "grade": { "name": "6to Primaria" }
   *     }
   *   }
   * }
   * ```
   */
  @Get('report/:enrollmentId')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'view')
  async getAttendanceReport(
    @ValidatedParam(enrollmentIdParamSchema) params: { enrollmentId: number },
  ) {
    return this.attendanceService.getAttendanceReport(params.enrollmentId);
  }

  /**
   * GET /api/attendance/cycle/active
   * 
   * Obtiene el ciclo escolar activo
   * 
   * @returns Ciclo escolar activo
   * @throws 404 - No hay ciclo activo
   * @throws 403 - Sin permisos
   * 
   * @example
   * GET /api/attendance/cycle/active
   * 
   * Response 200:
   * {
   *   "id": 1,
   *   "name": "Ciclo Escolar 2025",
   *   "startDate": "2025-01-15T00:00:00.000Z",
   *   "endDate": "2025-10-31T23:59:59.000Z",
   *   "isActive": true,
   *   "isClosed": false,
   *   "createdAt": "2025-01-01T12:00:00.000Z"
   * }
   */
  @Get('cycle/active')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'read')
  async getActiveCycle() {
    return this.attendanceService.getActiveCycle();
  }

  /**
   * GET /api/attendance/cycle/active/grades
   * 
   * Obtiene los grados asociados al ciclo escolar activo
   * 
   * Utiliza la tabla GradeCycle para recuperar los grados vinculados al ciclo activo
   * 
   * @returns Array de grados con información completa del ciclo
   * @throws 404 - No hay ciclo activo o sin grados asociados
   * @throws 403 - Sin permisos
   * 
   * @example
   * GET /api/attendance/cycle/active/grades
   * 
   * Response 200:
   * [
   *   {
   *     "id": 1,
   *     "cycleId": 1,
   *     "gradeId": 1,
   *     "grade": {
   *       "id": 1,
   *       "name": "6to Primaria",
   *       "level": "primaria",
   *       "order": 6,
   *       "isActive": true
   *     }
   *   },
   *   {
   *     "id": 2,
   *     "cycleId": 1,
   *     "gradeId": 2,
   *     "grade": {
   *       "id": 2,
   *       "name": "5to Primaria",
   *       "level": "primaria",
   *       "order": 5,
   *       "isActive": true
   *     }
   *   }
   * ]
   */
  @Get('cycle/active/grades')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'read')
  async getGradesByActiveCycle() {
    return this.attendanceService.getGradesByActiveCycle();
  }

  /**
   * GET /api/attendance/grades/:gradeId/sections
   * 
   * Obtiene todas las secciones de un grado específico
   * 
   * Trae información de:
   * - ID, nombre y capacidad de la sección
   * - Maestro/a guía asignado (si existe)
   * 
   * @param gradeId - ID del grado
   * @returns Array de secciones del grado
   * @throws 400 - ID del grado inválido
   * @throws 404 - Grado no encontrado o sin secciones
   * @throws 403 - Sin permisos
   * 
   * @example
   * GET /api/attendance/grades/1/sections
   * 
   * Response 200:
   * [
   *   {
   *     "id": 1,
   *     "name": "6to A",
   *     "capacity": 35,
   *     "gradeId": 1,
   *     "teacherId": 5,
   *     "teacher": {
   *       "id": 5,
   *       "givenNames": "Juan",
   *       "lastNames": "Pérez",
   *       "email": "juan.perez@colegio.edu.gt"
   *     }
   *   },
   *   {
   *     "id": 2,
   *     "name": "6to B",
   *     "capacity": 33,
   *     "gradeId": 1,
   *     "teacherId": 6,
   *     "teacher": {
   *       "id": 6,
   *       "givenNames": "María",
   *       "lastNames": "García",
   *       "email": "maria.garcia@colegio.edu.gt"
   *     }
   *   }
   * ]
   */
  @Get('grades/:gradeId/sections')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'read')
  async getSectionsByGrade(
    @ValidatedParam(gradeIdParamSchema) params: { gradeId: number },
  ) {
    return this.attendanceService.getSectionsByGrade(params.gradeId);
  }

  /**
   * GET /api/attendance/bimester/by-date
   * 
   * Valida que la fecha seleccionada está dentro de un bimestre activo
   * Parte del flujo de validaciones en cascada (Hook 1)
   * 
   * @query cycleId - ID del ciclo escolar
   * @query date - Fecha a validar (YYYY-MM-DD)
   * @returns Bimester data o error
   * @throws 400 - Bimestre no encontrado o inactivo
   * 
   * @example
   * GET /api/attendance/bimester/by-date?cycleId=1&date=2025-11-13
   */
  @Get('bimester/by-date')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'read')
  async validateBimesterByDate(
    @Query('cycleId') cycleId: string,
    @Query('date') date: string,
  ) {
    const parsedCycleId = parseInt(cycleId, 10);

    if (isNaN(parsedCycleId)) {
      throw new BadRequestException('Invalid cycleId');
    }

    return this.attendanceService.validateBimesterByDate(parsedCycleId, date);
  }

  /**
   * GET /api/attendance/holiday/by-date
   * 
   * Valida si la fecha es feriado y si está recuperado
   * Parte del flujo de validaciones en cascada (Hook 2)
   * 
   * @query bimesterId - ID del bimestre
   * @query date - Fecha a validar (YYYY-MM-DD)
   * @returns Holiday data o null si no es feriado
   * @throws 400 - Feriado no recuperado
   * 
   * @example
   * GET /api/attendance/holiday/by-date?bimesterId=1&date=2025-11-01
   */
  @Get('holiday/by-date')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'read')
  async validateHolidayByDate(
    @Query('bimesterId') bimesterId: string,
    @Query('date') date: string,
  ) {
    const parsedBimesterId = parseInt(bimesterId, 10);

    if (isNaN(parsedBimesterId)) {
      throw new BadRequestException('Invalid bimesterId');
    }

    const holiday = await this.attendanceService.validateHolidayByDate(
      parsedBimesterId,
      date,
    );

    return {
      success: true,
      data: holiday,
      message: holiday
        ? 'Holiday found but is recovered - allowed to record'
        : 'Date is not a holiday',
    };
  }

  /**
   * GET /api/attendance/week/by-date
   * 
   * Valida si la fecha está en una semana de BREAK
   * Parte del flujo de validaciones en cascada (Hook 3)
   * 
   * @query bimesterId - ID del bimestre
   * @query date - Fecha a validar (YYYY-MM-DD)
   * @returns AcademicWeek data o null si no está en semana
   * @throws 400 - Está en semana BREAK
   * 
   * @example
   * GET /api/attendance/week/by-date?bimesterId=1&date=2025-11-13
   */
  @Get('week/by-date')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'read')
  async validateAcademicWeekByDate(
    @Query('bimesterId') bimesterId: string,
    @Query('date') date: string,
  ) {
    const parsedBimesterId = parseInt(bimesterId, 10);

    if (isNaN(parsedBimesterId)) {
      throw new BadRequestException('Invalid bimesterId');
    }

    const week = await this.attendanceService.validateAcademicWeekByDate(
      parsedBimesterId,
      date,
    );

    return {
      success: true,
      data: week,
      message: week
        ? `Week found - ${week.weekType} type`
        : 'Date is not within any academic week',
    };
  }

  /**
   * GET /api/attendance/schedules/teacher/:teacherId/day/:dayOfWeek
   * 
   * Verifica que el maestro tiene clases programadas para ese día
   * Parte del flujo de validaciones en cascada (Hook 4)
   * 
   * @param teacherId - ID del maestro
   * @param dayOfWeek - Día de semana (0-6, 0=Lunes)
   * @query sectionId - ID de la sección
   * @returns Array de schedules o error
   * @throws 404 - Sin schedules programados
   * 
   * @example
   * GET /api/attendance/schedules/teacher/2/day/1?sectionId=1
   */
  @Get('schedules/teacher/:teacherId/day/:dayOfWeek')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'read')
  async validateTeacherSchedules(
    @Param('teacherId') teacherId: string,
    @Param('dayOfWeek') dayOfWeek: string,
    @Query('sectionId') sectionId: string,
  ) {
    const parsedTeacherId = parseInt(teacherId, 10);
    const parsedDayOfWeek = parseInt(dayOfWeek, 10);
    const parsedSectionId = parseInt(sectionId, 10);

    if (isNaN(parsedTeacherId) || isNaN(parsedDayOfWeek) || isNaN(parsedSectionId)) {
      throw new BadRequestException('Invalid parameters');
    }

    const schedules = await this.attendanceService.validateTeacherSchedules(
      parsedTeacherId,
      parsedDayOfWeek,
      parsedSectionId,
    );

    return {
      success: true,
      data: schedules,
      count: schedules.length,
      message: 'Schedules found',
    };
  }

  /**
   * GET /api/attendance/teacher-absence/:teacherId
   * 
   * Verifica si el maestro está de ausencia aprobada en la fecha
   * Parte del flujo de validaciones en cascada (Hook 5)
   * 
   * @param teacherId - ID del maestro
   * @query date - Fecha a validar (YYYY-MM-DD)
   * @returns Absence data o null si no está de ausencia
   * @throws 400 - Está de ausencia aprobada
   * 
   * @example
   * GET /api/attendance/teacher-absence/2?date=2025-11-13
   */
  @Get('teacher-absence/:teacherId')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'read')
  async validateTeacherAbsenceByDate(
    @Param('teacherId') teacherId: string,
    @Query('date') date: string,
  ) {
    const parsedTeacherId = parseInt(teacherId, 10);

    if (isNaN(parsedTeacherId)) {
      throw new BadRequestException('Invalid teacherId');
    }

    const absence = await this.attendanceService.validateTeacherAbsenceByDate(
      parsedTeacherId,
      date,
    );

    return {
      success: true,
      data: absence,
      message: 'Teacher is not on absence',
    };
  }

  /**
   * GET /api/attendance/config/active
   * 
   * Obtiene configuración de asistencia activa o DEFAULT
   * Parte del flujo de validaciones en cascada (Hook 6)
   * 
   * @returns AttendanceConfig data
   * 
   * @example
   * GET /api/attendance/config/active
   */
  @Get('config/active')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'read')
  async getActiveAttendanceConfig() {
    const config = await this.attendanceService.getActiveAttendanceConfig();

    return {
      success: true,
      data: config,
      message: config.id
        ? 'Active config found'
        : 'No active config - returning DEFAULT',
    };
  }

  /**
   * GET /api/attendance/enrollment/section/:sectionId/cycle/:cycleId/active
   * 
   * Obtiene lista de estudiantes matriculados en la sección para esa fecha
   * Parte del flujo de validaciones en cascada (Hook 7)
   * 
   * @param sectionId - ID de la sección
   * @param cycleId - ID del ciclo
   * @query date - Fecha para filtrar (YYYY-MM-DD)
   * @returns Array de enrollments con student data
   * @throws 400 - Sin estudiantes activos
   * 
   * @example
   * GET /api/attendance/enrollment/section/1/cycle/1/active?date=2025-11-13
   */
  @Get('enrollment/section/:sectionId/cycle/:cycleId/active')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'read')
  async getActiveEnrollmentsBySectionAndCycle(
    @Param('sectionId') sectionId: string,
    @Param('cycleId') cycleId: string,
    @Query('date') date: string,
  ) {
    const parsedSectionId = parseInt(sectionId, 10);
    const parsedCycleId = parseInt(cycleId, 10);

    if (isNaN(parsedSectionId) || isNaN(parsedCycleId)) {
      throw new BadRequestException('Invalid parameters');
    }

    const enrollments =
      await this.attendanceService.getActiveEnrollmentsBySectionAndCycle(
        parsedSectionId,
        parsedCycleId,
        date,
      );

    return {
      success: true,
      data: enrollments,
      count: enrollments.length,
      message: 'Enrollments found',
    };
  }

  /**
   * GET /api/attendance/status/allowed/role/:roleId
   * 
   * Obtiene estados de asistencia permitidos para el rol
   * Parte del flujo de validaciones en cascada (Hook 8)
   * 
   * @param roleId - ID del rol
   * @returns Array de attendance statuses con permissions
   * @throws 403 - Rol sin permisos para crear asistencia
   * 
   * @example
   * GET /api/attendance/status/allowed/role/3
   */
  @Get('status/allowed/role/:roleId')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'read')
  async getAllowedAttendanceStatusesByRole(
    @Param('roleId') roleId: string,
  ) {
    const parsedRoleId = parseInt(roleId, 10);

    if (isNaN(parsedRoleId)) {
      throw new BadRequestException('Invalid roleId');
    }

    const statuses =
      await this.attendanceService.getAllowedAttendanceStatusesByRole(
        parsedRoleId,
      );

    return {
      success: true,
      data: statuses,
      count: statuses.length,
      message: 'Allowed attendance statuses',
    };
  }

  /**
   * GET /api/attendance/holidays
   *
   * Obtiene la lista de días festivos (holidays) para un bimestre específico
   * o todos los holidays del ciclo activo si no se proporciona bimesterId.
   *
   * @param bimesterId - ID del bimestre (opcional)
   * @returns Array de holidays ordenados por fecha
   * @throws NotFoundException - Si no hay holidays
   * @throws BadRequestException - Si bimesterId es inválido
   *
   * @example
   * // Obtener todos los holidays del ciclo activo
   * GET /api/attendance/holidays
   *
   * // Obtener holidays de un bimestre específico
   * GET /api/attendance/holidays?bimesterId=3
   */
  @Get('holidays')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'read')
  async getHolidays(
    @Query('bimesterId') bimesterId?: string,
  ) {
    const parsedBimesterId = bimesterId ? parseInt(bimesterId, 10) : undefined;

    if (bimesterId && isNaN(parsedBimesterId!)) {
      throw new BadRequestException('Invalid bimesterId');
    }

    const holidays = await this.attendanceService.getHolidays(parsedBimesterId);

    return {
      success: true,
      data: holidays,
      count: holidays.length,
      message: 'Holidays retrieved successfully',
    };
  }

  /**
   * GET /api/attendance/bimester/active
   *
   * Obtiene el bimestre activo actual basándose en la fecha de hoy.
   * Útil para inicializar formularios y UI.
   *
   * @returns Bimester activo con información del ciclo
   * @throws NotFoundException - Si no hay bimestre activo
   *
   * @example
   * GET /api/attendance/bimester/active
   *
   * Response:
   * {
   *   "success": true,
   *   "data": {
   *     "id": 3,
   *     "name": "Tercer Bimestre",
   *     "startDate": "2025-09-01T00:00:00.000Z",
   *     "endDate": "2025-10-31T23:59:59.000Z",
   *     "cycle": { ... }
   *   },
   *   "message": "Active bimester found"
   * }
   */
  @Get('bimester/active')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'read')
  async getActiveBimester() {
    const bimester = await this.attendanceService.getActiveBimester();

    return {
      success: true,
      data: bimester,
      message: 'Active bimester found',
    };
  }

  /**
   * GET /api/attendance/enrollment/section/:sectionId/students
   *
   * Obtiene todos los estudiantes matriculados (enrollments) en una sección
   * específica para el ciclo escolar activo.
   * Versión simplificada sin filtro de fecha.
   *
   * @param sectionId - ID de la sección
   * @param includeInactive - Incluir estudiantes inactivos (default: false)
   * @returns Array de enrollments con detalles de estudiante y sección
   * @throws NotFoundException - Si la sección no existe o sin estudiantes
   * @throws BadRequestException - Si sectionId es inválido
   *
   * @example
   * // Solo estudiantes activos
   * GET /api/attendance/enrollment/section/1/students
   *
   * // Incluir estudiantes inactivos
   * GET /api/attendance/enrollment/section/1/students?includeInactive=true
   */
  @Get('enrollment/section/:sectionId/students')
  @HttpCode(HttpStatus.OK)
  @Permissions('attendance', 'read')
  async getEnrollmentsBySection(
    @Param('sectionId') sectionId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const parsedSectionId = parseInt(sectionId, 10);

    if (isNaN(parsedSectionId)) {
      throw new BadRequestException('Invalid sectionId');
    }

    const enrollments = await this.attendanceService.getEnrollmentsBySection(
      parsedSectionId,
      includeInactive === 'true',
    );

    return {
      success: true,
      data: enrollments,
      count: enrollments.length,
      message: 'Enrollments retrieved successfully',
    };
  }
}

