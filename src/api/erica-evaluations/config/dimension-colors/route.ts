import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/erica-evaluations/config/dimension-colors
 * 
 * Retorna todos los colores asociados a las dimensiones ERICA (E, R, I, C, A).
 * Propósito: Renderizar grillas de evaluación con colores consistentes por dimensión.
 * 
 * Respuesta exitosa (200):
 * {
 *   success: true,
 *   message: "Colores de dimensiones ERICA obtenidos",
 *   data: [
 *     {
 *       dimension: "E",
 *       name: "Ejecuta",
 *       description: "Dimensión que mide la ejecución de tareas...",
 *       hexColor: "#FF6B6B",
 *       isActive: true
 *     },
 *     ...
 *   ]
 * }
 * 
 * Permisos: Ninguno requerido (público)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Conectar con la base de datos para obtener registros de EricaDimensionColor
    // const dimensionColors = await prisma.ericaDimensionColor.findMany({
    //   where: { isActive: true },
    //   orderBy: { dimension: 'asc' }
    // });

    // Datos de ejemplo (simulados hasta implementar la BD)
    const dimensionColors = [
      {
        dimension: 'E',
        name: 'Ejecuta',
        description: 'Dimensión que mide la ejecución de tareas y su capacidad para llevar a cabo actividades...',
        hexColor: '#FF6B6B',
        isActive: true,
      },
      {
        dimension: 'R',
        name: 'Retiene',
        description: 'Dimensión que mide la retención de conocimiento y su capacidad para mantener información...',
        hexColor: '#4ECDC4',
        isActive: true,
      },
      {
        dimension: 'I',
        name: 'Interpreta',
        description: 'Dimensión que mide la interpretación de información y su análisis crítico...',
        hexColor: '#95E1D3',
        isActive: true,
      },
      {
        dimension: 'C',
        name: 'Conoce',
        description: 'Dimensión que mide el conocimiento conceptual y teórico del estudiante...',
        hexColor: '#FFE66D',
        isActive: true,
      },
      {
        dimension: 'A',
        name: 'Aplica',
        description: 'Dimensión que mide la ampliación y expansión de conocimiento más allá de lo básico...',
        hexColor: '#95BDFF',
        isActive: true,
      },
    ];

    return NextResponse.json({
      success: true,
      message: 'Colores de dimensiones ERICA obtenidos',
      data: dimensionColors,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener colores de dimensiones ERICA',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
