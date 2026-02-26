'use client';

import { Trophy, TrendingUp, Award, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useMemo, useState } from 'react';

interface TopStudentsSectionProps {
  data: any;
}

export default function TopStudentsSection({ data }: TopStudentsSectionProps) {
  const [expandedStudents, setExpandedStudents] = useState<Set<number>>(new Set());

  const processedData = useMemo(() => {
    if (!data || !data.topStudents) return null;

    const excellenceColors: { [key: string]: string } = {
      excellent: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      veryGood: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      good: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    };

    return {
      topStudents: data.topStudents,
      section: data.section,
      bimester: data.bimester,
      summary: data.summary,
      excellenceColors,
    };
  }, [data]);

  if (!processedData) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Cargando estudiantes destacados...
      </div>
    );
  }

  const { topStudents, section, bimester, summary, excellenceColors } = processedData;

  const toggleStudent = (enrollmentId: number) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(enrollmentId)) {
      newExpanded.delete(enrollmentId);
    } else {
      newExpanded.add(enrollmentId);
    }
    setExpandedStudents(newExpanded);
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'ASCENDING' ? '↑' : trend === 'DESCENDING' ? '↓' : '→';
  };

  const getTrendColor = (trend: string) => {
    return trend === 'ASCENDING'
      ? 'text-green-600 dark:text-green-400'
      : trend === 'DESCENDING'
      ? 'text-red-600 dark:text-red-400'
      : 'text-slate-600 dark:text-slate-400';
  };

  const getExcellenceLabel = (score: number) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'veryGood';
    return 'good';
  };

  const getExcellenceText = (score: number) => {
    if (score >= 90) return 'Excelente';
    if (score >= 80) return 'Muy Bueno';
    return 'Bueno';
  };

  return (
    <Card className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <Trophy className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  Estudiantes Destacados
                </h2>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
                  {section?.grade} - Sección {section?.name} | {bimester?.name}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summary?.averageScoreOfTop10.toFixed(1)}
              </p>
              <p className="text-xs text-slate-500">Promedio Top 10</p>
            </div>
          </div>

          {/* Excellence Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 md:p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded border border-yellow-200 dark:border-yellow-900/30">
              <p className="text-xs text-slate-600 dark:text-slate-400">Excelente</p>
              <p className="text-lg md:text-xl font-bold text-yellow-700 dark:text-yellow-400">
                {summary?.excellenceGroups?.excellent || 0}
              </p>
            </div>
            <div className="p-2 md:p-3 bg-blue-50 dark:bg-blue-900/10 rounded border border-blue-200 dark:border-blue-900/30">
              <p className="text-xs text-slate-600 dark:text-slate-400">Muy Bueno</p>
              <p className="text-lg md:text-xl font-bold text-blue-700 dark:text-blue-400">
                {summary?.excellenceGroups?.veryGood || 0}
              </p>
            </div>
            <div className="p-2 md:p-3 bg-green-50 dark:bg-green-900/10 rounded border border-green-200 dark:border-green-900/30">
              <p className="text-xs text-slate-600 dark:text-slate-400">Bueno</p>
              <p className="text-lg md:text-xl font-bold text-green-700 dark:text-green-400">
                {summary?.excellenceGroups?.good || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-2">
          {topStudents.map((student: any, idx: number) => {
            const excellenceLabel = getExcellenceLabel(student.averageScore);
            const excellenceText = getExcellenceText(student.averageScore);
            const trendColor = getTrendColor(student.trend);
            const trendIcon = getTrendIcon(student.trend);
            const isExpanded = expandedStudents.has(student.enrollmentId);

            return (
              <div
                key={`${student.enrollmentId}-${idx}`}
                className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                {/* Main Row */}
                <button
                  onClick={() => toggleStudent(student.enrollmentId)}
                  className="w-full p-3 md:p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                    {/* Ranking Badge */}
                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm md:text-lg">
                        {student.ranking}
                      </span>
                    </div>

                    {/* Student Info */}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white truncate text-sm md:text-base">
                        {student.studentName.trim()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        ID: {student.codeSIRE}
                      </p>
                    </div>
                  </div>

                  {/* Score and Badge */}
                  <div className="flex-shrink-0 flex items-center gap-2 ml-2 md:ml-3">
                    <div className="text-right">
                      <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
                        {student.averageScore.toFixed(1)}
                      </p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${excellenceColors[excellenceLabel]}`}>
                        {excellenceText}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 md:w-5 md:h-5 text-slate-600 dark:text-slate-400 transition-transform flex-shrink-0 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-3 md:px-4 pb-3 md:pb-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    {/* Courses */}
                    {student.courses && student.courses.length > 0 ? (
                      <div className="space-y-3">
                        {student.courses.map((course: any, courseIdx: number) => (
                          <div key={courseIdx} className="text-xs md:text-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                                {course.courseName}
                              </span>
                              <span className="text-slate-900 dark:text-slate-100 font-semibold flex-shrink-0 ml-2">
                                {course.totalByComponent}/100
                              </span>
                            </div>
                            <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.min((course.totalByComponent / 100) * 100, 100)}%`,
                                }}
                              ></div>
                            </div>
                            {course.feedback && (
                              <p className="text-slate-600 dark:text-slate-400 mt-1.5 italic text-xs">
                                "{course.feedback}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 text-xs">
                        Sin cursos registrados
                      </p>
                    )}

                    {/* Trend and Stats */}
                    <div className="flex flex-wrap items-center justify-start gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-slate-500" />
                        <span className={`font-semibold ${trendColor}`}>
                          {trendIcon} {student.trend}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-yellow-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {student.scoreCount} curso{student.scoreCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
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
