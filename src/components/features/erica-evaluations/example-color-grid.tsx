/**
 * Componente de ejemplo: Grilla de Evaluación ERICA con Colores Dinámicos
 * 
 * Este componente demuestra cómo usar los nuevos endpoints de colores ERICA
 * para renderizar una tabla de evaluaciones con colores consistentes.
 * 
 * Ubicación: src/components/features/erica-evaluations/example-color-grid.tsx
 */

'use client';

import { useMemo } from 'react';
import { useEricaColors } from '@/hooks/useEricaColors';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Evaluation {
  id: string;
  studentName: string;
  evaluations: Record<string, string>; // { E: 'E', R: 'B', I: 'E', C: 'P', A: 'B' }
}

interface EvaluationGridProps {
  evaluations: Evaluation[];
  title?: string;
}

/**
 * Componente que renderiza una grilla de evaluaciones con colores dinámicos
 * 
 * @example
 * ```tsx
 * const evaluations = [
 *   {
 *     id: '1',
 *     studentName: 'Juan Pérez',
 *     evaluations: {
 *       E: 'E',
 *       R: 'B',
 *       I: 'E',
 *       C: 'P',
 *       A: 'B'
 *     }
 *   }
 * ];
 * 
 * <EvaluationGridWithColors evaluations={evaluations} title="Semana 1" />
 * ```
 */
export function EvaluationGridWithColors({
  evaluations,
  title = 'Grilla de Evaluaciones ERICA',
}: EvaluationGridProps) {
  const { getDimensionColor, getStateColor, getState, loading, error } =
    useEricaColors();

  const dimensions = useMemo(() => ['E', 'R', 'I', 'C', 'A'], []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-gray-500">Cargando colores de evaluación...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-red-500">Error al cargar colores: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-gray-100 font-bold text-gray-900">
                Estudiante
              </TableHead>
              {dimensions.map((dimension) => (
                <TableHead
                  key={dimension}
                  className="text-center font-bold text-white"
                  style={{
                    backgroundColor: getDimensionColor(dimension as any),
                  }}
                >
                  {dimension}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map((evaluation) => (
              <TableRow key={evaluation.id}>
                <TableCell className="font-medium">
                  {evaluation.studentName}
                </TableCell>
                {dimensions.map((dimension) => {
                  const state = evaluation.evaluations[dimension];
                  const stateInfo = getState(state as any);
                  const backgroundColor = getStateColor(state as any);

                  return (
                    <TableCell
                      key={`${evaluation.id}-${dimension}`}
                      className="text-center p-2"
                    >
                      <Badge
                        style={{
                          backgroundColor: backgroundColor,
                          color: 'white',
                          fontSize: '0.875rem',
                        }}
                        title={stateInfo?.name || state}
                      >
                        {state}
                      </Badge>
                      {stateInfo && (
                        <div className="text-xs text-gray-600 mt-1">
                          {stateInfo.points} pts
                        </div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/**
 * Componente de Leyenda de Colores ERICA
 * 
 * Muestra los mapeos de dimensiones y estados con sus colores.
 * 
 * @example
 * ```tsx
 * <EricaColorLegend />
 * ```
 */
export function EricaColorLegend() {
  const { colors, loading, error } = useEricaColors();

  if (loading) {
    return (
      <div className="text-gray-500 text-center py-4">
        Cargando leyenda...
      </div>
    );
  }

  if (error || !colors) {
    return (
      <div className="text-red-500 text-center py-4">
        Error al cargar leyenda
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
      {/* Leyenda de Dimensiones */}
      <div>
        <h3 className="font-bold text-lg mb-4 text-gray-900">Dimensiones ERICA</h3>
        <div className="space-y-2">
          {colors.dimensions.map((dim) => (
            <div key={dim.dimension} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded flex-shrink-0"
                style={{ backgroundColor: dim.hexColor }}
                title={dim.name}
              />
              <div className="flex-grow">
                <span className="font-semibold text-sm">{dim.dimension}</span>
                <span className="text-gray-600 text-xs ml-2">{dim.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda de Estados */}
      <div>
        <h3 className="font-bold text-lg mb-4 text-gray-900">Estados de Desempeño</h3>
        <div className="space-y-2">
          {colors.states.map((state) => (
            <div key={state.state} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded flex-shrink-0"
                style={{ backgroundColor: state.hexColor }}
                title={state.name}
              />
              <div className="flex-grow">
                <span className="font-semibold text-sm">{state.state}</span>
                <span className="text-gray-600 text-xs ml-2">
                  {state.name} • {state.points} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Componente: Card de Evaluación Individual
 * 
 * Renderiza una tarjeta con la evaluación de un estudiante en una dimensión.
 */
export function EvaluationCard({
  dimension,
  state,
  studentName,
}: {
  dimension: string;
  state: string;
  studentName: string;
}) {
  const { getDimensionColor, getStateColor, getState } = useEricaColors();

  const stateInfo = getState(state as any);
  const dimensionColor = getDimensionColor(dimension as any);
  const stateColor = getStateColor(state as any);

  return (
    <Card className="overflow-hidden">
      <div
        className="h-2"
        style={{ backgroundColor: dimensionColor }}
      />
      <CardContent className="p-4">
        <div className="text-sm text-gray-600">{studentName}</div>
        <div className="text-lg font-bold mb-3">{dimension}</div>
        <Badge
          style={{
            backgroundColor: stateColor,
            color: 'white',
            fontSize: '1rem',
          }}
        >
          {state} {stateInfo && `(${stateInfo.points} pts)`}
        </Badge>
        {stateInfo && (
          <div className="text-xs text-gray-600 mt-2">{stateInfo.name}</div>
        )}
      </CardContent>
    </Card>
  );
}
