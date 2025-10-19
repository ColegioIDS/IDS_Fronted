// src/components/attendance/AttendanceTable.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAttendance } from '@/hooks/useAttendance';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronDown,
  Trash2,
  Eye,
  Edit,
  Download,
  MoreVertical,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const STATUS_CONFIG: Record<string, { label: string; bgColor: string; textColor: string; dotColor: string }> = {
  A: {
    label: 'Presente',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-700 dark:text-green-300',
    dotColor: 'bg-green-500',
  },
  I: {
    label: 'Ausente',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-700 dark:text-red-300',
    dotColor: 'bg-red-500',
  },
  IJ: {
    label: 'Ausente Justificado',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-300',
    dotColor: 'bg-blue-500',
  },
  TI: {
    label: 'Tardanza',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    dotColor: 'bg-yellow-500',
  },
  TJ: {
    label: 'Tardanza Justificada',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    textColor: 'text-orange-700 dark:text-orange-300',
    dotColor: 'bg-orange-500',
  },
};

interface AttendanceRecord {
  id: number;
  enrollmentId: number;
  date: string;
  statusCode: string;
  notes?: string;
  arrivalTime?: string;
}

export default function AttendanceTable() {
  const { attendanceList, loading, bulkDelete } = useAttendance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);

  // Mock data - Reemplaza con datos reales del hook
  const mockData: AttendanceRecord[] = [
    {
      id: 1,
      enrollmentId: 1,
      date: '2024-10-19',
      statusCode: 'A',
      notes: 'Presente en clase',
      arrivalTime: '08:00',
    },
    {
      id: 2,
      enrollmentId: 2,
      date: '2024-10-19',
      statusCode: 'I',
      notes: 'Ausencia sin justificación',
    },
    {
      id: 3,
      enrollmentId: 3,
      date: '2024-10-19',
      statusCode: 'TI',
      notes: 'Llegó 15 minutos tarde',
      arrivalTime: '08:15',
    },
  ];

  const data = attendanceList.length > 0 ? attendanceList : mockData;

  useEffect(() => {
    const filtered = data.filter(
      (record) =>
        record.id.toString().includes(searchTerm) ||
        record.enrollmentId.toString().includes(searchTerm) ||
        record.statusCode.includes(searchTerm.toUpperCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map((record) => record.id));
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('Selecciona al menos un registro');
      return;
    }

    try {
      await bulkDelete(selectedIds);
      toast.success(`✅ ${selectedIds.length} registro(s) eliminado(s)`);
      setSelectedIds([]);
    } catch (error) {
      toast.error('❌ Error al eliminar registros');
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Matrícula', 'Fecha', 'Estado', 'Hora', 'Notas'],
      ...filteredData.map((record) => [
        record.id,
        record.enrollmentId,
        record.date,
        STATUS_CONFIG[record.statusCode].label,
        record.arrivalTime || '-',
        record.notes || '-',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asistencia-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por ID, matrícula o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          />
        </div>

        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar ({selectedIds.length})
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">
            Registros de Asistencia
            <Badge variant="secondary" className="ml-2">
              {filteredData.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-700 hover:bg-transparent">
                    <TableHead className="w-12">
                      <Checkbox
  checked={selectedIds.length === filteredData.length && filteredData.length > 0}
  onCheckedChange={handleSelectAll}
/>
                    </TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-400">ID</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-400">Matrícula</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-400">Fecha</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-400">Estado</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-400">Hora</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-400">Notas</TableHead>
                    <TableHead className="text-right text-slate-600 dark:text-slate-400">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="text-slate-500 dark:text-slate-400">
                          No hay registros de asistencia
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((record) => {
                      const config = STATUS_CONFIG[record.statusCode];
                      return (
                        <TableRow
                          key={record.id}
                          className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.includes(record.id)}
                              onCheckedChange={() => handleSelectRow(record.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                            {record.id}
                          </TableCell>
                          <TableCell className="text-slate-700 dark:text-slate-300">
                            {record.enrollmentId}
                          </TableCell>
                          <TableCell className="text-slate-700 dark:text-slate-300">
                            {new Date(record.date).toLocaleDateString('es-GT', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${config.bgColor} ${config.textColor} border-0 flex items-center gap-1 w-fit`}
                            >
                              <span className={`h-2 w-2 rounded-full ${config.dotColor}`}></span>
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-700 dark:text-slate-300">
                            {record.arrivalTime || '-'}
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400 max-w-xs truncate">
                            {record.notes || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                              >
                                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
                                  <Eye className="h-4 w-4" />
                                  Ver detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
                                  <Edit className="h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                                  onClick={() => {
                                    handleSelectRow(record.id);
                                    setSelectedIds([record.id]);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}