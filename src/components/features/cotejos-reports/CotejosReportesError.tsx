import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CotejosError } from '@/utils/cotejos-error.utils';

interface CotejosReportesErrorProps {
  error: CotejosError;
}

export function CotejosReportesError({ error }: CotejosReportesErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}
