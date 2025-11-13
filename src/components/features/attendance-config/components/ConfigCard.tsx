// src/components/features/attendance-config/components/ConfigCard.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { ATTENDANCE_CONFIG_THEME } from '../attendance-config-theme';

interface ConfigCardProps {
  title: string;
  description?: string;
  type?: 'threshold' | 'timing' | 'justification' | 'approval';
  icon?: LucideIcon;
  children?: React.ReactNode;
  compact?: boolean;
}

export const ConfigCard: React.FC<ConfigCardProps> = ({
  title,
  description,
  type = 'threshold',
  icon: Icon,
  children,
  compact = false,
}) => {
  const getThemeColors = () => {
    const themes: Record<string, any> = {
      threshold: ATTENDANCE_CONFIG_THEME.sections.threshold,
      timing: ATTENDANCE_CONFIG_THEME.sections.timing,
      justification: ATTENDANCE_CONFIG_THEME.sections.justification,
      approval: ATTENDANCE_CONFIG_THEME.sections.approval,
    };
    return themes[type] || themes.threshold;
  };

  const theme = getThemeColors();

  return (
    <Card className={`border-2 ${theme.border} ${theme.bg}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          {Icon && <Icon className={`h-5 w-5 ${theme.text}`} />}
          <div>
            <CardTitle className={`text-lg ${theme.text}`}>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
