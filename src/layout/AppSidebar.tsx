//src\layout\AppSidebar.tsx
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { PiStudentBold } from "react-icons/pi";
import { CalendarPlus, GraduationCap, CalendarCheck, ClipboardList, CalendarCheck2, FileSignature, BookOpenCheck } from 'lucide-react';
import { ProtectedNavItem } from '@/components/navigation/ProtectedNavItem';
import { ERICA_TOPICS_PERMISSIONS } from '@/constants/erica-topics.permissions';
import { ERICA_COLORS_PERMISSIONS } from '@/constants/erica-colors.permissions';
import { ERICA_HISTORY_PERMISSIONS } from '@/constants/modules-permissions/erica-history/erica-history.permissions';
import { ATTENDANCE_PERMISSIONS } from '@/constants/modules-permissions/attendance';
import { ATTENDANCE_CONFIG_PERMISSIONS } from '@/constants/modules-permissions/attendance-config';
import { ATTENDANCE_STATUS_PERMISSIONS } from '@/constants/modules-permissions/attendance-status';
import { ATTENDANCE_PERMISSIONS_PERMISSIONS } from '@/constants/modules-permissions/attendance-permissions';
import { SIGNATURES_PERMISSIONS } from '@/constants/modules-permissions/signatures';
import { ASSIGNMENTS_PERMISSIONS } from '@/constants/modules-permissions/assignments';
import { PERMISSION_PERMISSIONS } from '@/constants/modules-permissions/permission/permission.permissions';
import { ROLE_PERMISSIONS } from '@/constants/modules-permissions/role/role.permissions';
import { VERIFY_EMAIL_PERMISSIONS } from '@/constants/modules-permissions/verify-email/verify-email.permissions';
import { Palette } from 'lucide-react';

