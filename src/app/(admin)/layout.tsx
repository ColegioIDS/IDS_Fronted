//src\app\(admin)\layout.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { StateSelectorProvider } from "@/context/StateSelectorContext";
import { ActiveSelectorProvider } from "@/context/ActiveSelectorContext";
import { EricaColorsProvider } from "@/context/EricaColorsContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen, sidebarMode } = useSidebar();
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir cuando ya haya terminado de cargar
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  // Calculate effective expanded state based on sidebarMode
  const effectiveIsExpanded = sidebarMode === "extended" ? true : (sidebarMode === "minimal" ? false : isExpanded);
  const effectiveIsHovered = sidebarMode === "minimal" ? false : isHovered;

  const mainContentMargin = sidebarMode === "hidden" 
    ? "ml-0"
    : isMobileOpen
      ? "ml-0"
      : effectiveIsExpanded || effectiveIsHovered
        ? "lg:ml-[290px]"
        : "lg:ml-[90px]";

  // ⚠️ IMPORTANTE: Mostrar loading mientras se verifica
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // ⚠️ IMPORTANTE: No renderizar nada si no está autenticado
  // (el useEffect se encargará del redireccionamiento)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <StateSelectorProvider>
      <ActiveSelectorProvider>
        <EricaColorsProvider>
          <div className="min-h-screen xl:flex">
            <AppSidebar />
            <Backdrop />

            <div
              className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin} w-full overflow-hidden`}
            >
              <AppHeader />

              <div className="w-full overflow-x-hidden px-3 sm:px-4 md:px-6 py-4 md:py-6">
                <div className="w-full max-w-7xl mx-auto">
                  {children}
                </div>
              </div>
            </div>

            <Toaster
              position="top-right"
              richColors={true}
              expand={true}
              closeButton={true}
              toastOptions={{
                style: {
                  backgroundColor: "rgb(24, 24, 27)", // fondo sólido dark
                  color: "#fff",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                },
                className: "shadow-xl rounded-lg",
                duration: 4000,
              }}

              style={{ zIndex: 9999 }}
            />
          </div>
        </EricaColorsProvider>
      </ActiveSelectorProvider>
    </StateSelectorProvider>
  );
}