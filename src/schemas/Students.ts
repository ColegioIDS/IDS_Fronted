//src\schemas\Students.ts
import { z } from 'zod';

// === Errores comunes ===
const errors = {
  required: "Este campo es obligatorio",
  minLength: (min: number) => `Mínimo ${min} caracteres`,
  maxLength: (max: number) => `Máximo ${max} caracteres`,
  minValue: (min: number) => `El valor mínimo es ${min}`,
  maxValue: (max: number) => `El valor máximo es ${max}`,
  futureDate: "La fecha no puede ser futura",
};

// === Enums ===
export const GenderSchema = z.enum(['Masculino', 'Femenino', 'Otro'], {
  errorMap: () => ({ message: "Seleccione un género válido" }),
}).optional();

export const RelationshipTypeSchema = z.enum(['Madre', 'Padre', 'Tutor', 'Abuelo', 'Tío', 'Otro']);

export const EnrollmentStatusSchema = z.enum(
  ['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'],
  { errorMap: () => ({ message: "Estado de matrícula inválido" }) }
).default('ACTIVE');

// ✅ NUEVO: Schema para enrollment
export const EnrollmentDataSchema = z.object({
  cycleId: z.number().int().positive("Debe seleccionar un ciclo escolar válido"),
  gradeId: z.number().int().positive("Debe seleccionar un grado válido"),
  sectionId: z.number().int().positive("Debe seleccionar una sección válida"),
  status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED']),
});

// === Sub-esquemas ===
const AddressSchema = z.object({
  street: z.string()
    .min(3, "La calle debe tener al menos 3 caracteres")
    .max(100, "La calle no puede exceder 100 caracteres"),
  zone: z.string()
    .min(1, "La zona es obligatoria")
    .max(50, "La zona no puede exceder 50 caracteres"),
  municipality: z.string()
    .max(50, "El municipio no puede exceder 50 caracteres")
    .refine(val => !isNaN(Number(val)) || val.length >= 3, "El municipio debe ser un ID válido o tener al menos 3 caracteres"),
  department: z.string()
    .max(50, "El departamento no puede exceder 50 caracteres")
    .refine(val => !isNaN(Number(val)) || val.length >= 3, "El departamento debe ser un ID válido o tener al menos 3 caracteres"),
});

const MedicalInfoSchema = z.object({
  hasDisease: z.boolean(),
  diseaseDetails: z.string().max(500, errors.maxLength(500)).nullable().optional(),
  takesMedication: z.boolean(),
  medicationDetails: z.string().max(500, errors.maxLength(500)).nullable().optional(),
  hasAllergies: z.boolean(),
  allergiesDetails: z.string().max(500, errors.maxLength(500)).nullable().optional(),
  emergencyMedicationAllowed: z.boolean(),
  emergencyMedicationDetails: z.string().max(500, errors.maxLength(500)).nullable().optional(),
  hasLearningDisability: z.boolean(),
  disabilityDetails: z.string().max(500, errors.maxLength(500)).nullable().optional(),
  strengths: z.string().max(500, errors.maxLength(500)).nullable().optional(),
  areasToImprove: z.string().max(500, errors.maxLength(500)).nullable().optional(),
}).refine(
  (data) => !data.hasDisease || data.diseaseDetails,
  { message: "Debe proporcionar detalles si tiene una enfermedad", path: ["diseaseDetails"] }
);

export const AcademicRecordSchema = z.object({
  schoolName: z.string().min(2, errors.minLength(2)).max(100, errors.maxLength(100)),
  gradeCompleted: z.string().min(1, errors.required).max(20),
  gradePromotedTo: z.string().min(1, errors.required).max(20),
  year: z.number().int(),
}).refine(
  (data) => data.schoolName.trim().length > 0,
  { message: "El nombre de la escuela es obligatorio", path: ["schoolName"] }
);

export const UserCreateSchema = z.object({
  givenNames: z.string().min(2, "Los nombres son requeridos"),
  lastNames: z.string().min(2, "Los apellidos son requeridos"),
  dpi: z.string().length(13, "Debe tener 13 dígitos"),
  phone: z.string().min(8, "Teléfono inválido"),
  email: z.string().email("Correo inválido").optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(),
  gender: GenderSchema,
});

export const ParentDetailsSchema = z.object({
  dpiIssuedAt: z.string().min(2, "Lugar de emisión requerido"),
  occupation: z.string().min(2, "Ocupación requerida"),
  workplace: z.string().min(2, "Lugar de trabajo requerido"),
  workPhone: z.string().optional().nullable(),
});

export const ParentLinkSchema = z.object({
  userId: z.number().int().positive().optional().nullable(),
  newParent: z.object({
    ...UserCreateSchema.shape,
    details: ParentDetailsSchema,
  }).optional().nullable(),
  relationshipType: RelationshipTypeSchema,
  isPrimaryContact: z.boolean(),
  hasLegalCustody: z.boolean(),
  financialResponsible: z.boolean(),
  livesWithStudent: z.boolean(),
  emergencyContactPriority: z.number().int(),
}).refine(
  (data) => data.userId || data.newParent,
  { message: "Debe proporcionar un ID de usuario O datos de padre nuevo", path: ["newParent"] }
);

