// src\types\SchoolCycle.ts

export interface SchoolCycle {
  id: number;
  name: string;
 startDate: Date | string; // ✅ Date, no string
  endDate: Date | string;
  isActive?: boolean;
  isClosed?: boolean;
  createdAt?: string;
}

export interface SchoolCyclePayload extends Omit<SchoolCycle, 'id' | 'createdAt' | 'updatedAt'> {}
