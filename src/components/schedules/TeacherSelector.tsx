"use client";

import { useState, useMemo, useCallback } from "react";
import { Check, ChevronsUpDown, User, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { User as Teacher } from "@/types/user";

interface TeacherSelectorProps {
  teachers: Teacher[];
  value: number | null;
  onChange: (teacherId: number | null) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
}

export function TeacherSelector({
  teachers,
  value,
  onChange,
  placeholder = "Seleccionar docente",
  loading = false,
  disabled = false,
  allowClear = true,
  className,
}: TeacherSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar y memorizar docentes basado en búsqueda
  const filteredTeachers = useMemo(() => {
    if (!searchTerm.trim()) return teachers;
    
    const searchLower = searchTerm.toLowerCase();
    return teachers.filter((teacher) => {
      const fullName = `${teacher.givenNames} ${teacher.lastNames}`.toLowerCase();
      const academicDegree = teacher.teacherDetails?.academicDegree?.toLowerCase() || "";
      
      return (
        fullName.includes(searchLower) ||
        academicDegree.includes(searchLower) ||
        teacher.email?.toLowerCase().includes(searchLower)
      );
    });
  }, [teachers, searchTerm]);

  // Encontrar docente seleccionado
  const selectedTeacher = useMemo(() => {
    return teachers.find((teacher) => teacher.id === value) || null;
  }, [teachers, value]);

  // Manejar selección de docente
  const handleSelect = useCallback((teacherId: string) => {
    const id = teacherId === "clear" ? null : parseInt(teacherId);
    onChange(id);
    setOpen(false);
    setSearchTerm("");
  }, [onChange]);

  // Limpiar selección
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  }, [onChange]);

  // Renderizar información del docente
  const renderTeacherInfo = (teacher: Teacher, isSelected: boolean = false) => {
    const fullName = `${teacher.givenNames} ${teacher.lastNames}`;
    const academicDegree = teacher.teacherDetails?.academicDegree;
    const isHomeroomTeacher = teacher.teacherDetails?.isHomeroomTeacher;

    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-purple-100 rounded-full">
            <User className="h-3 w-3 text-purple-600" />
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "text-sm font-medium",
              isSelected ? "text-white" : "text-gray-900"
            )}>
              {fullName}
            </span>
            {academicDegree && (
              <span className={cn(
                "text-xs",
                isSelected ? "text-purple-100" : "text-gray-500"
              )}>
                {academicDegree}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          {isHomeroomTeacher && (
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs px-2 py-0.5",
                isSelected ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
              )}
            >
              Tutor
            </Badge>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between bg-white/80 backdrop-blur-sm border-gray-200/50",
            className
          )}
          disabled
        >
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>
            <span>Cargando docentes...</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-white/90",
            className
          )}
          disabled={disabled}
        >
          {selectedTeacher ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-purple-100 rounded-full">
                  <User className="h-3 w-3 text-purple-600" />
                </div>
                <span className="truncate">
                  {selectedTeacher.givenNames} {selectedTeacher.lastNames}
                </span>
                {selectedTeacher.teacherDetails?.academicDegree && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedTeacher.teacherDetails.academicDegree}
                  </Badge>
                )}
              </div>
              {allowClear && (
                <X
                  className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                  onClick={handleClear}
                />
              )}
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-full p-0 bg-white/95 backdrop-blur-sm" align="start">
        <Command className="bg-transparent">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Buscar por nombre o especialidad..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            <CommandGroup>
              {allowClear && selectedTeacher && (
                <CommandItem
                  value="clear"
                  onSelect={handleSelect}
                  className="px-3 py-2 hover:bg-gray-100/50"
                >
                  <X className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Limpiar selección</span>
                </CommandItem>
              )}
              
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <CommandItem
                    key={teacher.id}
                    value={teacher.id.toString()}
                    onSelect={handleSelect}
                    className="px-3 py-2 hover:bg-purple-50 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === teacher.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {renderTeacherInfo(teacher)}
                  </CommandItem>
                ))
              ) : (
                <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                  {searchTerm ? (
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-gray-300" />
                      <span>No se encontraron docentes</span>
                      <span className="text-xs">
                        Intenta con otro término de búsqueda
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <User className="h-8 w-8 text-gray-300" />
                      <span>No hay docentes disponibles</span>
                    </div>
                  )}
                </CommandEmpty>
              )}
            </CommandGroup>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}