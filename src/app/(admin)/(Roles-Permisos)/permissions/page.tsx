//src\app\(admin)\(Roles-Permisos)\permissions\page.tsx
import { Metadata } from "next";
import PermissionContent from "./PermissionContent";

export const metadata: Metadata = {
  title: "Next.js Permisos | TailAdmin - Next.js Dashboard Template",
  description:
    "Pagina para gestionar los permisos de la aplicacion",
};

export default function Permission() {
  return (
    <div>
      <PermissionContent />
    </div>
  );
}
