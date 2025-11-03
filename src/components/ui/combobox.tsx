import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
  options: Array<{
    label: string
    value: string | number
  }>
  value?: string | number
  onValueChange?: (value: string | number) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar opción...",
  searchPlaceholder = "Buscar...",
  emptyText = "No hay opciones",
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedLabel = options.find(
    (opt) => opt.value.toString() === value?.toString()
  )?.label

  // Filtrar opciones basado en la búsqueda (case-insensitive)
  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options
    
    const lowerSearch = searchValue.toLowerCase()
    return options.filter((option) =>
      option.label.toLowerCase().includes(lowerSearch)
    )
  }, [searchValue, options])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between h-9 px-3 text-sm",
            !selectedLabel && "text-muted-foreground"
          )}
        >
          <span className="truncate">
            {selectedLabel || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="h-8 text-sm"
            autoFocus
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onValueChange?.(option.value)
                  setOpen(false)
                  setSearchValue("")
                }}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-accent transition-colors",
                  value?.toString() === option.value.toString() && "bg-accent"
                )}
              >
                <Check
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    value?.toString() === option.value.toString()
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                <span className="flex-1">{option.label}</span>
              </button>
            ))
          ) : (
            <div className="p-4 text-sm text-center text-muted-foreground">
              {emptyText}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
