'use client';

import React, { useState } from 'react';
import { Calendar, ChevronDown, Loader, Clock, Grid3X3 } from 'lucide-react';
import { useScheduleWeekly, useScheduleGrid } from '@/hooks/useDashboardClasses';
import { ScheduleWeeklyClass } from '@/types/dashboard.types';

type ViewMode = 'weekly' | 'grid';

export default function ScheduleView() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  
  const { schedule: weeklySchedule, isLoading: weeklyLoading, error: weeklyError } = useScheduleWeekly();
  const { schedule: gridSchedule, isLoading: gridLoading, error: gridError } = useScheduleGrid();

  const isLoading = viewMode === 'weekly' ? weeklyLoading : gridLoading;
  const error = viewMode === 'weekly' ? weeklyError : gridError;
  const schedule = viewMode === 'weekly' ? weeklySchedule : gridSchedule;

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 col-span-full">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">Error al cargar el horario</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 col-span-full overflow-hidden">
      {/* Header - Acordeón Principal */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent hover:from-blue-100 dark:hover:from-blue-900/30 transition-colors border-b border-slate-200 dark:border-slate-700"
      >
        <div className="flex items-center justify-between flex-1">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mi Horario</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Total: {schedule?.totalSchedules || 0} clases esta semana
              </p>
            </div>
          </div>
        </div>
        <ChevronDown
          className={`w-6 h-6 text-slate-600 dark:text-slate-400 transition-transform duration-200 flex-shrink-0 ml-4 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Content - Expandible */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Cargando horario...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Selector de Vista */}
              <div className="flex gap-2 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg inline-flex">
                <button
                  onClick={() => {
                    setViewMode('weekly');
                    setExpandedDay(null);
                  }}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center gap-2 ${
                    viewMode === 'weekly'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Semanal
                </button>
                <button
                  onClick={() => {
                    setViewMode('grid');
                    setExpandedDay(null);
                  }}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center gap-2 ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  Tabla
                </button>
              </div>

              {/* Content */}
              {viewMode === 'weekly' && weeklySchedule && (
                <WeeklyView schedule={weeklySchedule} expandedDay={expandedDay} setExpandedDay={setExpandedDay} />
              )}
              {viewMode === 'grid' && gridSchedule && (
                <GridView schedule={gridSchedule} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Componente para un día desplegable en el acordeón
 */
function DayAccordion({ day, isExpanded, onToggle }: { day: any; isExpanded: boolean; onToggle: () => void }) {
  // Usar "items" o "classes" según la estructura
  const dayItems = day.items || day.classes || [];
  const itemCount = dayItems.length;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent hover:from-blue-100 dark:hover:from-blue-900/30 transition-colors"
      >
        <div className="flex items-center gap-4 text-left flex-1">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{day.dayName}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {itemCount} item{itemCount !== 1 ? 's' : ''} programado{itemCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/20 p-4">
          {dayItems && dayItems.length > 0 ? (
            <div className="space-y-3">
              {dayItems.map((classItem: ScheduleWeeklyClass, idx: number) => (
                <ClassItem key={idx} classItem={classItem} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400">
              Sin clases programadas este día
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Vista Semanal con Acordeón por Día
 */
function WeeklyView({
  schedule,
  expandedDay,
  setExpandedDay,
}: {
  schedule: any;
  expandedDay: number | null;
  setExpandedDay: (day: number | null) => void;
}) {
  if (!schedule.weeklySchedule || schedule.weeklySchedule.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No hay clases programadas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {schedule.weeklySchedule.map((day: any) => (
        <DayAccordion
          key={day.dayCode}
          day={day}
          isExpanded={expandedDay === day.dayCode}
          onToggle={() => setExpandedDay(expandedDay === day.dayCode ? null : day.dayCode)}
        />
      ))}
    </div>
  );
}

/**
 * Vista de Tabla matriz bidimensional
 */
function GridView({ schedule }: { schedule: any }) {
  if (!schedule.uniqueTimes || schedule.uniqueTimes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 dark:text-slate-400">No hay horarios disponibles</p>
      </div>
    );
  }

  // Helper para convertir hex a RGB con transparencia
  const getColorStyle = (courseColor: string | undefined, isBreak: boolean) => {
    if (!courseColor || isBreak) return {};
    const r = parseInt(courseColor.slice(1, 3), 16);
    const g = parseInt(courseColor.slice(3, 5), 16);
    const b = parseInt(courseColor.slice(5, 7), 16);
    return {
      backgroundColor: `rgba(${r},${g},${b},0.3)`,
    };
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {/* Header */}
        <thead>
          <tr>
            <th className="border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 p-3 text-left font-semibold text-slate-800 dark:text-white w-16 sticky left-0 z-10">
              Hora
            </th>
            {schedule.daysOfWeek.map((day: any) => (
              <th
                key={day.dayCode}
                className="border border-slate-300 dark:border-slate-600 bg-blue-50 dark:bg-blue-900/30 p-3 text-center font-semibold text-slate-800 dark:text-white min-w-48"
              >
                <div>{day.dayName}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-normal">Día {day.dayCode}</div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {schedule.uniqueTimes.map((time: string) => (
            <tr key={time}>
              <td className="border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 p-3 font-medium text-slate-800 dark:text-white sticky left-0 z-10">
                {time}
              </td>
              {schedule.daysOfWeek.map((day: any) => {
                const dayData = schedule.grid[day.dayCode] || {};
                const classes = dayData[time] || [];
                return (
                  <td
                    key={`${day.dayCode}-${time}`}
                    className="border border-slate-300 dark:border-slate-600 p-2 align-top"
                  >
                    {classes.length > 0 ? (
                      <div className="space-y-2">
                        {classes.map((classItem: any, idx: number) => {
                          const isBreak = classItem.type === 'break';
                          return (
                            <div
                              key={idx}
                              style={getColorStyle(classItem.courseColor, isBreak)}
                              className={`${
                                isBreak
                                  ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
                                  : 'border-slate-300 dark:border-slate-600'
                              } border rounded p-2 text-xs`}
                            >
                              {isBreak ? (
                                <div>
                                  <div className="font-semibold text-amber-700 dark:text-amber-400 uppercase">
                                    {classItem.label}
                                  </div>
                                  <div className="text-amber-600 dark:text-amber-300 text-xs mt-1">
                                    {classItem.startTime} - {classItem.endTime}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="font-semibold text-slate-800 dark:text-white">
                                    {classItem.courseName}
                                  </div>
                                  <div className="text-slate-600 dark:text-slate-300">
                                    {classItem.sectionName} - {classItem.gradeName}
                                  </div>
                                  {classItem.courseCode && (
                                    <div className="text-slate-500 dark:text-slate-400 mt-1 text-xs">
                                      {classItem.courseCode}
                                    </div>
                                  )}
                                  {classItem.classroom && classItem.classroom !== 'N/A' && (
                                    <div className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {classItem.classroom}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-slate-300 dark:text-slate-600 text-center py-6">-</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Componente para mostrar una clase individual
 */
function ClassItem({ classItem }: { classItem: ScheduleWeeklyClass }) {
  const isBreak = classItem.type === 'break';
  
  // Convertir color hexadecimal a RGB con 30% de opacidad
  const getBackgroundColor = () => {
    if (!classItem.courseColor || isBreak) return 'bg-gray-100 dark:bg-gray-700';
    const color = classItem.courseColor;
    // Convertir hex a rgb con 30% opacidad
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `bg-[rgba(${r},${g},${b},0.3)] dark:bg-[rgba(${r},${g},${b},0.2)]`;
  };

  return (
    <div className={`${getBackgroundColor()} rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow`}>
      {isBreak ? (
        // Break Item
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/50 rounded-lg px-3 py-2 text-center">
            <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {classItem.startTime}
            </div>
            <div className="text-xs text-amber-500 dark:text-amber-300">
              a {classItem.endTime}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white uppercase text-sm">
              {classItem.label}
            </h4>
          </div>
        </div>
      ) : (
        // Course Item
        <div className="flex items-start gap-4">
          {/* Time Badge */}
          <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/50 rounded-lg px-3 py-2 text-center min-w-fit">
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {classItem.startTime}
            </div>
            <div className="text-xs text-blue-500 dark:text-blue-300">
              a {classItem.endTime}
            </div>
          </div>

          {/* Course Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-slate-900 dark:text-white">
                {classItem.courseName}
              </h4>
              {classItem.courseCode && (
                <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                  {classItem.courseCode}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 text-sm">
              {classItem.sectionName && (
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">
                  Sección {classItem.sectionName}
                </span>
              )}
              {classItem.gradeName && (
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">
                  {classItem.gradeName}
                </span>
              )}
              {classItem.classroom && classItem.classroom !== 'N/A' && (
                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {classItem.classroom}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
