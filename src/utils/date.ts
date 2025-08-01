// utils/date.ts o donde tengas esta función
import { format } from "date-fns";

export function formatDate(date: string | Date) {
  const parsed = typeof date === "string" ? new Date(date) : date;
  return format(parsed, "dd/MM/yyyy"); // o el formato que prefieras
}
