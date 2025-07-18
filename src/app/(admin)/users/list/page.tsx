//src\app\(admin)\users\list\page.tsx
import { Metadata } from "next";
import UserListContent from "./UserListContent";
export const metadata: Metadata = {
  title: "Next.js Permisos | TailAdmin - Next.js Dashboard Template",
  description:
    "Pagina para gestionar los Usuarios de la aplicacion",
};

export default function Permission() {
  return (
    <div>
       
        <UserListContent />
    </div>
  );
}
