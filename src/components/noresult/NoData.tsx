//src\components\noresult\NoData.tsx
import { FiSearch } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface NoResultsFoundProps {
  onResetFilters?: () => void;
  message?: string;
  suggestion?: string;
}

export const NoResultsFound = ({
  onResetFilters,
  message = "No se encontraron resultados",
  suggestion = "Intenta ajustar tus filtros o términos de búsqueda",
}: NoResultsFoundProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
      <div className="p-4 bg-muted rounded-full">
      <FiSearch className="h-8 w-8 text-muted-foreground animate-search-sweep" />

      </div>
      <h3 className="text-xl font-semibold">{message}</h3>
      <p className="text-muted-foreground">{suggestion}</p>
      {onResetFilters && (
        <Button variant="outline" onClick={onResetFilters}>
          Limpiar filtros
        </Button>
      )}
    </div>
  );
};