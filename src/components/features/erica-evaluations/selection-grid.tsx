// src/components/features/erica-evaluations/selection-grid.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            {icon}
            <p className="mt-2">No hay elementos disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <Button
              key={item.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-left hover:bg-blue-50 hover:border-blue-300"
              onClick={item.onClick}
            >
              <span className="font-semibold text-gray-900">{item.name}</span>
              {item.subtitle && (
                <span className="text-xs text-gray-500 mt-1">{item.subtitle}</span>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
