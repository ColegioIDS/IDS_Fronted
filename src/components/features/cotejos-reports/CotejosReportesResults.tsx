import { CotejosStudentsFiltersResponse } from '@/types/cotejos.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CotejosReportesResultsProps {
  studentsData: CotejosStudentsFiltersResponse['data'];
}

export function CotejosReportesResults({ studentsData }: CotejosReportesResultsProps) {
  // Ordenar estudiantes alfabéticamente por nombre (A-Z)
  const sortedStudents = studentsData
    ? [...studentsData.students].sort((a: any, b: any) => {
        const nameA = `${a.student.givenNames} ${a.student.lastNames}`.toLowerCase();
        const nameB = `${b.student.givenNames} ${b.student.lastNames}`.toLowerCase();
        return nameA.localeCompare(nameB);
      })
    : [];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-b">
        <CardTitle className="text-xl font-bold">
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
            {studentsData.courseAssignment.course.name}
          </span>
        </CardTitle>
        <CardDescription className="mt-2 text-base">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total de estudiantes</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{studentsData.totalStudents}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Docente</p>
              <p className="font-semibold text-gray-700 dark:text-gray-300">{studentsData.courseAssignment.teacher.email}</p>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-600 border-b border-slate-200 dark:border-slate-600">
                <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider w-20">Clave</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">Nombre</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((enrollment: any, index: number) => (
                <tr 
                  key={enrollment.enrollmentId} 
                  className={`border-b transition-colors duration-150 ${
                    index % 2 === 0 
                      ? 'bg-white dark:bg-slate-900' 
                      : 'bg-slate-50 dark:bg-slate-800'
                  } hover:bg-blue-50 dark:hover:bg-slate-700`}
                >
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full font-semibold text-sm">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {enrollment.student.givenNames} {enrollment.student.lastNames}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