export const EmergencyContactSchema = z.object({
  name: z.string().min(1, "Nombre requerido").optional().nullable(),
  relationship: z.string().min(1, "Relación requerida").optional().nullable(),
  phone: z.string().min(8, "Teléfono inválido").optional().nullable(),
}).refine(
  (data) => {
    // Si el nombre existe, relación y teléfono también deben existir
    if (data.name && data.name.trim().length > 0) {
      return !!data.relationship && !!data.phone;
    }
    return true;
  },
  { message: "Si proporciona un nombre, debe dar la relación y teléfono", path: ["name"] }
);

export const AuthorizedPersonSchema = z.object({
  name: z.string().optional().nullable(),
  relationship: z.string().optional().nullable(),
  phone: z.string().optional().nullable()
}).refine(
  (data) => {
    // Si proporciona algún dato, todos son opcionales
    // Pero si proporciona nombre, debe dar relación
    if (data.name && data.name.trim().length > 0) {
      return !!data.relationship;
    }
    return true;
  },
  { message: "Si proporciona un nombre, debe dar la relación", path: ["name"] }
);

export const SiblingSchema = z.object({
  name: z.string().optional().nullable(),
  age: z.number().int().nonnegative().optional().nullable(),
  gender: GenderSchema,
}).refine(
  (data) => {
    // Si hay nombre, edad debe estar ahí
    if (data.name && data.name.trim().length > 0) {
      return data.age !== null && data.age !== undefined;
    }
    return true;
  },
  { message: "Si proporciona un nombre, debe dar la edad", path: ["name"] }
);

export const BusServiceSchema = z.object({
  hasService: z.boolean(),
  pickupPersonName: z.string().optional().nullable(),
  dropoffPersonName: z.string().optional().nullable(),
  homeAddress: z.string().optional().nullable(),
  referencePoints: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  emergencyDeliveryPerson: z.string().optional().nullable(),
  route: z.string().optional().nullable(),
  monthlyFee: z.number().optional().nullable(),
  acceptedRules: z.boolean(),
  signedDate: z.coerce.date().optional().nullable(),
});

// === Esquema Base ===
export const createBaseStudentSchema = () => z.object({
  codeSIRE: z.string().min(3).max(20).nullish(),
  cui: z.string()
    .min(4, "CUI debe tener al menos 4 caracteres")
    .regex(/^[a-zA-Z0-9]+$/, "CUI solo puede contener letras y números")
    .nullish(),
  givenNames: z.string().min(2, { message: "Los nombres deben tener al menos 2 caracteres" }).max(100),
  lastNames: z.string().min(2, { message: "Los apellidos deben tener al menos 2 caracteres" }).max(100),
  birthDate: z.coerce.date()
    .max(new Date(), { message: errors.futureDate })
    .refine(
      (date) => date < new Date(new Date().getFullYear() - 3, 0, 1),
      { message: "El estudiante debe tener al menos 3 años" }
    ),
  birthPlace: z.string().max(100).nullish(),
  birthTown: z.string().max(100).nullish(),
  nationality: z.string().max(50).nullish(),
  nativeLanguage: z.string().max(50).nullish(),
  secondLanguage: z.string().max(50).nullish(),
  livesWithText: z.string().max(100).nullish(),
  financialResponsibleText: z.string().max(100).nullish(),
  gender: GenderSchema,
  siblingsCount: z.number().int().min(0),
  brothersCount: z.number().int().min(0),
  sistersCount: z.number().int().min(0),
  favoriteColor: z.string().max(30).optional(),
  hobby: z.string().max(100).optional(),
  favoriteFood: z.string().max(50).optional(),
  favoriteSubject: z.string().max(50).optional(),
  favoriteToy: z.string().max(50).optional(),
  favoriteCake: z.string().max(50).optional(),
  ethnicity: z.string().max(50).nullish(),
  hasLibrary: z.boolean().default(false),
  hasLunches: z.boolean().default(false),
  // ✅ ACTUALIZADO: profileImage puede ser File (durante edición) o objeto {url, publicId} (después de upload)
  profileImage: z.union([
    z.instanceof(File),
    z.object({
      url: z.string().url("URL inválida"),
      publicId: z.string().min(1, "publicId requerido"),
      kind: z.literal("profile").default("profile"),
      description: z.string().optional().nullable(),
    }),
  ]).nullable().optional(),

  pictures: z.array(z.object({
    url: z.string(),
    publicId: z.string(),
    kind: z.string().optional(),
    description: z.string().optional(),
  })).optional(),

  address: AddressSchema.nullish(),
});

