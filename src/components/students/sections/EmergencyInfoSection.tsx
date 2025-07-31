import { useFormContext } from 'react-hook-form';
import { AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export function EmergencyInfoSection() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <Separator className="bg-gray-200 dark:bg-gray-700" />

     
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Información de Emergencia
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Datos de la persona a contactar en caso de emergencia
          </p>
     

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={control}
              name="emergencyContacts.0.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombres completos</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: María González"
                      {...field}
                      className="dark:bg-gray-900 dark:border-gray-700 focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="emergencyContacts.0.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: 555-1234567"
                      {...field}
                      value={field.value || ''}
                      className="dark:bg-gray-900 dark:border-gray-700 focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="emergencyContacts.0.relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parentesco</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Madre, Esposo, etc."
                      {...field}
                      value={field.value || ''}
                      className="dark:bg-gray-900 dark:border-gray-700 focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
      
    </div>
  );
}
