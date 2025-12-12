import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/erica-evaluations/config/state-colors
 * 
 * Retorna todos los colores asociados a los estados ERICA (E, B, P, C, N).
 * Propósito: Renderizar estados de desempeño con colores y leyendas de puntos.
 * 
 * Respuesta exitosa (200):
 * {
 *   success: true,
 *   message: "Colores de estados ERICA obtenidos",
 *   data: [
 *     {
 *       state: "E",
 *       name: "Excelente (1.0 pts)",
 *       description: "Desempeño excelente, domina completamente el contenido...",
 *       hexColor: "#4CAF50",
 *       points: 1.0,
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
    // TODO: Conectar con la base de datos para obtener registros de EricaStateColor
    // const stateColors = await prisma.ericaStateColor.findMany({
    //   where: { isActive: true },
    //   orderBy: [
    //     { points: 'desc' },
    //     { state: 'asc' }
    //   ]
    // });

    // Datos de ejemplo (simulados hasta implementar la BD)
    const stateColors = [
      {
        state: 'E',
        name: 'Excelente (1.0 pts)',
        description: 'Desempeño excelente, domina completamente el contenido y demuestra profundo entendimiento...',
        hexColor: '#4CAF50',
        points: 1.0,
        isActive: true,
      },
      {
        state: 'B',
        name: 'Bien (0.75 pts)',
        description: 'Buen desempeño, demuestra dominio satisfactorio del contenido con mínimas carencias...',
        hexColor: '#8BC34A',
        points: 0.75,
        isActive: true,
      },
      {
        state: 'P',
        name: 'Poco (0.50 pts)',
        description: 'Desempeño limitado, demuestra conocimiento parcial y requiere refuerzo...',
        hexColor: '#FFC107',
        points: 0.5,
        isActive: true,
      },
      {
        state: 'C',
        name: 'Casi nada (0.25 pts)',
        description: 'Desempeño muy bajo, demuestra conocimiento mínimo y necesita intervención inmediata...',
        hexColor: '#FF9800',
        points: 0.25,
        isActive: true,
      },
      {
        state: 'N',
        name: 'Nada (0 pts)',
        description: 'No demuestra el desempeño esperado, requiere reevaluación y apoyo integral...',
        hexColor: '#F44336',
        points: 0.0,
        isActive: true,
      },
    ];

    return NextResponse.json({
      success: true,
      message: 'Colores de estados ERICA obtenidos',
      data: stateColors,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener colores de estados ERICA',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
