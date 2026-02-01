/**
 * src/app/(admin)/(management)/notifications/components/NotificationsSidebar.tsx
 * 
 * Sidebar izquierdo con navegación y filtros estilo Gmail/Slack
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SidebarItem {
  id: string;
  label: string;
  count?: number;
  icon: string;
  href: string;
}

interface CategorySummary {
  inbox: number;
  unread: number;
  starred: number;
  important: number;
  sent: number;
  archived: number;
  trash: number;
  [key: string]: number | string;
}

interface NotificationsSidebarProps {
  currentCategory?: string;
  categorySummary?: CategorySummary;
  onFilterChange?: (category: string) => void;
}

export function NotificationsSidebar({
  currentCategory = 'inbox',
  categorySummary = {
    inbox: 0,
    unread: 5,
    starred: 0,
    important: 2,
    sent: 0,
    archived: 0,
    trash: 0,
  },
  onFilterChange,
}: NotificationsSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(currentCategory);

  const mainItems: SidebarItem[] = [
    {
      id: 'inbox',
      label: 'Bandeja de entrada',
      count: categorySummary.inbox || 24,
      icon: '📥',
      href: '/notifications?category=inbox',
    },
    {
      id: 'starred',
      label: 'Con estrella',
      count: categorySummary.starred,
      icon: '⭐',
      href: '/notifications?category=starred',
    },
    {
      id: 'important',
      label: 'Importantes',
      count: categorySummary.important || 2,
      icon: '🔴',
      href: '/notifications?category=important',
    },
    {
      id: 'sent',
      label: 'Enviadas',
      icon: '📤',
      href: '/notifications?category=sent',
    },
    {
      id: 'archived',
      label: 'Archivadas',
      count: categorySummary.archived,
      icon: '📦',
      href: '/notifications?category=archived',
    },
    {
      id: 'trash',
      label: 'Basura',
      count: categorySummary.trash,
      icon: '🗑️',
      href: '/notifications?category=trash',
    },
  ];

  const typeFilters = [
    { id: 'courses', label: '📚 Cursos', icon: '📚' },
    { id: 'academic', label: '📊 Académico', icon: '📊' },
    { id: 'grades', label: '📈 Calificaciones', icon: '📈' },
    { id: 'system', label: '⚙️ Sistema', icon: '⚙️' },
    { id: 'admin', label: '📋 Administrativo', icon: '📋' },
  ];

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onFilterChange?.(categoryId);
  };

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Notificaciones</h2>
        <p className="text-xs text-gray-600 mt-1">Bandeja de entrada</p>
      </div>

      {/* Action Buttons */}
      <div className="p-3 border-b border-gray-200 flex gap-2">
        <button
          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
        >
          Nueva
        </button>
        <button
          className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-900 text-sm font-medium rounded hover:bg-gray-100 transition"
        >
          Filtros
        </button>
      </div>

      {/* Scrollable Menu */}
      <div className="flex-1 overflow-y-auto">
        {/* Main Categories */}
        <div className="py-2">
          {mainItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleCategoryClick(item.id)}
              className={`
                w-full px-4 py-3 text-left text-sm transition-all flex justify-between items-center
                ${
                  activeCategory === item.id
                    ? 'bg-blue-100 border-l-4 border-blue-600 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span className="flex items-center gap-2">
                <span>{item.icon}</span>
                {item.label}
              </span>
              {item.count !== undefined && item.count > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 my-2 mx-4"></div>

        {/* Type Filters */}
        <div className="py-2">
          <div className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Por tipo
          </div>
          {typeFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleCategoryClick(filter.id)}
              className={`
                w-full px-4 py-2 text-left text-sm transition-all
                ${
                  activeCategory === filter.id
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span>{filter.icon} {filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer - Settings */}
      <div className="p-4 border-t border-gray-200">
        <button
          className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition flex items-center gap-2"
        >
          <span>⚙️</span>
          Configuración
        </button>
      </div>
    </div>
  );
}
