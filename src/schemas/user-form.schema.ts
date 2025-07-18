// src/schemas/user-form.schema.ts
import { z } from "zod";

// Campos base comunes para ambos casos
const baseUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  dpi: z.string().length(13).optional(),
  nit: z.string().optional(),
  givenNames: z.string().min(2),
  lastNames: z.string().min(2),
  phone: z.string().min(8),
  birthDate: z.date(),
  gender: z.enum(["Masculino", "Femenino", "Otro"]),
  canAccessPlatform: z.boolean(),
profileImage: z.union([z.instanceof(File), z.string(), z.null()]).optional(),

  picture: z.instanceof(File).optional(),
  roleId: z.number().nullable().optional(),
  parentDetails: z
    .object({
      occupation: z.string().optional(),
      workplace: z.string().optional(),
    })
    .optional(),
  address: z.object({
    street: z.string().min(3),
    zone: z.string().min(1),
    municipality: z.string().min(3),
    department: z.string().min(3),
  }),
  teacherDetails: z
    .object({
      hiredDate: z.date().optional(),
      isHomeroomTeacher: z.boolean().optional(),
      academicDegree: z.string().optional(),
    })
    .optional(),
});

// Schema para creación (password requerido)
export const userCreateSchema = baseUserSchema.extend({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres Crear"),
}).superRefine(validateRoleSpecificFields);

// Schema para actualización (password opcional)
// En tu user-form.schema.ts
export const userUpdateSchema = baseUserSchema.extend({
  password: z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .optional()
  .or(z.literal('')) // Permite string vacío explícitamente
  .transform((val) => (val === '' ? undefined : val)),

});

// Función de validación común para ambos schemas
function validateRoleSpecificFields(data: any, ctx: z.RefinementCtx) {
  if (data.roleId === 3 && !data.parentDetails?.occupation) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["parentDetails", "occupation"],
      message: "La ocupación es requerida para padres",
    });
  }
  if (data.roleId === 2 && !data.teacherDetails?.hiredDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["teacherDetails", "hiredDate"],
      message: "La fecha de contratación es requerida para profesores",
    });
  }
}

// Tipo unión para usar en los formularios
export type UserFormSchema = z.infer<typeof userCreateSchema> | z.infer<typeof userUpdateSchema>;

// Función helper para obtener el schema correcto según el modo
export const getUserFormSchema = (isEditMode: boolean) => {
  return isEditMode ? userUpdateSchema : userCreateSchema;
};