import { FaSearch, FaTimes } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Slider } from '@/components/ui/slider';
import IconInput from '@/components/form/input/IconInput';
import type { DateRange } from "react-day-picker";
import { STATUS_OPTIONS } from '@/constants/rolesTable';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface FiltersProps {
  filterText: string;
  filterStatus: 'all' | 'active' | 'inactive';
  filterCreator: string;
  filterUserCount: [number, number];
  dateRange?: DateRange;
  itemsPerPage: number;
  onFilterTextChange: (text: string) => void;
  onFilterStatusChange: (status: 'all' | 'active' | 'inactive') => void;
  onFilterCreatorChange: (creator: string) => void;
  onFilterUserCountChange: (range: [number, number]) => void;
  onDateRangeChange: (range?: DateRange) => void;
  onResetFilters: () => void;
}

export default function Filters({
  filterText,
  filterStatus,
  filterCreator,
  filterUserCount,
  dateRange,
  onFilterTextChange,
  onFilterStatusChange,
  onFilterCreatorChange,
  onFilterUserCountChange,
  onDateRangeChange,
  onResetFilters,
}: FiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Filtros
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
          <IconInput
            icon={FaSearch}
            placeholder="Buscar por nombre o descripción"
            value={filterText}
            onChange={(e) => onFilterTextChange(e.target.value)}
            className="w-full"
          />

          {/* Filtro estado */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Estado</label>
            <Select
              value={filterStatus}
              onValueChange={(value) => onFilterStatusChange(value as 'all' | 'active' | 'inactive')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>


          {/* Filtro creador */}
          <IconInput
            icon={FaSearch}
            placeholder="Buscar por creador"
            value={filterCreator}
            onChange={(e) => onFilterCreatorChange(e.target.value)}
            className="w-full"
          />


          {/* Filtro por fechas */}
        {/*   <div className="w-full">
            <label className="block text-sm text-muted-foreground mb-1">Fecha de creación</label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {dateRange?.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, "dd/MM/yyyy")} – ${format(
                        dateRange.to,
                        "dd/MM/yyyy"
                      )}`
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    <span className="text-muted-foreground">Seleccionar rango de fechas</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={onDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div> */}

          {/* Rango de usuarios */}
          <div className="w-full">
            <label className="block text-sm text-muted-foreground mb-1">
              Usuarios: {filterUserCount[0]} – {filterUserCount[1]}
            </label>
            <Slider
              min={0}
              max={10}
              step={1}
              value={filterUserCount}
              onValueChange={(value) => onFilterUserCountChange(value as [number, number])}
            />
          </div>



          {/* Resto de los filtros... */}
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="flex items-center gap-2"
          >
            <FaTimes className="text-gray-500" />
            Limpiar filtros
          </Button>
        </div>





      </div>
    </div>
  );
}