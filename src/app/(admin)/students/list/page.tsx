//src\app\(admin)\students\list\page.tsx
import { Metadata } from "next";
import StudentListContent from "./StudentListContent";
export const metadata: Metadata = {
  title: "Next.js Permisos | TailAdmin - Next.js Dashboard Template",
  description:
    "Pagina para gestionar los Usuarios de la aplicacion",
};

export default function Permission() {
  return (
    <div>
       
        <StudentListContent />
    </div>
  );
}