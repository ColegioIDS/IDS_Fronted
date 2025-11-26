import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function ErrorAlert({ title, message, details }: {
  title?: string;
  message: string;
  details?: string[];
}) {
  return (
    <Alert variant="destructive" className="border-red-700 dark:border-red-900">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle>{title || 'Error'}</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        {details && (
          <ul className="mt-2 list-disc list-inside text-sm opacity-90">
            {details.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}
