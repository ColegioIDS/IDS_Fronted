'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, AlertCircle, CheckCircle2, Loader2, FileUp, BookOpen, Palette, ToggleRight, Hash, Type, Layers, Edit2, Save, X } from 'lucide-react';

interface CourseImportData {
  code: string;
  name: string;
  area?: string;
  color?: string;
  isActive: boolean;
}

interface ImportError {
  row: number;
  field: string;
  value: string;
  message: string;
}

interface ImportCoursesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (count: number) => void;
}

const VALID_AREAS = ['Académicas', 'Socioemocionales', 'Física', 'Artística', 'Tecnológicas'];

// Validar color en formato hex
const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

// Parsear valor booleano
const parseBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null || value === '') return true; // Default a true si está vacío
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1' || value === 'yes';
  }
  return !!value;
};

// Validar fila de datos
const validateCourseRow = (row: any, rowIndex: number): { data?: CourseImportData; error?: ImportError } => {
  // Code es requerido
  if (!row.code || String(row.code).trim() === '') {
    return {
      error: {
        row: rowIndex,
        field: 'code',
        value: '',
        message: 'El código es requerido',
      },
    };
  }

  const code = String(row.code).trim();
  if (code.length < 2 || code.length > 20) {
    return {
      error: {
        row: rowIndex,
        field: 'code',
        value: code,
        message: 'El código debe tener entre 2 y 20 caracteres',
      },
    };
  }

  // Name es requerido
  if (!row.name || String(row.name).trim() === '') {
    return {
      error: {
        row: rowIndex,
        field: 'name',
        value: '',
        message: 'El nombre es requerido',
      },
    };
  }

  const name = String(row.name).trim();
  if (name.length < 3 || name.length > 100) {
    return {
      error: {
        row: rowIndex,
        field: 'name',
        value: name,
        message: 'El nombre debe tener entre 3 y 100 caracteres',
      },
    };
  }

  // Área es opcional pero si se proporciona, debe ser válida
  let area: string | undefined = undefined;
  if (row.area && String(row.area).trim() !== '') {
    area = String(row.area).trim();
    if (!VALID_AREAS.includes(area)) {
      return {
        error: {
          row: rowIndex,
          field: 'area',
          value: area,
          message: `Área inválida. Valores válidos: ${VALID_AREAS.join(', ')}`,
        },
      };
    }
  }

  // Color es opcional pero si se proporciona, debe ser hex válido
  let color: string | undefined = undefined;
  if (row.color && String(row.color).trim() !== '') {
    color = String(row.color).trim();
    if (!isValidHexColor(color)) {
      return {
        error: {
          row: rowIndex,
          field: 'color',
          value: color,
          message: 'El color debe ser un hexadecimal válido (ej: #FF0000)',
        },
      };
    }
  }

  // isActive
  const isActive = parseBoolean(row.isActive);

  return {
    data: {
      code,
      name,
      area,
      color,
      isActive,
    },
  };
};

