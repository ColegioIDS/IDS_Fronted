// src/components/attendance/BulkAttendanceForm.tsx

'use client';

import { useState } from 'react';
import { useAttendance } from '@/hooks/useAttendance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface BulkRow {
  enrollmentId: number;
  date: string;
  statusCode: string;
  notes?: string;
}

const SAMPLE_CSV = `enrollmentId,date,statusCode,notes
1,2024-10-19,A,Presente
2,2024-10-19,I,Ausencia sin justificación
3,2024-10-19,TI,Llegó 15 minutos tarde`;

export default function BulkAttendanceForm() {
  const { bulkCreate, loading, bulkProgress, bulkError } = useAttendance();
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.trim().split('\n');

        // Saltar header
        const data = lines.slice(1).map((line) => {
          const [enrollmentId, date, statusCode, notes] = line.split(',');
          return {
            enrollmentId: parseInt(enrollmentId),
            date,
            statusCode,
            notes: notes?.trim(),
          };
        });

        setRows(data);
        setParseError(null);
        toast.success(`✅ ${data.length} registros cargados`);
      } catch (error) {
        setParseError('Error al procesar el archivo CSV');
        toast.error('Error al procesar el archivo');
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla-asistencia.csv';
    link.click();
  };

  const handleSubmit = async () => {
    if (rows.length === 0) {
      toast.error('Carga un archivo CSV primero');
      return;
    }

    try {
      await bulkCreate(
        rows.map((row) => ({
          enrollmentId: row.enrollmentId,
          date: new Date(row.date).toISOString(),
          statusCode: row.statusCode as 'A' | 'I' | 'IJ' | 'TI' | 'TJ',
          notes: row.notes,
        }))
      );

      toast.success(`✅ ${rows.length} registros creados`);
      setRows([]);
    } catch (error) {
      toast.error('❌ Error en la carga masiva');
    }
  };

  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setRows([]);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-dashed border-2 border-slate-300 dark:border-slate-600">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Upload className="h-12 w-12 text-slate-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Sube un archivo CSV
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                O arrastra y suelta aquí
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('csv-upload')?.click()}
              >
                Seleccionar archivo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar plantilla
              </Button>
            </div>

            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {parseError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{parseError}</AlertDescription>
        </Alert>
      )}

      {/* Data Preview */}
      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Vista previa
                <Badge variant="secondary" className="ml-2">
                  {rows.length}
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Limpiar todo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {rows.map((row, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Matrícula: {row.enrollmentId}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {new Date(row.date).toLocaleDateString('es-GT')} •{' '}
                      <Badge variant="outline" className="ml-1">
                        {row.statusCode}
                      </Badge>
                    </p>
                    {row.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {row.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRow(idx)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      {loading && bulkProgress.total > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Procesando...
                </p>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {bulkProgress.current} / {bulkProgress.total}
                </span>
              </div>
              <Progress value={(bulkProgress.current / bulkProgress.total) * 100} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Error */}
      {bulkError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{bulkError}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={loading || rows.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white h-10"
      >
        {loading ? (
          <>
            <LoadingSpinner className="mr-2" />
            Procesando {rows.length} registros...
          </>
        ) : (
          `✓ Procesar ${rows.length} registros`
        )}
      </Button>

      {/* Format Info */}
      <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm">Formato del CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-white dark:bg-slate-900 p-3 rounded overflow-x-auto border border-slate-200 dark:border-slate-700">
            <code>{SAMPLE_CSV}</code>
          </pre>
          <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <p>
              <strong>enrollmentId:</strong> ID de la matrícula del estudiante
            </p>
            <p>
              <strong>date:</strong> Fecha en formato YYYY-MM-DD
            </p>
            <p>
              <strong>statusCode:</strong> A, I, IJ, TI, o TJ
            </p>
            <p>
              <strong>notes:</strong> Notas opcionales
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}