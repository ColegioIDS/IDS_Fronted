// src/components/features/erica-evaluations/selection-grid.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export interface SelectionItem {
  id: number;
  name: string;
  subtitle?: string;
  onClick: () => void;
}

interface SelectionGridProps {
  title: string;
  icon: React.ReactNode;
  items: SelectionItem[];
}

export function SelectionGrid({ title, icon, items }: SelectionGridProps) {
  if (items.length === 0) {
    return (
      <Card className="border-amber-200 dark:border-amber-800">
        <CardContent className="py-12">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="flex justify-center mb-3 text-amber-600 dark:text-amber-400">
              {icon}
            </div>
            <p className="font-medium">No hay elementos disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg text-gray-900 dark:text-gray-50">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            {icon}
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => (
            <Button
              key={item.id}
              variant="outline"
              className="h-auto min-h-[100px] p-5 flex flex-col items-start text-left justify-between group border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 rounded-lg"
              onClick={item.onClick}
            >
              <div className="flex-1 w-full">
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-50 block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors break-words line-clamp-3 whitespace-normal">
                  {item.name}
                </span>
                {item.subtitle && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block break-words whitespace-normal">{item.subtitle}</span>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mt-3 ml-auto flex-shrink-0" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
