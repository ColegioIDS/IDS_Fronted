//src\app\(admin)\cycle\page.tsx
import { Metadata } from "next";
import CyclesContent from "./CyclesContent";

export const metadata: Metadata = {
  title: "Next.js Permisos | TailAdmin - Next.js Dashboard Template",
  description:
    "Pagina para gestionar los permisos de la aplicacion",
};

export default function Permission() {
  return (
    <div>
      <CyclesContent />
    </div>
  );
}