/* Esquema Extendido */
export const ExtendedStudentSchema = createBaseStudentSchema().extend({
  // ✅ ACTUALIZADO: Enrollment con campos que pueden ser null inicialmente
  enrollment: z.object({
    cycleId: z.number().int().positive("Debe seleccionar un ciclo escolar válido").nullable().optional(),
    gradeId: z.number().int().positive("Debe seleccionar un grado válido").nullable().optional(),
    sectionId: z.number().int().positive("Debe seleccionar una sección válida").nullable().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED']),
  }).refine(
    (data) => data.cycleId && data.gradeId && data.sectionId,
    { message: "Ciclo, Grado y Sección son obligatorios", path: ["cycleId"] }
  ),
  
  medicalInfo: MedicalInfoSchema.optional(),
  academicRecords: z.array(AcademicRecordSchema).min(1, "Debe proporcionar al menos un registro académico"),
  parents: z.array(ParentLinkSchema).min(1, "Debe proporcionar al menos un padre o tutor"),
  emergencyContacts: z.array(EmergencyContactSchema).optional(),
  authorizedPersons: z.array(AuthorizedPersonSchema).optional(),
  siblings: z.array(SiblingSchema).optional(),
  busService: BusServiceSchema.optional()
});

export const StudentSchema = ExtendedStudentSchema.refine(
  (data) => data.siblingsCount === data.brothersCount + data.sistersCount,
  {
    message: "La suma de hermanos y hermanas debe coincidir con el total",
    path: ["siblingsCount"],
  }
);

// === Tipos ===
export type StudentFormValues = z.infer<typeof StudentSchema>;
export type CreateStudentDto = Omit<StudentFormValues, 'academicRecords' | 'medicalInfo'> & {
  medicalInfo?: z.infer<typeof MedicalInfoSchema>;
  academicRecords?: z.infer<typeof AcademicRecordSchema>[];
};

// ✅ ACTUALIZADO: defaultValues con enrollment
export const defaultValues: StudentFormValues = {
  codeSIRE: undefined,
  cui: undefined,
  givenNames: "",
  lastNames: "",
  birthDate: new Date(),
  birthPlace: undefined,
  birthTown: undefined,
  nationality: undefined,
  nativeLanguage: undefined,
  secondLanguage: undefined,
  livesWithText: undefined,
  financialResponsibleText: undefined,
  gender: undefined,
  siblingsCount: 0,
  brothersCount: 0,
  sistersCount: 0,
  favoriteColor: undefined,
  hobby: undefined,
  favoriteFood: undefined,
  favoriteSubject: undefined,
  favoriteToy: undefined,
  favoriteCake: undefined,
  ethnicity: undefined,
  hasLibrary: false,
  hasLunches: false,
  
  // ✅ NUEVO: Enrollment con valores por defecto (null inicialmente, se setean cuando cargan datos)
  enrollment: {
    cycleId: null,
    gradeId: null,
    sectionId: null,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED',
  },
  
  address: {
    street: "",
    zone: "",
    municipality: "",
    department: "",
  },

  medicalInfo: {
    hasDisease: false,
    takesMedication: false,
    hasAllergies: false,
    emergencyMedicationAllowed: false,
    hasLearningDisability: false,
    diseaseDetails: undefined,
    medicationDetails: undefined,
    allergiesDetails: undefined,
    emergencyMedicationDetails: undefined,
    disabilityDetails: undefined,
    strengths: undefined,
    areasToImprove: undefined,
  },

  academicRecords: [
    {
      schoolName: "",
      gradeCompleted: "",
      gradePromotedTo: "",
      year: new Date().getFullYear(),
    }
  ],
  
  parents: [
    {
      userId: null,
      newParent: {
        givenNames: "",
        lastNames: "",
        dpi: "",
        phone: "",
        birthDate: undefined,
        gender: undefined,
        email: undefined,
        details: {
          dpiIssuedAt: "",
          occupation: "",
          workplace: "",
          workPhone: undefined,
        },
      },
      relationshipType: "Padre",
      isPrimaryContact: true,
      hasLegalCustody: true,
      financialResponsible: false,
      livesWithStudent: true,
      emergencyContactPriority: 1,
    }
  ],

  emergencyContacts: [
    {
      name: "",
      relationship: "",
      phone: "",
    }
  ],

  authorizedPersons: [
    {
      name: "",
      relationship: "",
      phone: undefined,
    }
  ],
  
  siblings: [
    {
      name: "",
      age: 0,
      gender: undefined,
    }
  ],
  
  busService: {
    hasService: false,
    pickupPersonName: null,
    dropoffPersonName: null,
    homeAddress: null,
    referencePoints: null,
    emergencyContact: null,
    emergencyDeliveryPerson: null,
    route: null,
    monthlyFee: null,
    acceptedRules: false,
    signedDate: null,
  },

  // ✅ ACTUALIZADO: profileImage ahora es un objeto
  profileImage: null,
  
  pictures: [],
};