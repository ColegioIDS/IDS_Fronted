// actions/schedule-actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function saveSchedule(schedule: Record<string, any>) {
  try {
    // Implementa tu lógica para guardar en la base de datos
    // Ejemplo:
    // await db.schedule.createMany({ data: transformedSchedule });
    
    revalidatePath('/schedule');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to save schedule' };
  }
}