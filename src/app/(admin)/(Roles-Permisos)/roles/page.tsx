//src\app\(admin)\(Roles-Permisos)\permissions\page.tsx
import { Metadata } from "next";
import RoleContent from "./RolesContent";

export const metadata: Metadata = {
  title: "Next.js Profile | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Permission() {
  return (
    <div>
      <RoleContent />
    </div>
  );
}