import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
  Users
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  color?: string;
  // Nuevos campos para permisos
  requiredPermission?: { module: string; action: string };
  requiredAnyPermissions?: Array<{ module: string; action: string }>;
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    // Permiso requerido para el subitem
    requiredPermission?: { module: string; action: string };
  }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
    color: "text-blue-300 dark:text-blue-300",
  },

  {
    icon: <PlugInIcon />,
    name: "Roles & Permisos",
    color: "text-purple-300 dark:text-purple-300",
    // Mostrar si tiene AL MENOS UNO de estos permisos
    requiredAnyPermissions: [
      ROLE_PERMISSIONS.READ,
      PERMISSION_PERMISSIONS.READ,
    ],
    subItems: [
      {
        name: "Permisos",
        path: "/permissions",
        requiredPermission: PERMISSION_PERMISSIONS.READ,
      },
      {
        name: "Roles",
        path: "/roles",
        requiredPermission: ROLE_PERMISSIONS.READ,
      }

    ],
  },


  {
    icon: <CalendarPlus className="w-5 h-5" />,
    name: "Ciclo Escolar",
    color: "text-amber-300 dark:text-amber-300",

    requiredAnyPermissions: [
      { module: 'school-cycle', action: 'read' },
      { module: 'bimester', action: 'read' },
      { module: 'academic-week', action: 'read' },
      { module: 'holiday', action: 'read' },
    ],


    subItems: [
      {
        name: "Ciclos Escolares",
        path: "/school-cycles",
        pro: false,
        requiredPermission: { module: 'school-cycle', action: 'read' }
      },
      {
        name: "Bimestres",
        path: "/bimesters",
        pro: false,
        requiredPermission: { module: 'bimester', action: 'read' }
      },
      {
        name: "Semanas Academicas",
        path: "/academic-weeks",
        pro: false,
        requiredPermission: { module: 'academic-week', action: 'read' }
      },
      {
        name: "Dias Libres",
        path: "/holidays",
        pro: false,
        requiredPermission: { module: 'holiday', action: 'read' }
      }
    ]
  },


  {
    icon: <Users />,
    name: "Usuarios",
    color: "text-cyan-300 dark:text-cyan-300",

    // Mostrar si tiene AL MENOS UNO de estos permisos
    requiredAnyPermissions: [
      { module: 'user', action: 'read' },
      VERIFY_EMAIL_PERMISSIONS.READ,
    ],

    subItems: [
      {
        name: "Gestionar Usuarios",
        path: "/users",
        requiredPermission: { module: 'user', action: 'read' }
      },
      {
        name: "Verificación de Emails",
        path: "/settings/verify-email",
        requiredPermission: VERIFY_EMAIL_PERMISSIONS.READ
      },
    ]
  },

  {
    icon: <GraduationCap className="w-5 h-5" />,
    name: "Grados & Secciones",
    color: "text-emerald-300 dark:text-emerald-300",
    requiredAnyPermissions: [
      { module: 'grade', action: 'read' },
      { module: 'section', action: 'read' },
      { module: 'grade-cycle', action: 'read' }
    ],
    subItems: [
      {
        name: "Grados", path: "/grades",
        requiredPermission: { module: 'grade', action: 'read' }
      },
      {
        name: "Secciones", path: "/sections",
        requiredPermission: { module: 'section', action: 'read' }
      },
      { name: "Asignacion Grados - Ciclos", path: "/grade-cycles",
        requiredPermission: { module: 'grade-cycle', action: 'read' }
      },

    ]



  },



  {
    icon: <PiStudentBold className="w-5 h-5" />,
    name: "Estudiantes",
    color: "text-pink-300 dark:text-pink-300",
    requiredAnyPermissions: [
      { module: 'student', action: 'read' },
      { module: 'student', action: 'create' }
    ],

    subItems: [
      {
        name: "Lista de Estudiantes", path: "/students/list",
        requiredPermission: { module: 'student', action: 'read' }
      },
      {
        name: "Crear Estudiante", path: "/students/create",
        requiredPermission: { module: 'student', action: 'create' }
      },
      {
        name: "Exportar Estudiantes", path: "/students/export",
        requiredPermission: { module: 'student', action: 'export' }
      },
    ]
  },





  {
    icon: <CalendarCheck className="w-5 h-5" />,
    name: "Cursos y Horarios",
    color: "text-indigo-300 dark:text-indigo-300",
    requiredAnyPermissions: [
      { module: 'course', action: 'read' },
      { module: 'course-grade', action: 'read' },
      { module: 'course-assignment', action: 'read' },
      { module: 'schedule', action: 'read' },
    ],
    subItems: [
      {
        name: "Cursos", path: "/courses",
        requiredPermission: { module: 'course', action: 'read' }
      },
      {
        name: "Asignación Cursos", path: "/course-grades",
        requiredPermission: { module: 'course-grade', action: 'read' }
      },
      {
        name: "Cursos Maestros", path: "/course-assignment",
        requiredPermission: { module: 'course-assignment', action: 'read' }
      },
      {
        name: "Horarios", path: "/schedules",
        requiredPermission: { module: 'schedule', action: 'read' }
      },
    ]
  },
  {
    icon: <ClipboardList className="w-5 h-5" />,
    name: "Matrículas",
    color: "text-orange-300 dark:text-orange-300",
    requiredPermission: { module: 'enrollments', action: 'read' },
    subItems: [
      { name: "Matrículas", path: "/enrollments", requiredPermission: { module: 'enrollments', action: 'read' } },
    ]
  },
  {
    icon: <CalendarCheck2 className="w-5 h-5" />,
    name: "Asistencia",
    color: "text-red-300 dark:text-red-300",
    requiredAnyPermissions: [
      ATTENDANCE_PERMISSIONS.READ,
      ATTENDANCE_CONFIG_PERMISSIONS.VIEW,
      ATTENDANCE_STATUS_PERMISSIONS.READ,
      ATTENDANCE_PERMISSIONS_PERMISSIONS.VIEW,
    ],
    subItems: [
      {
        name: "Configuración",
        path: "/attendance-config",
        requiredPermission: ATTENDANCE_CONFIG_PERMISSIONS.VIEW
      },
      {
        name: "Estados de Asistencia",
        path: "/attendance-statuses",
        requiredPermission: ATTENDANCE_STATUS_PERMISSIONS.READ
      },
      {
        name: "Permisos",
        path: "/attendance-config/permissions",
        requiredPermission: ATTENDANCE_PERMISSIONS_PERMISSIONS.VIEW
      },
      {
        name: "Asistencia",
        path: "/attendance",
        requiredPermission: ATTENDANCE_PERMISSIONS.READ
      },
      {
        name: "Reportes",
        path: "/attendance-reports",
        requiredPermission: ATTENDANCE_PERMISSIONS.READ
      },
      
    ]
  },
  {
    icon: <FileSignature className="w-5 h-5" />,
    name: "Firmas",
    color: "text-violet-300 dark:text-violet-300",
    requiredAnyPermissions: [
      SIGNATURES_PERMISSIONS.READ,
    ],
    subItems: [
      {
        name: "Gestionar Firmas",
        path: "/signatures",
        requiredPermission: SIGNATURES_PERMISSIONS.READ
      },
    ]
  },
  {
    icon: <BookOpenCheck className="w-5 h-5" />,
    name: "ERICA",
    color: "text-teal-300 dark:text-teal-300",
    requiredAnyPermissions: [
      ERICA_TOPICS_PERMISSIONS.READ,
      ERICA_COLORS_PERMISSIONS.READ,
      ERICA_HISTORY_PERMISSIONS.READ,
    ],
    subItems: [
      
      {
        name: "Temas ERICA",
        path: "/erica-topics",
        requiredPermission: ERICA_TOPICS_PERMISSIONS.READ
      },
      {
        name: "Colores ERICA",
        path: "/erica-colors",
        requiredPermission: ERICA_COLORS_PERMISSIONS.READ
      },
      {
        name: "Evaluaciones",
        path: "/erica-evaluations",
      },
      {
        name: "Historial ERICA",
        path: "/erica-history",
        requiredPermission: ERICA_HISTORY_PERMISSIONS.READ
      },
    ]
  },
  {
    icon: <ClipboardList className="w-5 h-5" />,
    name: "Tareas",
    color: "text-rose-300 dark:text-rose-300",
    requiredAnyPermissions: [
      ASSIGNMENTS_PERMISSIONS.READ,
    ],
    subItems: [
      {
        name: "Gestionar Tareas",
        path: "/assignments",
        requiredPermission: ASSIGNMENTS_PERMISSIONS.READ
      },
    ]
  },
  {
    icon: <ClipboardList className="w-5 h-5" />,
    name: "Cotejo",
    color: "text-lime-300 dark:text-lime-300",
    requiredAnyPermissions: [
      { module: 'cotejo', action: 'read' },
      { module: 'assignments', action: 'read' }
    ],
    subItems: [
      {
        name: "Consolidación de Calificaciones",
        path: "/cotejos",
        requiredPermission: { module: 'cotejo', action: 'read' }
      },
      {
        name: "Reportes",
        path: "/cotejos/reportes",
        requiredPermission: { module: 'cotejo', action: 'read' }
      },
      {
        name: "Tareas",
        path: "/assignments",
        requiredPermission: { module: 'assignments', action: 'read' }
      },
    ]
  }

];

