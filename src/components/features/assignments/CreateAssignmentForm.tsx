/**
 * Componente CreateAssignmentForm
 * Formulario para crear una nueva tarea
 */

'use client';

import { FC, useState, useEffect } from 'react';
import { assignmentsService } from '@/services/assignments.service';
import { formatDateForAPI, isValidDate } from '@/config/date-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface CreateAssignmentFormProps {
  cascadeData: {
    gradeId: number;
    sectionId: number;
    courseId: number;
    bimesterId: number;
    gradeName: string;
    sectionName: string;
    courseName: string;
    bimesterName: string;
  };
  onSuccess?: () => void;
  onBack?: () => void;
  totalExistingScore?: number;
  remainingPoints?: number;
}

export const CreateAssignmentForm: FC<CreateAssignmentFormProps> = ({
  cascadeData,
  onSuccess,
  onBack,
  totalExistingScore = 0,
  remainingPoints = 20,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // Una semana desde hoy
    maxScore: 5,
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // Validaciones
      if (!formData.title.trim()) {
        const msg = 'El título es requerido';
        toast.error(msg);
        throw new Error(msg);
      }
      if (!formData.dueDate) {
        const msg = 'La fecha de entrega es requerida';
        toast.error(msg);
        throw new Error(msg);
      }
      if (formData.maxScore <= 0) {
        const msg = 'La puntuación máxima debe ser mayor a 0';
        toast.error(msg);
        throw new Error(msg);
      }

      // Validar límite de 20 puntos
      const totalScore = totalExistingScore + formData.maxScore;
      const MAX_POINTS = 20;
      if (totalScore > MAX_POINTS) {
        const msg = `La puntuación total (${totalScore} pts) excede el límite de ${MAX_POINTS} puntos. Puntos disponibles: ${remainingPoints} pts`;
        toast.error(msg);
        throw new Error(msg);
      }

      // Crear tarea
      const assignmentPayload = {
        title: formData.title,
        description: formData.description,
        courseId: cascadeData.courseId,
        bimesterId: cascadeData.bimesterId,
        dueDate: formData.dueDate,
        maxScore: formData.maxScore,
      };

      console.log('📤 Enviando payload:', assignmentPayload);
      const result = await assignmentsService.createAssignment(assignmentPayload);
      console.log('✅ Respuesta del servidor:', result);

      toast.success('Tarea creada exitosamente');
      setSuccess(true);

      // Resetear form
      setFormData({
        title: '',
        description: '',
        dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        maxScore: 100,
      });

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear la tarea';
      setError(errorMsg);
      if (!error) {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
      {/* CONTEXTO SELECCIONADO */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">Contexto de la Tarea</h3>
        <dl className="space-y-1 text-xs">
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">Grado:</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{cascadeData.gradeName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">Sección:</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{cascadeData.sectionName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">Curso:</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{cascadeData.courseName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">Bimestre:</dt>
            <dd className="font-medium text-gray-900 dark:text-gray-100">{cascadeData.bimesterName}</dd>
          </div>
        </dl>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* SUCCESS ALERT */}
      {success && (
        <Alert className="mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-100">
            Tarea creada exitosamente. Redireccionando...
          </AlertDescription>
        </Alert>
      )}

      {/* TÍTULO */}
      <div className="mb-5">
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Título<span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          type="text"
          placeholder="Ej: Evaluación de Capítulo 3"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          disabled={loading}
          className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        />
      </div>

      {/* DESCRIPCIÓN */}
      <div className="mb-5">
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Descripción
        </label>
        <Textarea
          id="description"
          placeholder="Detalles de la tarea (opcional)"
          rows={3}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          disabled={loading}
          className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        />
      </div>

      {/* FECHA Y PUNTAJE EN GRID */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* FECHA DE ENTREGA */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Fecha Entrega<span className="text-red-500">*</span>
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                disabled={loading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(formData.dueDate, 'dd/MM/yyyy', { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700"
              align="start"
            >
              <Calendar
                mode="single"
                selected={formData.dueDate}
                onSelect={(date) => date && handleChange('dueDate', date)}
                disabled={loading}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* PUNTAJE MÁXIMO */}
        <div>
          <label htmlFor="maxScore" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Puntaje Máx<span className="text-red-500">*</span>
          </label>
          <Input
            id="maxScore"
            type="number"
            min="1"
            max="20"
            value={formData.maxScore || ''}
            onChange={(e) => {
              const val = e.target.value;
              handleChange('maxScore', val === '' ? 0 : Math.min(parseFloat(val), 20));
            }}
            disabled={loading}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          />
        </div>
      </div>

      {/* NOTA INFORMATIVA SOBRE LÍMITE DE PUNTOS */}
      <div className={`mb-6 p-4 rounded-lg border transition-all ${
        remainingPoints === 0 
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40'
          : remainingPoints < formData.maxScore
          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/40'
          : 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800/40'
      }`}>
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className={`w-4 h-4 mt-0.5 ${
              remainingPoints === 0 
                ? 'text-red-600 dark:text-red-400'
                : remainingPoints < formData.maxScore
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-blue-600 dark:text-blue-400'
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className={`text-xs font-semibold ${
                remainingPoints === 0 
                  ? 'text-red-900 dark:text-red-100'
                  : remainingPoints < formData.maxScore
                  ? 'text-yellow-900 dark:text-yellow-100'
                  : 'text-blue-900 dark:text-blue-100'
              }`}>
                Límite de Puntuación
              </p>
              <div className="flex items-center gap-1 text-xs">
                <span className={`font-bold ${
                  remainingPoints === 0 
                    ? 'text-red-700 dark:text-red-300'
                    : remainingPoints < formData.maxScore
                    ? 'text-yellow-700 dark:text-yellow-300'
                    : 'text-blue-700 dark:text-blue-300'
                }`}>
                  {totalExistingScore}/20 pts usados
                </span>
              </div>
            </div>
            <p className={`text-xs ${
              remainingPoints === 0 
                ? 'text-red-800 dark:text-red-200'
                : remainingPoints < formData.maxScore
                ? 'text-yellow-800 dark:text-yellow-200'
                : 'text-blue-800 dark:text-blue-200'
            }`}>
              {remainingPoints === 0 
                ? '❌ No hay puntos disponibles. Máximo 20 puntos por bimestre.'
                : `Puntos disponibles: ${remainingPoints} pts. La puntuación nueva será ${totalExistingScore + formData.maxScore}/20 pts.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Atrás
        </Button>
        <Button
          type="submit"
          disabled={loading || !formData.title.trim()}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            'Crear Tarea'
          )}
        </Button>
      </div>
    </form>
  );
};
