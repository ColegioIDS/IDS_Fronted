import { CotejosContent } from '@/components/features/cotejos';

/**
 * Página del módulo de Cotejos
 * Consolidación de calificaciones
 */
export default function CotejosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <CotejosContent />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Cotejos - IDS',
  description: 'Consolidación de calificaciones por estudiante y curso',
};
