/**
 * GET /api/assignments/cascade/grades
 * Retorna todos los grados disponibles
 */

import { NextResponse } from 'next/server';

// TODO: Reemplazar con datos desde Prisma
// const grades = await prisma.grade.findMany({
//   where: { isActive: true },
//   orderBy: { level: 'asc' },
// });

const MOCK_GRADES = [
  { id: 1, name: '6to Grado', level: 6 },
  { id: 2, name: '7mo Grado', level: 7 },
  { id: 3, name: '8vo Grado', level: 8 },
  { id: 4, name: '9no Grado', level: 9 },
  { id: 5, name: '10mo Grado', level: 10 },
  { id: 6, name: '11vo Grado', level: 11 },
  { id: 7, name: '12vo Grado', level: 12 },
];

export async function GET() {
  try {
    return NextResponse.json(
      {
        success: true,
        data: MOCK_GRADES,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/assignments/cascade/grades]', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener los grados',
        },
      },
      { status: 500 }
    );
  }
}
