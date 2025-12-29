import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ExportErrorProps {
  error: Error | string;
}

export function ExportError({ error }: ExportErrorProps) {
  const message = error instanceof Error ? error.message : error;
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
