// src\app\(admin)\students\profile\[id]\page.tsx
"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SchoolCycleProvider } from '@/context/SchoolCycleContext';
import { GradeProvider } from '@/context/GradeContext';
import { SectionProvider } from '@/context/SectionsContext';
import { StudentProvider } from '@/context/StudentContext';
import StudentProfile from '@/components/students/StudentProfile';
import { useParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// Crear cliente específico para esta página
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos (datos de estudiantes son relativamente estables)
      refetchOnWindowFocus: true,
      refetchInterval: 10 * 60 * 1000, // Refrescar cada 10 minutos
    },
  },
});

// Componente wrapper que obtiene el ID y renderiza el perfil
function StudentProfileWrapper() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id;

  // Validar que tenemos un ID válido
  if (!studentId || Array.isArray(studentId)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <p className="text-lg font-medium text-destructive">
            ID de estudiante inválido
          </p>
          <Button 
            variant="outline"
            onClick={() => router.push('/students')}
          >
            Volver a estudiantes
          </Button>
        </div>
      </div>
    );
  }

  const numericStudentId = parseInt(studentId, 10);
  
  if (isNaN(numericStudentId)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <p className="text-lg font-medium text-destructive">
            ID de estudiante debe ser un número válido
          </p>
          <Button 
            variant="outline"
            onClick={() => router.push('/students')}
          >
            Volver a estudiantes
          </Button>
        </div>
      </div>
    );
  }

  return <StudentProfile studentId={numericStudentId} />;
}

export default function StudentsProfilePageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <SchoolCycleProvider>
        <GradeProvider>
          <SectionProvider>
            <StudentProvider>
              <StudentProfileWrapper />
            </StudentProvider>
          </SectionProvider>
        </GradeProvider>
      </SchoolCycleProvider>
    </QueryClientProvider>
  );
}