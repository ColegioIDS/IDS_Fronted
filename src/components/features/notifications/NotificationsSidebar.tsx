/**
 * src/components/features/notifications/NotificationsSidebar.tsx
 * 
 * Sidebar izquierdo con navegación y filtros estilo Gmail/Slack
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bell, MessageSquare, Star, AlertCircle, Send, Archive, Settings, Plus, Filter, Sliders, LogOut } from 'lucide-react';

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
  [key: string]: number | string;
}

interface NotificationsSidebarProps {
  currentCategory?: string;
  categorySummary?: CategorySummary;
  onFilterChange?: (category: string) => void;
  onViewChange?: (view: 'notifications' | 'preferences' | 'read-log') => void;
  canReadPreferences?: boolean;
  canReadLog?: boolean;
}

export function NotificationsSidebar({
  currentCategory = 'inbox',
  categorySummary,
  onViewChange,
  onFilterChange,
  canReadPreferences = false,
  canReadLog = false,
}: NotificationsSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(currentCategory);

  // Usar valores reales o defaults vacíos si no existe categorySummary
  const summary = categorySummary ? {
    inbox: categorySummary.inbox || 0,
    unread: categorySummary.unread || 0,
    starred: categorySummary.starred || 0,
    important: categorySummary.important || 0,
    sent: categorySummary.sent || 0,
    archived: categorySummary.archived || 0,
  } : {
    inbox: 0,
    unread: 0,
    starred: 0,
    important: 0,
    sent: 0,
    archived: 0,
  };

  const mainItems: SidebarItem[] = [
    {
      id: 'inbox',
      label: 'Bandeja de entrada',
      count: summary.inbox,
      icon: 'inbox',
      href: '/notifications?category=inbox',
    },
    {
      id: 'starred',
      label: 'Con estrella',
      count: summary.starred,
      icon: 'starred',
      href: '/notifications?category=starred',
    },
    {
      id: 'important',
      label: 'Importantes',
      count: summary.important,
      icon: 'important',
      href: '/notifications?category=important',
    },
    {
      id: 'sent',
      label: 'Enviadas',
      count: summary.sent,
      icon: 'sent',
      href: '/notifications?category=sent',
    },
    {
      id: 'archived',
      label: 'Archivadas',
      count: summary.archived,
      icon: 'archived',
      href: '/notifications?category=archived',
    },
  ];

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onFilterChange?.(categoryId);
  };

  return (
    <div className="w-80 bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notificaciones</h2>
        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Bandeja de entrada</p>
      </div>

      {/* Action Buttons */}
      <div className="p-3 border-b border-gray-200 dark:border-slate-800 flex gap-2">
        <button
          className="flex-1 px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Nueva
        </button>
        <button
          className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white text-sm font-medium rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
        >
          <Filter size={16} />
          Filtros
        </button>
      </div>

      {/* Scrollable Menu */}
      <div className="flex-1 overflow-y-auto">
        {/* Main Categories */}
        <div className="py-2">
          {mainItems.map((item) => {
            const iconMap: { [key: string]: React.ReactNode } = {
              'inbox': <Bell size={18} />,
              'starred': <Star size={18} />,
              'important': <AlertCircle size={18} />,
              'sent': <Send size={18} />,
              'archived': <Archive size={18} />,
            };
            return (
              <button
                key={item.id}
                onClick={() => handleCategoryClick(item.id)}
                className={`
                  w-full px-4 py-3 text-left text-sm transition-all flex justify-between items-center
                  ${
                    activeCategory === item.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  {iconMap[item.icon] || item.icon}
                  {item.label}
                </span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="bg-blue-600 dark:bg-blue-700 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer - Settings & Preferences */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-800 space-y-2">
        {canReadPreferences && (
          <button
            onClick={() => onViewChange?.('preferences')}
            className="w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition flex items-center gap-2"
          >
            <Sliders size={18} />
            Mis Preferencias
          </button>
        )}
        {canReadLog && (
          <button
            onClick={() => onViewChange?.('read-log')}
            className="w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition flex items-center gap-2"
          >
            <LogOut size={18} />
            Log de Lectura
          </button>
        )}
      </div>
    </div>
  );
}
