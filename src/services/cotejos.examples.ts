/**
 * Ejemplos de uso del módulo de Cotejos
 */

// ==================== USAR HOOKS EN COMPONENTES ====================

/*
// Importar hooks
import { useCotejo, useCascade, useCotejosBySection, useUpdateActitudinal, useSubmitCotejo } from '@/hooks/useCotejos';

// Ejemplo 1: Obtener datos en cascada
function MiComponente1() {
  const { cascade, loading, error } = useCascade(false);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>Ciclo: {cascade?.data?.cycle?.name}</p>
      <p>Bimestre: {cascade?.data?.activeBimester?.name}</p>
    </div>
  );
}

// Ejemplo 2: Obtener cotejos de una sección
function MiComponente2() {
  const { cotejos, total, loading } = useCotejosBySection({
    sectionId: 1,
    courseId: 10,
    bimesterId: 1,
    cycleId: 1
  });

  if (loading) return <div>Cargando cotejos...</div>;

  return (
    <div>
      <p>Total: {total}</p>
      {cotejos.map(c => (
        <div key={c.id}>
          {c.enrollment?.student?.givenNames} - {c.totalScore}
        </div>
      ))}
    </div>
  );
}

// Ejemplo 3: Actualizar puntuación actitudinal
function MiComponente3() {
  const { mutate, loading } = useUpdateActitudinal();

  const handleClick = async () => {
    try {
      const result = await mutate(1, 18.5, 'Buen comportamiento');
      console.log('Actualizado:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return <button onClick={handleClick} disabled={loading}>Actualizar</button>;
}

// Ejemplo 4: Finalizar cotejo
function MiComponente4() {
  const { mutate, loading } = useSubmitCotejo();

  const handleClick = async () => {
    try {
      const result = await mutate(1, 'Cierre de bimestre');
      console.log('Finalizado:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return <button onClick={handleClick} disabled={loading}>Finalizar</button>;
}
*/

// ==================== USAR SERVICE DIRECTAMENTE ====================

import * as CotejosService from '@/services/cotejos.service';

export async function ejemplo1() {
  // Obtener datos en cascada
  const cascade = await CotejosService.getCascadeData(false);
  console.log(cascade);
}

export async function ejemplo2() {
  // Generar cotejo
  const cotejo = await CotejosService.generateCotejo(50, 10, 1, 1, {
    feedback: 'Cotejo inicial'
  });
  console.log('Cotejo generado:', cotejo);
}

export async function ejemplo3() {
  // Obtener cotejos por sección
  const result = await CotejosService.getCotejosBySection(1, 10, 1, 1);
  console.log('Cotejos:', result.cotejos);
  console.log('Total:', result.total);
}

export async function ejemplo4() {
  // Actualizar actitudinal
  const updated = await CotejosService.updateActitudinal(1, {
    actitudinalScore: 18.5,
    feedback: 'Buen comportamiento'
  });
  console.log('Actualizado:', updated);
}

export async function ejemplo5() {
  // Actualizar declarativo
  const updated = await CotejosService.updateDeclarativo(1, {
    declarativoScore: 27.0,
    feedback: 'Excelente dominio de conceptos'
  });
  console.log('Actualizado:', updated);
}

export async function ejemplo6() {
  // Finalizar cotejo
  const submitted = await CotejosService.submitCotejo(1, {
    feedback: 'Cierre de bimestre'
  });
  console.log('Finalizado:', submitted);
  console.log('Total:', submitted.totalScore);
  console.log('Estado:', submitted.status);
}

// ==================== VALIDACIONES ====================

import { GenerateCotejoSchema, UpdateActitudinalSchema, UpdateDeclarativoSchema } from '@/schemas/cotejos.schema';

export async function validarGenerateCotejo() {
  try {
    const data = GenerateCotejoSchema.parse({
      feedback: 'Comentarios'
    });
    console.log('Válido:', data);
  } catch (error) {
    console.error('Error de validación:', error);
  }
}

export async function validarUpdateActitudinal() {
  try {
    const data = UpdateActitudinalSchema.parse({
      actitudinalScore: 18.5,
      feedback: 'Buen comportamiento'
    });
    console.log('Válido:', data);
  } catch (error) {
    console.error('Error de validación:', error);
  }
}

// ==================== FLUJO COMPLETO ====================

export async function flujoCompleto() {
  try {
    // 1. Obtener datos en cascada
    const cascade = await CotejosService.getCascadeData(false);
    console.log('✅ Cascade cargado');

    // 2. Generar cotejo
    const cotejo = await CotejosService.generateCotejo(50, 10, 1, 1, {});
    console.log('✅ Cotejo generado:', cotejo.id);

    // 3. Actualizar actitudinal
    const withActitudinal = await CotejosService.updateActitudinal(cotejo.id, {
      actitudinalScore: 18.5,
      feedback: 'Buen comportamiento'
    });
    console.log('✅ Actitudinal actualizado');

    // 4. Actualizar declarativo
    const withDeclarativo = await CotejosService.updateDeclarativo(cotejo.id, {
      declarativoScore: 27.0,
      feedback: 'Excelente dominio'
    });
    console.log('✅ Declarativo actualizado');

    // 5. Finalizar
    const finalCotejo = await CotejosService.submitCotejo(cotejo.id, {
      feedback: 'Cierre de bimestre'
    });
    console.log('✅ Cotejo finalizado');
    console.log('📊 Total:', finalCotejo.totalScore);
    console.log('📊 ERICA:', finalCotejo.ericaScore);
    console.log('📊 TAREAS:', finalCotejo.tasksScore);
    console.log('📊 ACTITUDINAL:', finalCotejo.actitudinalScore);
    console.log('📊 DECLARATIVO:', finalCotejo.declarativoScore);

  } catch (error) {
    console.error('❌ Error en flujo:', error);
  }
}

// ==================== BATCH OPERATIONS ====================

export async function generarCotejosPorLotes() {
  try {
    // Generar cotejos para múltiples estudiantes
    const enrollmentIds = [50, 51, 52, 53];
    const cotejos = await CotejosService.generateCotejosBatch(
      enrollmentIds,
      10,  // courseId
      1,   // bimesterId
      1    // cycleId
    );
    console.log(`✅ ${cotejos.length} cotejos generados`);
  } catch (error) {
    console.error('❌ Error en batch:', error);
  }
}
