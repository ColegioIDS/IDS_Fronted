import { useState, useMemo, useCallback } from 'react';
import type { RoleTableRow as Role, SortConfig, Permission, CreatedBy } from '@/types/role';

import { DateRange  } from 'react-day-picker';

interface UseRolesTableReturn {
  // Estados
  sortConfig: SortConfig | null;
  paginatedData: Role[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  selectedRole: Role | null;
  isModalOpen: boolean;
  // Handlers
  handleSort: (key: keyof Role) => void;
  handlePageChange: (page: number) => void;
  openPermissionsModal: (role: Role) => void;
  closeModal: () => void;
  // Filtros
  filterProps: {
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
  };
}



export function useRolesTable(initialData: Role[]): UseRolesTableReturn {
  // ============ ESTADOS ============
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterCreator, setFilterCreator] = useState('');
  const [filterUserCount, setFilterUserCount] = useState<[number, number]>([0, 100]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [filterDateRange, setFilterDateRange] = useState<[string, string] | undefined>(undefined);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Ordenamiento
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  // Modal
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ============ FILTRADO ============
  const filteredData = useMemo(() => {
    return initialData.filter((role) => {
      const matchesText = [role.name, role.description]
        .some(field => field.toLowerCase().includes(filterText.toLowerCase()));

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && role.isActive) ||
        (filterStatus === 'inactive' && !role.isActive);

      const matchesCreator =
        !filterCreator || 
        role.createdBy?.fullName?.toLowerCase().includes(filterCreator.toLowerCase());

      const matchesDate = !filterDateRange || (
        new Date(role.createdAt) >= new Date(filterDateRange[0]) &&
        new Date(role.createdAt) <= new Date(filterDateRange[1])
      );

      const matchesUserCount =
        role.userCount >= filterUserCount[0] && 
        role.userCount <= filterUserCount[1];

      return matchesText && matchesStatus && matchesCreator && matchesDate && matchesUserCount;
    });
  }, [initialData, filterText, filterStatus, filterCreator, filterDateRange, filterUserCount]);

  // ============ ORDENAMIENTO ============
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const { key, direction } = sortConfig;
      const sortOrder = direction === 'asc' ? 1 : -1;

      // Implementación específica para cada campo
      switch (key) {
        case 'name':
        case 'description':
          return (a[key].localeCompare(b[key])) * sortOrder;

        case 'userCount':
          return (a.userCount - b.userCount) * sortOrder;

        case 'isActive':
          return (Number(a.isActive) - Number(b.isActive)) * sortOrder;

        case 'permissions':
          return (a.permissions.length - b.permissions.length) * sortOrder;

        case 'createdBy':
          const aName = a.createdBy?.fullName || '';
          const bName = b.createdBy?.fullName || '';
          return aName.localeCompare(bName) * sortOrder;

        default:
          return 0;
      }
    });
  }, [filteredData, sortConfig]);

  // ============ PAGINACIÓN ============
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    return sortedData.slice(
      (safeCurrentPage - 1) * itemsPerPage,
      safeCurrentPage * itemsPerPage
    );
  }, [sortedData, safeCurrentPage, itemsPerPage]);

  // ============ HANDLERS ============
  const handleSort = useCallback((key: keyof Role) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
    setCurrentPage(1); // Resetear a primera página al ordenar
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const resetFilters = useCallback(() => {
    setFilterText('');
    setFilterStatus('all');
    setFilterCreator('');
    setFilterUserCount([0, 100]);
    setDateRange(undefined);
    setFilterDateRange(undefined);
    setSortConfig(null);
    setCurrentPage(1);
  }, []);

  // ============ MODAL ============
  const openPermissionsModal = useCallback((role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedRole(null);
  }, []);

  // ============ RETORNO ============
  return {
    // Estados
    sortConfig,
    paginatedData,
    totalItems,
    currentPage,
    totalPages,
    selectedRole,
    isModalOpen,
    // Handlers
    handleSort,
    handlePageChange,
    openPermissionsModal,
    closeModal,
    // Filtros
    filterProps: {
      filterText,
      filterStatus,
      filterCreator,
      filterUserCount,
      dateRange,
      itemsPerPage,
      onFilterTextChange: setFilterText,
      onFilterStatusChange: setFilterStatus,
      onFilterCreatorChange: setFilterCreator,
      onFilterUserCountChange: setFilterUserCount,
      onDateRangeChange: (range) => {
        setDateRange(range);
        if (range?.from && range?.to) {
          setFilterDateRange([
            format(range.from, "yyyy-MM-dd"),
            format(range.to, "yyyy-MM-dd"),
          ]);
        } else {
          setFilterDateRange(undefined);
        }
      },
      onResetFilters: resetFilters,
    },
  };
}

// Helper para formatear fechas
function format(date: Date, formatStr: string): string {
  return new Intl.DateTimeFormat('es-ES').format(date);
}