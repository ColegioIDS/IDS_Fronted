// src/context/EricaTopicsContext.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useEricaTopics } from '@/hooks/useEricaTopics';
import {
  EricaTopic,
  EricaTopicWithRelations,
  CreateEricaTopicDto,
  UpdateEricaTopicDto,
  EricaTopicsQuery,
} from '@/types/erica-topics.types';

interface EricaTopicsContextType {
  topics: EricaTopic[];
  currentTopic: EricaTopicWithRelations | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fetchTopics: (query?: EricaTopicsQuery) => Promise<void>;
  fetchTopicById: (id: number) => Promise<void>;
  createTopic: (data: CreateEricaTopicDto) => Promise<EricaTopic>;
  updateTopic: (id: number, data: UpdateEricaTopicDto) => Promise<EricaTopic>;
  deleteTopic: (id: number) => Promise<void>;
  fetchTopicsByTeacher: (teacherId: number) => Promise<void>;
  fetchTopicsBySection: (sectionId: number) => Promise<void>;
  fetchTopicsByWeek: (weekId: number) => Promise<void>;
  duplicateTopic: (id: number, newWeekId: number) => Promise<EricaTopic>;
  completeTopic: (id: number, completed: boolean) => Promise<EricaTopic>;
}

const EricaTopicsContext = createContext<EricaTopicsContextType | undefined>(undefined);

export function EricaTopicsProvider({ children }: { children: ReactNode }) {
  const ericaTopics = useEricaTopics();

  return (
    <EricaTopicsContext.Provider value={ericaTopics}>
      {children}
    </EricaTopicsContext.Provider>
  );
}

export function useEricaTopicsContext() {
  const context = useContext(EricaTopicsContext);
  if (context === undefined) {
    throw new Error('useEricaTopicsContext debe ser usado dentro de EricaTopicsProvider');
  }
  return context;
}
