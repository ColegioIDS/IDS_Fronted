// src/components/attendance/components/attendance-states/HolidayNotice.tsx
"use client";

import { Calendar, Clock, ArrowLeft, ArrowRight, Home, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Holiday {
  id: number;
  date: Date | string;
  description: string;
  isRecovered: boolean;
}

interface HolidayNoticeProps {
  holiday: Holiday;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onGoHome?: () => void;
}

export default function HolidayNotice({ 
  holiday, 
  selectedDate, 
  onDateChange,
  onGoHome 
}: HolidayNoticeProps) {

  // 📅 Funciones de navegación
  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    onDateChange(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  // 🎨 Determinar estilo según tipo de día festivo
  const getHolidayStyle = () => {
    if (holiday.isRecovered) {
      return {
        bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10",
        borderColor: "border-yellow-200 dark:border-yellow-800",
        iconColor: "text-yellow-600 dark:text-yellow-400",
        textColor: "text-yellow-800 dark:text-yellow-200",
        badgeColor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
      };
    }
    
    return {
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10",
      borderColor: "border-blue-200 dark:border-blue-800",
      iconColor: "text-blue-600 dark:text-blue-400",
      textColor: "text-blue-800 dark:text-blue-200",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
    };
  };

  const style = getHolidayStyle();

  return (
    <div className="space-y-6">
      {/* 🎉 Card principal del día festivo */}
      <Card className={`${style.bgColor} ${style.borderColor} border-2`}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className={`p-4 ${style.badgeColor} rounded-full`}>
              <Calendar className={`h-12 w-12 ${style.iconColor}`} />
            </div>
          </div>
          
          <CardTitle className={`text-2xl font-bold ${style.textColor}`}>
            {holiday.isRecovered ? 'Día de Recuperación' : 'Día Festivo'}
          </CardTitle>
          
          <div className="space-y-2">
            <h2 className={`text-xl ${style.textColor}`}>
              {holiday.description}
            </h2>
            
            <div className="flex justify-center items-center space-x-2">
              <Clock className={`h-4 w-4 ${style.iconColor}`} />
              <span className={`text-sm ${style.textColor}`}>
                {selectedDate.toLocaleDateString('es-GT', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ℹ️ Información del día festivo */}
          <Alert className={`${style.bgColor} ${style.borderColor}`}>
            <Info className={`h-4 w-4 ${style.iconColor}`} />
            <AlertDescription className={style.textColor}>
              {holiday.isRecovered ? (
                <>
                  <strong>Día de recuperación:</strong> Se desarrollarán clases normalmente para compensar días perdidos anteriormente. 
                  El control de asistencia está habilitado.
                </>
              ) : (
                <>
                  <strong>Día festivo:</strong> No hay clases programadas. 
                  El control de asistencia está deshabilitado para esta fecha.
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* 📊 Información adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border ${style.borderColor}`}>
              <h3 className={`font-medium ${style.textColor} mb-2`}>
                📅 Tipo de día
              </h3>
              <Badge className={style.badgeColor}>
                {holiday.isRecovered ? 'Día de Recuperación' : 'Día Festivo'}
              </Badge>
            </div>

            <div className={`p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border ${style.borderColor}`}>
              <h3 className={`font-medium ${style.textColor} mb-2`}>
                Clases
              </h3>
              <Badge variant={holiday.isRecovered ? "default" : "secondary"}>
                {holiday.isRecovered ? 'Clases Normales' : 'Sin Clases'}
              </Badge>
            </div>
          </div>

          {/* 🎯 Acciones disponibles */}
          <div className="space-y-4">
            <h3 className={`font-medium ${style.textColor} text-center`}>
              ¿Qué deseas hacer?
            </h3>
            
            <div className="flex flex-col md:flex-row gap-3 justify-center">
              {/* ⬅️ Día anterior */}
              <Button 
                variant="outline" 
                onClick={goToPreviousDay}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Día Anterior</span>
              </Button>

              {/* 📅 Hoy */}
              <Button 
                variant="default" 
                onClick={goToToday}
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Ir a Hoy</span>
              </Button>

              {/* ➡️ Día siguiente */}
              <Button 
                variant="outline" 
                onClick={goToNextDay}
                className="flex items-center space-x-2"
              >
                <span>Día Siguiente</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* 🏠 Botón para volver al inicio (opcional) */}
            {onGoHome && (
              <div className="flex justify-center pt-2">
                <Button 
                  variant="ghost" 
                  onClick={onGoHome}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400"
                >
                  <Home className="h-4 w-4" />
                  <span>Volver al Inicio</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 📝 Nota adicional para días de recuperación */}
      {holiday.isRecovered && (
        <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                  📚 Información sobre Días de Recuperación
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Los días de recuperación se utilizan para compensar clases perdidas debido a días festivos o eventos especiales. 
                  Durante estos días se desarrollan clases normalmente y se toma asistencia regular.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Elemento decorativo */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 text-gray-400 dark:text-gray-600">
          <div className="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
          <span className="text-xs">
            {holiday.isRecovered ? '—' : '•'}
          </span>
          <div className="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
        </div>
      </div>
    </div>
  );
}