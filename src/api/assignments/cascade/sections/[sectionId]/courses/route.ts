/**
 * GET /api/assignments/cascade/sections/[sectionId]/courses
 * Retorna los cursos para una sección específica
 */

import { NextResponse } from 'next/server';

// TODO: Reemplazar con datos desde Prisma
// const courses = await prisma.course.findMany({
//   where: { sectionId: parseInt(params.sectionId), isActive: true },
//   orderBy: { name: 'asc' },
// });

const MOCK_COURSES_BY_SECTION: Record<number, any[]> = {
  1: [
    { id: 1, name: 'Español', code: 'ESP-101', sectionId: 1 },
    { id: 2, name: 'Matemáticas', code: 'MAT-101', sectionId: 1 },
    { id: 3, name: 'Ciencias Naturales', code: 'CN-101', sectionId: 1 },
    { id: 4, name: 'Estudios Sociales', code: 'SS-101', sectionId: 1 },
    { id: 5, name: 'Inglés', code: 'ENG-101', sectionId: 1 },
  ],
  2: [
    { id: 6, name: 'Español', code: 'ESP-102', sectionId: 2 },
    { id: 7, name: 'Matemáticas', code: 'MAT-102', sectionId: 2 },
    { id: 8, name: 'Ciencias Naturales', code: 'CN-102', sectionId: 2 },
  ],
  3: [
    { id: 9, name: 'Español', code: 'ESP-103', sectionId: 3 },
    { id: 10, name: 'Matemáticas', code: 'MAT-103', sectionId: 3 },
  ],
  4: [
    { id: 11, name: 'Español', code: 'ESP-201', sectionId: 4 },
    { id: 12, name: 'Matemáticas', code: 'MAT-201', sectionId: 4 },
    { id: 13, name: 'Física', code: 'FIS-201', sectionId: 4 },
    { id: 14, name: 'Química', code: 'QUI-201', sectionId: 4 },
  ],
  5: [
    { id: 15, name: 'Español', code: 'ESP-202', sectionId: 5 },
    { id: 16, name: 'Matemáticas', code: 'MAT-202', sectionId: 5 },
  ],
  6: [
    { id: 17, name: 'Español', code: 'ESP-203', sectionId: 6 },
    { id: 18, name: 'Matemáticas', code: 'MAT-203', sectionId: 6 },
    { id: 19, name: 'Biología', code: 'BIO-203', sectionId: 6 },
  ],
  7: [
    { id: 20, name: 'Español', code: 'ESP-301', sectionId: 7 },
    { id: 21, name: 'Matemáticas', code: 'MAT-301', sectionId: 7 },
  ],
  8: [
    { id: 22, name: 'Español', code: 'ESP-302', sectionId: 8 },
    { id: 23, name: 'Historia', code: 'HIS-302', sectionId: 8 },
  ],
  9: [
    { id: 24, name: 'Español', code: 'ESP-401', sectionId: 9 },
    { id: 25, name: 'Matemáticas', code: 'MAT-401', sectionId: 9 },
  ],
  10: [
    { id: 26, name: 'Inglés', code: 'ENG-402', sectionId: 10 },
    { id: 27, name: 'Matemáticas', code: 'MAT-402', sectionId: 10 },
  ],
  11: [
    { id: 28, name: 'Español', code: 'ESP-501', sectionId: 11 },
    { id: 29, name: 'Matemáticas', code: 'MAT-501', sectionId: 11 },
  ],
  12: [
    { id: 30, name: 'Español', code: 'ESP-601', sectionId: 12 },
    { id: 31, name: 'Filosofía', code: 'FIL-601', sectionId: 12 },
  ],
  13: [
    { id: 32, name: 'Matemáticas', code: 'MAT-602', sectionId: 13 },
    { id: 33, name: 'Física', code: 'FIS-602', sectionId: 13 },
  ],
};

export async function GET(
  request: Request,
  { params }: { params: { sectionId: string } }
) {
  try {
    const sectionId = parseInt(params.sectionId);

    if (isNaN(sectionId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_SECTION_ID',
            message: 'El ID de la sección debe ser un número válido',
          },
        },
        { status: 400 }
      );
    }

    const courses = MOCK_COURSES_BY_SECTION[sectionId] || [];

    return NextResponse.json(
      {
        success: true,
        data: courses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/assignments/cascade/sections/[sectionId]/courses]', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener los cursos',
        },
      },
      { status: 500 }
    );
  }
}
