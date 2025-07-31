//src\app\(admin)\students\profile\[id]\page.tsx
import { Metadata } from "next";
import StudentProfileContent from "./StudentProfileContent";
export const metadata: Metadata = {
  title: "Next.js Permisos | TailAdmin - Next.js Dashboard Template",
  description:
    "Pagina para ver perfil del estudiante de la aplicacion",
};

export default function Permission() {
  return (
    <div>
       
        <StudentProfileContent />
    </div>
  );
}