"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type SidebarMode = "extended" | "minimal" | "hidden";

type SidebarContextType = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  sidebarMode: SidebarMode;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  cycleSidebarMode: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
  setIsExpanded: (expanded: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("extended");

  // Load sidebar mode from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebarMode');
    if (saved && (saved === "extended" || saved === "minimal" || saved === "hidden")) {
      setSidebarMode(saved as SidebarMode);
    }
  }, []);

  // Save sidebar mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebarMode', sidebarMode);
  }, [sidebarMode]);


  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const cycleSidebarMode = () => {
    setSidebarMode((prev) => {
      const modes: SidebarMode[] = ["extended", "minimal", "hidden"];
      const currentIndex = modes.indexOf(prev);
      const nextIndex = (currentIndex + 1) % modes.length;
      return modes[nextIndex];
    });
  };

  const toggleSubmenu = (item: string) => {
    setOpenSubmenu((prev) => (prev === item ? null : item));
  };

  return (
    <SidebarContext.Provider
      value={{
        isExpanded: isMobile ? false : isExpanded,
        isMobileOpen,
        isHovered,
        activeItem,
        openSubmenu,
        sidebarMode,
        toggleSidebar,
        toggleMobileSidebar,
        cycleSidebarMode,
        setIsHovered,
        setActiveItem,
        toggleSubmenu,
        setIsExpanded,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
