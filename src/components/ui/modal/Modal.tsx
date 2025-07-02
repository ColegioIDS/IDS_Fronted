import { ReactNode } from "react";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Fondo oscuro */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Contenedor del modal */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:block sm:p-0">
        {/* Modal */}
        <div
          className={`inline-block w-full transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:align-middle ${sizeClasses[size]}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          {/* Encabezado */}
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between">
              <h3
                className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                id="modal-headline"
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">Cerrar</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="px-4 py-5 sm:p-6">{children}</div>

          {/* Pie de página (opcional) */}
          <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:px-6 sm:py-4">
            <div className="flex justify-end">
              <Button onClick={onClose} variant="outline">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente específico para mostrar los permisos del rol
interface PermissionsModalProps {
  role: {
    name: string;
    permissions: {
      id: number;
      module: string;
      action: string;
      isActive: boolean;
    }[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export function PermissionsModal({ role, isOpen, onClose }: PermissionsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Permisos del rol: ${role.name}`}
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 font-medium text-gray-700 dark:text-gray-300">
          <div>Módulo</div>
          <div>Acción</div>
          <div>Estado</div>
        </div>
        
        <div className="max-h-96 overflow-y-auto space-y-2">
          {role.permissions.length > 0 ? (
            role.permissions.map((permission) => (
              <div 
                key={permission.id} 
                className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 dark:border-gray-700"
              >
                <div className="font-medium">{permission.module}</div>
                <div>{permission.action}</div>
                <div>
                  <Badge 
                    color={permission.isActive ? "success" : "error"}
                  >
                    {permission.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-gray-500 dark:text-gray-400">
              Este rol no tiene permisos asignados
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}