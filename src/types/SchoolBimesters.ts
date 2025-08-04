// src/types/SchoolBimesters.ts
export interface Bimester {
  id?: number;
  cycleId?: number;
  number?: number;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  isActive: boolean;
  weeksCount: number; 
}

export interface SchoolBimesterPayload extends Omit<Bimester, 'id'> {}