const othersItems: NavItem[] = [

];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, sidebarMode } = useSidebar();
  const pathname = usePathname();

  // Declare all hooks FIRST (before any conditionals or early returns)
  const [isMobile, setIsMobile] = React.useState(false);
  const [openSubmenu, setOpenSubmenu] = React.useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = React.useState<Record<string, number>>({});
  const subMenuRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  React.useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  // NOW we can use conditionals after all hooks
  // If sidebar is hidden in desktop, don't render anything
  // But always render in mobile so it can be opened/closed
  if (sidebarMode === "hidden" && !isMobile) {
    return null;
  }

  // Determine if sidebar should show expanded layout
  const effectiveIsExpanded = sidebarMode === "extended" ? true : (sidebarMode === "minimal" ? false : isExpanded);
  const effectiveIsHovered = sidebarMode === "minimal" ? false : isHovered;
  const showExpandedLayout = effectiveIsExpanded || isMobileOpen;

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-2">
      {navItems.map((nav, index) => (
        <ProtectedNavItem
          key={nav.name}
          requiredPermission={nav.requiredPermission}
          requiredAnyPermissions={nav.requiredAnyPermissions}
        >
          <li>
            {nav.subItems ? (
              <>
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400"
                      : `text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50`
                  }`}
                >
                  <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center ${nav.color || ""}`}>
                    {nav.icon}
                  </span>
                  {(showExpandedLayout || effectiveIsHovered) && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium truncate">{nav.name}</span>
                      <ChevronDownIcon
                        className={`w-4 h-4 transition-transform duration-300 flex-shrink-0 ${
                          openSubmenu?.type === menuType && openSubmenu?.index === index
                            ? "rotate-180 text-brand-600 dark:text-brand-400"
                            : ""
                        }`}
                      />
                    </>
                  )}
                  {!showExpandedLayout && !effectiveIsHovered && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {nav.name}
                    </div>
                  )}
                </button>

                {/* Subitems protegidos individualmente */}
                {nav.subItems && (showExpandedLayout || effectiveIsHovered) && (
                  <div
                    ref={(el) => {
                      subMenuRefs.current[`${menuType}-${index}`] = el;
                    }}
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      height:
                        openSubmenu?.type === menuType && openSubmenu?.index === index
                          ? `${subMenuHeight[`${menuType}-${index}`]}px`
                          : "0px",
                    }}
                  >
                    <ul className="mt-1 space-y-1 pl-3">
                      {nav.subItems.map((subItem) => (
                        <ProtectedNavItem
                          key={subItem.name}
                          requiredPermission={subItem.requiredPermission}
                        >
                          <li>
                            <Link
                              href={subItem.path}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${
                                isActive(subItem.path)
                                  ? "bg-brand-100 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 font-medium border-l-2 border-brand-500"
                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                              }`}
                            >
                              <span className="flex-1 truncate">{subItem.name}</span>
                              {(subItem.new || subItem.pro) && (
                                <span className="flex items-center gap-1">
                                  {subItem.new && (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                                      isActive(subItem.path)
                                        ? "bg-blue-200 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    }`}>
                                      new
                                    </span>
                                  )}
                                  {subItem.pro && (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                                      isActive(subItem.path)
                                        ? "bg-purple-200 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                                        : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                    }`}>
                                      pro
                                    </span>
                                  )}
                                </span>
                              )}
                            </Link>
                          </li>
                        </ProtectedNavItem>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group ${
                    isActive(nav.path)
                      ? "bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 border-l-2 border-brand-500"
                      : `text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50`
                  }`}
                >
                  <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center ${nav.color || ""}`}>
                    {nav.icon}
                  </span>
                  {(showExpandedLayout || effectiveIsHovered) && (
                    <span className="flex-1 text-left text-sm font-medium truncate">{nav.name}</span>
                  )}
                  {!showExpandedLayout && !effectiveIsHovered && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {nav.name}
                    </div>
                  )}
                </Link>
              )
            )}
          </li>
        </ProtectedNavItem>
      ))}
    </ul>
  );

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-4 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 dark:border-gray-800/50 shadow-sm
        ${showExpandedLayout || effectiveIsHovered
          ? "w-[290px]"
          : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => sidebarMode !== "minimal" && !effectiveIsExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-6 flex items-center justify-start ${
          !showExpandedLayout && !effectiveIsHovered ? "lg:justify-center" : ""
        }`}
      >
        <Link href="/" className="transition-opacity hover:opacity-80">
          {showExpandedLayout || effectiveIsHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo-IDS.svg"
                alt="Logo"
                width={140}
                height={36}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark-IDS.svg"
                alt="Logo"
                width={140}
                height={36}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon-IDS.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className="flex-1 overflow-y-auto pr-2 space-y-1 scrollbar-sidebar">
          <div className="pb-2">
            <h2
              className={`px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 transition-opacity ${
                !showExpandedLayout && !effectiveIsHovered ? "lg:hidden" : ""
              }`}
            >
              Menú Principal
            </h2>
            {renderMenuItems(navItems, "main")}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
