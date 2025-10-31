// src/app/(admin)/grades/page.tsx

import { Metadata } from "next";
import { GradesPageContent } from "@/components/features/grades/GradesPageContent";
import Breadcrumb from '@/components/common/Breadcrumb';

export const metadata: Metadata = {
  title: "Grados - Sistema Académico IDS",
  description: "Gestión de grados académicos",
};

/**
 * 📚 Página de Grados
 * 
 * Permite administrar los grados académicos del sistema:
 * - Ver listado de grados con filtros
 * - Crear, editar y eliminar grados
 * - Activar/desactivar grados
 * - Ver estadísticas de uso
 */
export default function GradesPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle=""
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Académico", href: "/academic" },
          { label: "Grados", href: "#" },
        ]}
      />
      <GradesPageContent />
    </div>
  );
}