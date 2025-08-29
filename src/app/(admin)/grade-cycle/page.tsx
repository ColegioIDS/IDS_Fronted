//src\app\(admin)\grade-cycle\page.tsx
"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SchoolCycleProvider } from '@/context/SchoolCycleContext';
import { GradeCycleProvider } from '@/context/GradeCycleContext';
import GradeCycleContent from '@/components/grade-cycle/grade-cycle-content';
import { GradeProvider } from '@/context/GradeContext';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 3 * 60 * 1000,
            refetchOnWindowFocus: true,
            refetchInterval: 5 * 60 * 1000,
        },
    },
});

export default function CyclePageWrapper() {
    return (
        <QueryClientProvider client={queryClient}>
            <SchoolCycleProvider>
                <GradeProvider>
                    <GradeCycleProvider>
                        <GradeCycleContent />

                    </GradeCycleProvider>
                </GradeProvider>
            </SchoolCycleProvider>
        </QueryClientProvider>
    );
}