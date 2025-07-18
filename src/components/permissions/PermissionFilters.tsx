// components/PermissionFilters.tsx
import { FaSearch, FaTimes } from 'react-icons/fa';
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";

interface FilterOptions {
  module: string;
  action: string;
  status: string;
  system: string;
  search: string;
}

interface UniqueValues {
  modules: string[];
  actions: string[];
}

interface PermissionFiltersProps {
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  uniqueValues: UniqueValues;
  resetFilters: () => void;
  groupBy: string;
  onGroupByChange: (value: string) => void;
}

export const PermissionFilters: React.FC<PermissionFiltersProps> = ({
  filters,
  setFilters,
  uniqueValues,
  resetFilters,
  groupBy,
  onGroupByChange
}) => (
  <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
    {/* Primera fila de filtros */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Select
        value={groupBy}
        onChange={onGroupByChange}
        options={[
          { value: 'none', label: 'Sin agrupación' },
          { value: 'module', label: 'Agrupar por módulo' },
          { value: 'status', label: 'Agrupar por estado' },
          { value: 'system', label: 'Agrupar por tipo' },
        ]}
      />



      <Select
        value={filters.module}
        onChange={(value) => setFilters({ ...filters, module: value })}
        options={[
          { value: 'all', label: 'Todos los módulos' },
          ...uniqueValues.modules.map(module => ({ value: module, label: module })),
        ]}
      />

      <Input
        icon={<FaSearch />}
        placeholder="Buscar permisos..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        className="pl-10"
      />


    </div>

    {/* Segunda fila de filtros */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Select
        value={filters.action}
        onChange={(value) => setFilters({ ...filters, action: value })}
        options={[
          { value: 'all', label: 'Todas las acciones' },
          ...uniqueValues.actions.map(action => ({ value: action, label: action })),
        ]}
      />
      <Select
        value={filters.status}
        onChange={(value) => setFilters({ ...filters, status: value })}
        options={[
          { value: 'all', label: 'Todos los estados' },
          { value: 'active', label: 'Activo' },
          { value: 'inactive', label: 'Inactivo' },
        ]}
      />

      <Select
        value={filters.system}
        onChange={(value) => setFilters({ ...filters, system: value })}
        options={[
          { value: 'all', label: 'Todos los tipos' },
          { value: 'system', label: 'Sistema' },
          { value: 'custom', label: 'Personalizado' },
        ]}
      />
      <div className="flex items-end">
        <Button
          variant="outline"
          className="w-full md:w-auto px-4" // Ajuste importante aquí
          onClick={resetFilters}
        >
          <FaTimes className="mr-2" />
          Limpiar Filtros
        </Button>
      </div>
    </div>
  </div>
);