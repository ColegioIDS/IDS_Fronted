/**
 * GET /api/assignments/cascade/courses/[courseId]/bimesters
 * Retorna los bimestres disponibles para un curso específico
 */

import { NextResponse } from 'next/server';

// TODO: Reemplazar con datos desde Prisma
// const bimesters = await prisma.bimester.findMany({
//   where: { isActive: true },
//   orderBy: { number: 'asc' },
// });

const MOCK_BIMESTERS = [
  {
    id: 1,
    name: 'Bimestre I',
    number: 1,
    startDate: new Date('2025-01-13'),
    endDate: new Date('2025-02-23'),
  },
  {
    id: 2,
    name: 'Bimestre II',
    number: 2,
    startDate: new Date('2025-02-24'),
    endDate: new Date('2025-04-25'),
  },
  {
    id: 3,
    name: 'Bimestre III',
    number: 3,
    startDate: new Date('2025-04-28'),
    endDate: new Date('2025-06-27'),
  },
  {
    id: 4,
    name: 'Bimestre IV',
    number: 4,
    startDate: new Date('2025-08-04'),
    endDate: new Date('2025-09-19'),
  },
  {
    id: 5,
    name: 'Bimestre V',
    number: 5,
    startDate: new Date('2025-09-22'),
    endDate: new Date('2025-11-14'),
  },
];

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = parseInt(params.courseId);

    if (isNaN(courseId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_COURSE_ID',
            message: 'El ID del curso debe ser un número válido',
          },
        },
        { status: 400 }
      );
    }

    // En una aplicación real, filtrarías bimestres por curso
    // Por ahora retornamos todos los bimestres disponibles
    const bimesters = MOCK_BIMESTERS;

    return NextResponse.json(
      {
        success: true,
        data: bimesters,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/assignments/cascade/courses/[courseId]/bimesters]', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener los bimestres',
        },
      },
      { status: 500 }
    );
  }
}
