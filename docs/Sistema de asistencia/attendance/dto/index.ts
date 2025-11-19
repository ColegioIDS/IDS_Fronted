// src/modules/attendance/dto/index.ts

// 📋 DTOs PRINCIPALES
export * from './create-attendance.dto';
export * from './bulk-teacher-attendance.dto';
export * from './single-attendance.dto';
export * from './update-attendance.dto';
export * from './section-attendance.dto';
export * from './teacher-courses.dto';

// 📋 DTOs DE VALIDACIÓN EN CASCADA
export * from './validation-responses.dto';

// 📋 TIPOS
export type { AttendanceConfigDetailsResponseDto } from '../attendance.types';
