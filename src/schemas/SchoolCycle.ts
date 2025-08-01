// src/schemas/schoolCycle.ts
import { z } from "zod";
import { format } from "date-fns";

export const schoolCycleSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  startDate: z.date({ required_error: "Fecha de inicio requerida" }),
  endDate: z.date({ required_error: "Fecha de fin requerida" }),

  isActive: z.boolean(),
  isClosed: z.boolean()
});

export type SchoolCycleFormValues = z.infer<typeof schoolCycleSchema>;

export const defaultValues: SchoolCycleFormValues = {
  name: "",
  startDate: new Date(),  
  endDate: new Date(),   
  isActive: false,
  isClosed: false,
};
