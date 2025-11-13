'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface StatusSelectorProps {
  statusId: number;
  onStatusChange: (statusId: number) => void;
  statuses: any[];
  disabled?: boolean;
  allowMultiple?: boolean;
}

/**
 * StatusSelector Component
 * Dropdown selector for attendance status with color coding
 */
export default function StatusSelector({
  statusId,
  onStatusChange,
  statuses = [],
  disabled = false,
  allowMultiple = false,
}: StatusSelectorProps) {
  return (
    <Select
      value={String(statusId)}
      onValueChange={(value) => onStatusChange(parseInt(value))}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecciona un estado" />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status: any) => (
          <SelectItem key={status.id} value={String(status.id)}>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {status.code}
              </Badge>
              <span>{status.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
