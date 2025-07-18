//src\app\(admin)\users\create\page.tsx
import { Metadata } from "next";
import UserContent from "./UserContent";
export const metadata: Metadata = {
  title: "Next.js Permisos | TailAdmin - Next.js Dashboard Template",
  description:
    "Pagina para Crear usuarios de la aplicacion",
};

export default function Permission() {
  return (
    <div>
       
        <UserContent />
    </div>
  );
}
