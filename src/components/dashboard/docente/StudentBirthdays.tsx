'use client';

import { useMemo, useState } from 'react';
import { Cake, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

const monthOrder = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const monthNames: { [key: string]: string } = {
  'January': 'Enero',
  'February': 'Febrero',
  'March': 'Marzo',
  'April': 'Abril',
  'May': 'Mayo',
  'June': 'Junio',
  'July': 'Julio',
  'August': 'Agosto',
  'September': 'Septiembre',
  'October': 'Octubre',
  'November': 'Noviembre',
  'December': 'Diciembre',
};

interface StudentBirthdaysProps {
  data: any;
}

export default function StudentBirthdays({ data }: StudentBirthdaysProps) {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const processedData = useMemo(() => {
    console.log('StudentBirthdays component - data recibida:', data);
    if (!data || !data.birthdays) return null;
    return data;
  }, [data]);

  if (!processedData) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Cargando cumpleaños...
      </div>
    );
  }

  const { birthdays, section, summary } = processedData;

  const toggleMonth = (month: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(month)) {
      newExpanded.delete(month);
    } else {
      newExpanded.add(month);
    }
    setExpandedMonths(newExpanded);
  };

  // Filtrar meses con cumpleaños y ordenarlos
  const sortedMonths = Object.keys(birthdays)
    .filter(month => birthdays[month] && birthdays[month].length > 0)
    .sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));

  if (sortedMonths.length === 0) {
    return (
      <Card className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Cake className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Cumpleaños
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-4">
            {section?.grade} - Sección {section?.name}
          </p>
          <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400">
            No hay cumpleaños registrados
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Cake className="w-5 h-5 md:w-6 md:h-6 text-pink-500" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Cumpleaños
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-4">
            {section?.grade} - Sección {section?.name}
          </p>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 md:p-3 bg-pink-50 dark:bg-pink-900/10 rounded border border-pink-200 dark:border-pink-900/30">
              <p className="text-xs text-slate-600 dark:text-slate-400">Total</p>
              <p className="text-lg md:text-xl font-bold text-pink-700 dark:text-pink-400">
                {summary?.totalStudents || 0}
              </p>
            </div>
            <div className="p-2 md:p-3 bg-purple-50 dark:bg-purple-900/10 rounded border border-purple-200 dark:border-purple-900/30">
              <p className="text-xs text-slate-600 dark:text-slate-400">Con fecha</p>
              <p className="text-lg md:text-xl font-bold text-purple-700 dark:text-purple-400">
                {summary?.studentsWithBirthday || 0}
              </p>
            </div>
            <div className="p-2 md:p-3 bg-blue-50 dark:bg-blue-900/10 rounded border border-blue-200 dark:border-blue-900/30">
              <p className="text-xs text-slate-600 dark:text-slate-400">Próximos</p>
              <p className="text-lg md:text-xl font-bold text-blue-700 dark:text-blue-400">
                {sortedMonths.length}
              </p>
            </div>
          </div>
        </div>

        {/* Months List */}
        <div className="space-y-2">
          {sortedMonths.map((month: string) => {
            const students = birthdays[month] || [];
            const isExpanded = expandedMonths.has(month);
            const monthES = monthNames[month] || month;
            const studentCount = students.length;

            return (
              <div key={month} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                {/* Month Header */}
                <button
                  onClick={() => toggleMonth(month)}
                  className="w-full p-3 md:p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center">
                      <Cake className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm md:text-base">
                        {monthES}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {studentCount} cumpleaños
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <ChevronDown
                      className={`w-4 h-4 md:w-5 md:h-5 text-slate-600 dark:text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Students List */}
                {isExpanded && (
                  <div className="px-3 md:px-4 pb-3 md:pb-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    {students.map((student: any, idx: number) => {
                      const isToday = student.daysUntilBirthday === 0;
                      const isSoon = student.daysUntilBirthday > 0 && student.daysUntilBirthday <= 7;
                      const daysText =
                        student.daysUntilBirthday === 0
                          ? '¡Hoy!'
                          : student.daysUntilBirthday === 1
                          ? 'Mañana'
                          : `En ${student.daysUntilBirthday} días`;

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border transition ${
                            isToday
                              ? 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800'
                              : isSoon
                              ? 'bg-pink-100 dark:bg-pink-900/20 border-pink-300 dark:border-pink-800'
                              : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                {student.studentName}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {student.day} de {student.monthES} • {student.codeSIRE}
                              </p>
                            </div>

                            <div className="flex-shrink-0 text-right">
                              <p
                                className={`text-sm md:text-base font-bold ${
                                  isToday
                                    ? 'text-yellow-700 dark:text-yellow-300'
                                    : isSoon
                                    ? 'text-pink-700 dark:text-pink-300'
                                    : 'text-slate-900 dark:text-slate-100'
                                }`}
                              >
                                {student.age}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">años</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-600/50">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded ${
                                isToday
                                  ? 'bg-yellow-300 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100'
                                  : isSoon
                                  ? 'bg-pink-300 dark:bg-pink-700 text-pink-900 dark:text-pink-100'
                                  : 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              {daysText}
                            </span>
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {student.daysUntilBirthday > 0 && `${student.daysUntilBirthday} días`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
