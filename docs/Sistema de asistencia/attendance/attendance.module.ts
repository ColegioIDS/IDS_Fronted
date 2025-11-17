import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './services/attendance.service';
import { AttendanceValidationService } from './services/attendance-validation.service';
import { AttendanceRepository } from './repositories';

/**
 * AttendanceModule
 * 
 * Módulo que encapsula toda la lógica de asistencia de estudiantes
 * 
 * Características:
 * - Registro masivo de asistencia
 * - Edición con auditoría completa
 * - Consulta de historial
 * - Cálculo automático de reportes
 * - 17 capas de validación
 * - Transacciones atómicas
 * 
 * Estructura:
 * - repositories/: Capa de acceso a datos
 * - services/: Lógica de negocio y validación
 * - dto/: Transferencia de datos
 * - attendance.controller.ts: Endpoints REST
 * - attendance.types.ts: Tipos e interfaces
 * 
 * Dependencias:
 * - PrismaModule: Acceso a base de datos
 */
@Module({
  imports: [PrismaModule],
  controllers: [AttendanceController],
  providers: [AttendanceRepository, AttendanceService, AttendanceValidationService],
  exports: [AttendanceService, AttendanceValidationService, AttendanceRepository],
})
export class AttendanceModule {}
