import { Metadata } from "next";
import StudentContent from "./StudentContent";
export const metadata: Metadata = {
  title: "Next.js Permisos | TailAdmin - Next.js Dashboard Template",
  description:
    "Pagina para Crear usuarios de la aplicacion",
};


export default function Permission() {
  return (
    <div>

        <StudentContent />
    </div>
  );
}
