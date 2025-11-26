'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;

interface ProtectedButtonProps extends ButtonProps {
  module: string;
  action: string;
  hideOnNoPermission?: boolean;
  showTooltip?: boolean;
  tooltipMessage?: string;
  children?: React.ReactNode;
}

export function ProtectedButton({
  module,
  action,
  hideOnNoPermission = false,
  showTooltip = true,
  tooltipMessage,
  children,
  ...buttonProps
}: ProtectedButtonProps) {
  const { hasPermission, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Button {...buttonProps} disabled>
        Cargando...
      </Button>
    );
  }

  const hasAccess = hasPermission(module, action);

  if (!hasAccess) {
    if (hideOnNoPermission) return null;

    const disabledButton = (
      <Button {...buttonProps} disabled variant="outline" className="cursor-not-allowed">
        <Lock className="w-4 h-4 mr-2" />
        Sin permisos
      </Button>
    );

    if (showTooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{disabledButton}</TooltipTrigger>
            <TooltipContent>
              <p>{tooltipMessage || `Requiere permiso: ${module}.${action}`}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return disabledButton;
  }

  return <Button {...buttonProps}>{children}</Button>;
}