export function ImportCoursesDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportCoursesDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [importData, setImportData] = useState<CourseImportData[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [step, setStep] = useState<'upload' | 'review' | 'result'>('upload');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<CourseImportData | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setErrors([]);
      setImportData([]);

      // Validar extensión
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      const isCSV = file.name.endsWith('.csv');
      
      if (!isExcel && !isCSV) {
        toast.error('Archivo inválido. Solo se aceptan .xlsx, .xls o .csv');
        return;
      }

      let rows: any[] = [];

      if (isExcel) {
        // Procesar archivo Excel
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Obtener el nombre de las hojas
        const sheetNames = workbook.SheetNames;
        
        // Si hay 2 hojas, usar la segunda (índice 1 = datos)
        // Si hay 1 hoja, usarla directamente
        const dataSheetIndex = sheetNames.length > 1 ? 1 : 0;
        const worksheet = workbook.Sheets[sheetNames[dataSheetIndex]];
        
        if (!worksheet) {
          toast.error('No se pudo leer la hoja de datos del archivo');
          return;
        }
        
        // Convertir hoja a JSON
        rows = XLSX.utils.sheet_to_json(worksheet, { 
          defval: '',
          blankrows: false,
        });
      } else {
        // Procesar archivo CSV
        const fileContent = await file.text();
        const lines = fileContent.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast.error('El archivo debe contener al menos un encabezado y una fila de datos');
          return;
        }

        // Extraer encabezado
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Procesar filas
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const row: any = {};

          headers.forEach((header, idx) => {
            row[header] = values[idx] || '';
          });
          
          rows.push(row);
        }
      }

      // Validar que tenga las columnas requeridas
      if (rows.length === 0) {
        toast.error('El archivo no contiene datos');
        return;
      }

      const firstRow = rows[0];
      const hasRequiredColumns = 
        Object.keys(firstRow).some(k => k.toLowerCase() === 'code') &&
        Object.keys(firstRow).some(k => k.toLowerCase() === 'name');

      if (!hasRequiredColumns) {
        toast.error('El archivo debe incluir las columnas: code y name');
        return;
      }

      // Normalizar claves (hacer lowercase para consistencia)
      const normalizedRows = rows.map(row => {
        const normalized: any = {};
        Object.entries(row).forEach(([key, value]) => {
          normalized[key.toLowerCase()] = value;
        });
        return normalized;
      });

      // Procesar filas
      const validData: CourseImportData[] = [];
      const validationErrors: ImportError[] = [];

      for (let i = 0; i < normalizedRows.length; i++) {
        const validation = validateCourseRow(normalizedRows[i], i + 2); // +2: fila 1 es encabezado, i es 0-based
        if (validation.error) {
          validationErrors.push(validation.error);
        } else if (validation.data) {
          validData.push(validation.data);
        }
      }

      setImportData(validData);
      setErrors(validationErrors);

      if (validationErrors.length > 0) {
        toast.warning(`${validData.length} cursos válidos, ${validationErrors.length} con errores`);
      } else if (validData.length > 0) {
        toast.success(`${validData.length} cursos listos para importar`);
      }

      setStep('review');
    } catch (error: any) {
      toast.error(error.message || 'Error al leer el archivo');
      console.error('Import error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (importData.length === 0) {
      toast.error('No hay datos válidos para importar');
      return;
    }

    try {
      setIsLoading(true);

      // Preparar payload para backend
      const payload = {
        courses: importData.map(course => ({
          code: course.code,
          name: course.name,
          area: course.area || null,
          color: course.color || null,
          isActive: course.isActive,
        })),
      };

      // Enviar al backend usando axios con la URL base configurada
      const response = await axios.post(`${API_BASE_URL}/api/courses/bulk-import`, payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { success, data, message } = response.data;

      // Si hay errores parciales (importación con algunos errores)
      if (!success && data?.errors && Array.isArray(data.errors)) {
        // Mapear errores del backend al formato de ImportError
        const mappedErrors = data.errors.map((error: any, idx: number) => ({
          row: idx,
          field: error.field || 'general',
          value: error.code || error.name || '',
          message: error.message,
        }));
        
        setErrors(mappedErrors);
        setStep('review');
        
        // Mostrar toast con resumen
        toast.warning(
          `⚠️ Importación parcial: ${data.imported} cursos importados, ${data.failed} errores`
        );
        return;
      }

      // Si la importación fue exitosa
      if (success) {
        toast.success(`✅ ${importData.length} cursos importados correctamente`);
        setStep('result');
        onSuccess?.(importData.length);
        return;
      }

      // Error general sin detalles
      throw new Error(message || 'Error al importar los cursos');
    } catch (error: any) {
      const errorData = error.response?.data;
      
      // Manejar estructura de errores antigua (array de strings)
      if (errorData?.details && Array.isArray(errorData.details)) {
        setErrors(
          errorData.details.map((detail: string, idx: number) => ({
            row: idx,
            field: detail.split(':')[0] || 'general',
            value: detail,
            message: detail.split(': ')[1] || detail,
          }))
        );
        setStep('review');
        toast.error(`❌ ${errorData.details.length} errores de validación encontrados`);
      } else {
        const errorMessage = errorData?.message || error.message || 'Error al importar cursos';
        toast.error(errorMessage);
      }
      
      console.error('Import error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRow = (index: number) => {
    setEditingIndex(index);
    setEditingData({ ...importData[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingData) {
      const updated = [...importData];
      updated[editingIndex] = editingData;
      setImportData(updated);
      setEditingIndex(null);
      setEditingData(null);
      toast.success('Datos actualizados');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingData(null);
  };

  const handleClose = () => {
    setStep('upload');
    setImportData([]);
    setErrors([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-3xl overflow-y-auto max-h-[95vh] rounded-lg shadow-2xl flex flex-col">
        <DialogHeader className="border-b pb-4 px-6 pt-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="w-5 h-5 text-blue-600" />
            Importar Cursos desde Excel
          </DialogTitle>
          <DialogDescription>
            Carga un archivo Excel con los datos de cursos. La estructura debe incluir: code, name, area, color, isActive
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto h-full w-full scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-500 scrollbar-track-transparent">
          <div className="px-6 pb-6">
        {step === 'upload' && (
          <div className="space-y-4 py-6">
            {/* Template info */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-sm">Estructura esperada</h4>
                </div>
                <div className="text-sm space-y-2 font-mono mb-4 bg-white/50 dark:bg-gray-800/50 p-3 rounded">
                  <div>• <span className="text-blue-600 font-semibold">code</span> (requerido): DESTMAT0101</div>
                  <div>• <span className="text-blue-600 font-semibold">name</span> (requerido): Destrezas de matemática</div>
                  <div>• <span className="text-blue-600 font-semibold">area</span> (opcional): Académicas</div>
                  <div>• <span className="text-blue-600 font-semibold">color</span> (opcional): #F8BBD0</div>
                  <div>• <span className="text-blue-600 font-semibold">isActive</span> (opcional): TRUE/FALSE</div>
                </div>
                <div className="flex gap-2">
                  <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/70 px-3 py-2 rounded flex items-center gap-2 flex-1">
                    <FileUp className="w-4 h-4 flex-shrink-0" /> <strong>Excel (.xlsx, .xls) o CSV</strong>
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/70 px-3 py-2 rounded flex items-center gap-2 flex-1">
                    <Layers className="w-4 h-4 flex-shrink-0" /> <strong>Académicas, Socioemocionales, Física, Artística, Tecnológicas</strong>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Seleccionar archivo</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col w-full h-32 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20 transition">
                  <div className="flex flex-col items-center justify-center pt-7">
                    <Upload className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Arrastra aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      .xlsx, .xls o .csv
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4 py-6">
            {/* Errores */}
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-3 text-base">
                    ❌ {errors.length} {errors.length === 1 ? 'error encontrado' : 'errores encontrados'}
                  </div>
                  <ScrollArea className="h-56 rounded border p-3 bg-red-50 dark:bg-red-950/20 scrollbar-thin scrollbar-thumb-red-400 dark:scrollbar-thumb-red-500 scrollbar-track-transparent">
                    <div className="space-y-2 text-sm">
                      {errors.map((error, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-red-500">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="font-semibold text-red-900 dark:text-red-100">
                                {error.value ? `${error.value}` : 'Error general'}
                              </div>
                              <div className="text-red-800 dark:text-red-200 mt-1">
                                {error.message}
                              </div>
                              {error.field && (
                                <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                                  Campo: <span className="font-mono">{error.field}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </AlertDescription>
              </Alert>
            )}

            {/* Datos válidos */}
            {importData.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-700 dark:text-green-400">
                      {importData.length} cursos listos para importar
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">Haz clic para editar</span>
                </div>
                <ScrollArea className="h-96 rounded border p-3 bg-green-50 dark:bg-green-950/20 scrollbar-thin scrollbar-thumb-green-400 dark:scrollbar-thumb-green-500 scrollbar-track-transparent">
                  <div className="space-y-2">
                    {importData.map((course, i) => (
                      <div key={i} className="space-y-2">
                        {editingIndex === i ? (
                          <div className="p-3 bg-white dark:bg-gray-800 rounded border-2 border-blue-500 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-semibold mb-1 block">Code</label>
                                <Input
                                  type="text"
                                  value={editingData?.code || ''}
                                  onChange={(e) => setEditingData({ ...editingData!, code: e.target.value })}
                                  placeholder="Ej: PROD001"
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold mb-1 block">Name</label>
                                <Input
                                  type="text"
                                  value={editingData?.name || ''}
                                  onChange={(e) => setEditingData({ ...editingData!, name: e.target.value })}
                                  placeholder="Nombre del curso"
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold mb-1 block">Área</label>
                                <Select value={editingData?.area || 'sin-area'} onValueChange={(value) => setEditingData({ ...editingData!, area: value === 'sin-area' ? undefined : value })}>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Sin área" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="sin-area">Sin área</SelectItem>
                                    {VALID_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-xs font-semibold mb-1 block">Color</label>
                                <Input
                                  type="text"
                                  value={editingData?.color || ''}
                                  placeholder="#FF0000"
                                  onChange={(e) => setEditingData({ ...editingData!, color: e.target.value || undefined })}
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="text-xs font-semibold flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={editingData?.isActive || false}
                                    onChange={(e) => setEditingData({ ...editingData!, isActive: e.target.checked })}
                                  />
                                  Activo
                                </label>
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                <X className="w-3 h-3 mr-1" /> Cancelar
                              </Button>
                              <Button size="sm" onClick={handleSaveEdit}>
                                <Save className="w-3 h-3 mr-1" /> Guardar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleEditRow(i)}
                            className="flex items-center gap-3 text-sm p-3 rounded bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition border-b border-gray-200 dark:border-gray-700"
                          >
                            <div
                              className="w-5 h-5 rounded border-2"
                              style={{ backgroundColor: course.color || '#E5E7EB' }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-mono text-xs text-gray-500">{course.code}</div>
                              <div className="font-medium truncate">{course.name}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              {course.area && (
                                <Badge variant="outline" className="text-xs">
                                  {course.area}
                                </Badge>
                              )}
                              {!course.isActive && (
                                <Badge variant="secondary" className="text-xs">
                                  Inactivo
                                </Badge>
                              )}
                              {course.isActive && (
                                <Badge className="text-xs bg-green-100 text-green-800">
                                  Activo
                                </Badge>
                              )}
                              <Edit2 className="w-3 h-3 text-gray-400" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {importData.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No hay datos válidos para importar. Por favor, verifica el archivo y vuelve a intentarlo.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-4 py-6">
            <div className="flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">¡Importación preparada!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {importData.length} cursos están listos para ser guardados
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg text-left text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <strong>Datos a enviar al backend</strong>
              </div>
              <pre className="mt-2 text-xs overflow-auto max-h-48 bg-white dark:bg-gray-900 p-2 rounded border">
                {JSON.stringify(
                  {
                    courses: importData.map(c => ({
                      code: c.code,
                      name: c.name,
                      area: c.area || null,
                      color: c.color || null,
                      isActive: c.isActive,
                    })),
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}

        </div>
        </ScrollArea>

        <DialogFooter className="gap-2 border-t pt-4 px-6 pb-4 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cerrar
          </Button>
          {step === 'review' && importData.length > 0 && (
            <Button
              onClick={handleImport}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Importar {importData.length} Cursos
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
