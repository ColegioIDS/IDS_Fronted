/**
 * GET /api/assignments/cascade/grades/[gradeId]/sections
 * Retorna las secciones para un grado específico
 */

import { NextResponse } from 'next/server';

// TODO: Reemplazar con datos desde Prisma
// const sections = await prisma.section.findMany({
//   where: { gradeId: parseInt(params.gradeId), isActive: true },
//   orderBy: { name: 'asc' },
// });

const MOCK_SECTIONS_BY_GRADE: Record<number, any[]> = {
  1: [
    { id: 1, name: 'Sección A', gradeId: 1 },
    { id: 2, name: 'Sección B', gradeId: 1 },
    { id: 3, name: 'Sección C', gradeId: 1 },
  ],
  2: [
    { id: 4, name: 'Sección A', gradeId: 2 },
    { id: 5, name: 'Sección B', gradeId: 2 },
  ],
  3: [
    { id: 6, name: 'Sección A', gradeId: 3 },
    { id: 7, name: 'Sección B', gradeId: 3 },
  ],
  4: [
    { id: 8, name: 'Sección A', gradeId: 4 },
  ],
  5: [
    { id: 9, name: 'Sección A', gradeId: 5 },
    { id: 10, name: 'Sección B', gradeId: 5 },
  ],
  6: [
    { id: 11, name: 'Sección A', gradeId: 6 },
  ],
  7: [
    { id: 12, name: 'Sección A', gradeId: 7 },
    { id: 13, name: 'Sección B', gradeId: 7 },
  ],
};

export async function GET(
  request: Request,
  { params }: { params: { gradeId: string } }
) {
  try {
    const gradeId = parseInt(params.gradeId);

    if (isNaN(gradeId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_GRADE_ID',
            message: 'El ID del grado debe ser un número válido',
          },
        },
        { status: 400 }
      );
    }

    const sections = MOCK_SECTIONS_BY_GRADE[gradeId] || [];

    return NextResponse.json(
      {
        success: true,
        data: sections,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/assignments/cascade/grades/[gradeId]/sections]', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener las secciones',
        },
      },
      { status: 500 }
    );
  }
}
