// src/types/Holiday.ts
export interface Holiday {
  id: number;
  bimesterId: number;
  date: string; // O Date si haces la conversión
  description: string;
  isRecovered: boolean;
  bimester?: {
    id: number;
    name: string;
    cycle?: {
      id: number;
      name: string;
    };
  };
}

export interface CreateHolidayPayload {
  bimesterId: number;
  date: string; // Formato ISO: 'YYYY-MM-DD'
  description: string;
  isRecovered?: boolean;
}

export interface UpdateHolidayPayload {
  bimesterId?: number;
  date?: string;
  description?: string;
  isRecovered?: boolean;
}