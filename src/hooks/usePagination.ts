// src/hooks/usePagination.ts
import { useState, useMemo } from 'react';

export function usePagination<T>(data: T[], itemsPerPage = 6) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    paginatedData,
    totalItems,
    totalPages,
    currentPage,
    handlePageChange,
  };
}
