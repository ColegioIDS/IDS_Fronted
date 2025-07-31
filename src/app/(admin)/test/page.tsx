'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
export const GenderSchema = z.enum(['Masculino', 'Femenino', 'Otro'], {
  errorMap: () => ({ message: "Seleccione un género válido" }),
}).optional();

const errors = {
  required: "Este campo es obligatorio",
  minLength: (min: number) => `Mínimo ${min} caracteres`,
  maxLength: (max: number) => `Máximo ${max} caracteres`,
  minValue: (min: number) => `El valor mínimo es ${min}`,
  maxValue: (max: number) => `El valor máximo es ${max}`,
  futureDate: "La fecha no puede ser futura",
};
export const RelationshipTypeSchema = z.enum(['Madre', 'Padre', 'Tutor', 'Abuelo', 'Tío', 'Otro']);







const createBaseStudentSchema = () => z.object({
  codeSIRE: z.string().min(3).max(20).nullish(),
  givenNames: z.string()
    .min(2, { message: "Los nombres deben tener al menos 2 caracteres" })
    .max(100),
  lastNames: z.string()
    .min(2, { message: "Los apellidos deben tener al menos 2 caracteres" })
    .max(100),
  birthDate: z.coerce.date()
    .max(new Date(), { message: errors.futureDate })
    .refine(
      (date) => date < new Date(new Date().getFullYear() - 3, 0, 1),
      { message: "El estudiante debe tener al menos 3 años" }
    ),
  birthPlace: z.string().max(100).nullish(),
  nationality: z.string().max(50).nullish(),
  livesWithText: z.string().max(100).nullish(),
  financialResponsibleText: z.string().max(100).nullish(),
  gender: z.enum(['Masculino', 'Femenino', 'Otro']).nullish(),
  siblingsCount: z.number().int().min(0),
  brothersCount: z.number().int().min(0),
  sistersCount: z.number().int().min(0),
  favoriteColor: z.string().max(30).nullish(),
  hobby: z.string().max(100).nullish(),
  favoriteFood: z.string().max(50).nullish(),
  favoriteSubject: z.string().max(50).nullish(),
  favoriteToy: z.string().max(50).nullish(),
  favoriteCake: z.string().max(50).nullish(),

  address: AddressSchema.nullish(),
});

const AddressSchema = z.object({
  street: z.string()
    .min(3, "La calle debe tener al menos 3 caracteres")
    .max(100, "La calle no puede exceder 100 caracteres"),
  zone: z.string()
    .min(1, "La zona es obligatoria")
    .max(50, "La zona no puede exceder 50 caracteres"),
  municipality: z.string()
    .min(3, "El municipio debe tener al menos 3 caracteres")
    .max(50, "El municipio no puede exceder 50 caracteres"),
  department: z.string()
    .min(3, "El departamento debe tener al menos 3 caracteres")
    .max(50, "El departamento no puede exceder 50 caracteres"),
})

const MedicalInfoSchema = z.object({
  hasDisease: z.boolean(),
  diseaseDetails: z.string().max(500, errors.maxLength(500)).nullable().optional(),
  takesMedication: z.boolean(),
  medicationDetails: z.string().max(500, errors.maxLength(500)).nullable().optional(),
  hasAllergies: z.boolean(),
  allergiesDetails: z.string().max(500, errors.maxLength(500)).nullable().optional(),
  emergencyMedicationAllowed: z.boolean(),
  hasLearningDisability: z.boolean(),
  disabilityDetails: z.string().max(500, errors.maxLength(500)).nullable().optional(),

  strengths: z.string().max(500, errors.maxLength(500)).nullable().optional(),
  areasToImprove: z.string().max(500, errors.maxLength(500)).nullable().optional(),

}).refine(
  (data) => !data.hasDisease || data.diseaseDetails,
  { message: "Debe proporcionar detalles si tiene una enfermedad", path: ["diseaseDetails"] }
);


const AcademicRecordSchema = z.object({
  schoolName: z.string().min(2, errors.minLength(2)).max(100, errors.maxLength(100)),
  gradeCompleted: z.string().min(1, errors.required).max(20),
  gradePromotedTo: z.string().min(1, errors.required).max(20),
  year: z.number().int(),

})




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
  email: z.string().email().optional().nullable(),
  workPhone: z.string().optional().nullable(),
});

export const ParentLinkSchema = z.object({
  userId: z.number().int().positive().optional().nullable(),

  newParent: z.object({
    ...UserCreateSchema.shape, // 👈 usa la estructura base
    details: ParentDetailsSchema,
  }).optional().nullable(),

  relationshipType: RelationshipTypeSchema,
  isPrimaryContact: z.boolean(),
  hasLegalCustody: z.boolean(),
  financialResponsible: z.boolean(),
  livesWithStudent: z.boolean(),
  emergencyContactPriority: z.number().int(),
});


export const EmergencyContactSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  relationship: z.string().min(2, "Relación requerida"),
  phone: z.string().min(8, "Teléfono inválido").optional().nullable(),
});


export const AuthorizedPersonSchema = z.object({
  name: z.string(),
  relationship: z.string(),
  phone: z.string().optional().nullable(),
});


export const SiblingSchema = z.object({
  name: z.string(),
  age: z.number().int().nonnegative(),
  gender: z.string().optional().nullable(),

});



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




const ExtendedStudentSchema = createBaseStudentSchema().extend({
  medicalInfo: MedicalInfoSchema.optional(),
  academicRecords: z.array(AcademicRecordSchema).min(1, "Debe proporcionar al menos un registro académico"),
  parents: z.array(ParentLinkSchema).min(1, "Debe proporcionar al menos un padre o tutor"),
  emergencyContacts: z.array(EmergencyContactSchema).optional(),
  authorizedPersons: z.array(AuthorizedPersonSchema).optional(),
  siblings: z.array(SiblingSchema).optional(),
  busService: BusServiceSchema.optional()

});


const StudentSchema = ExtendedStudentSchema.refine(
  (data) => data.siblingsCount === data.brothersCount + data.sistersCount,
  {
    message: "La suma de hermanos y hermanas debe coincidir con el total",
    path: ["siblingsCount"],
  }
);

export type StudentFormValues = z.infer<typeof StudentSchema>;




const defaultValues: StudentFormValues = {
  codeSIRE: null,
  givenNames: "",
  lastNames: "",
  birthDate: new Date(), // Puedes ajustar esto si usas un input que acepta `null` o `undefined`
  birthPlace: null,
  nationality: null,
  livesWithText: null,
  financialResponsibleText: null,
  gender: null,
  siblingsCount: 0,
  brothersCount: 0,
  sistersCount: 0,
  favoriteColor: null,
  hobby: null,
  favoriteFood: null,
  favoriteSubject: null,
  favoriteToy: null,
  favoriteCake: null,
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
    emergencyMedicationAllowed: true,
    hasLearningDisability: false,
    diseaseDetails: null,
    medicationDetails: null,
    allergiesDetails: null,
    disabilityDetails: null,
    strengths: null,
    areasToImprove: null,
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
        birthDate: null,
        gender: undefined,
        email: null,
        details: {
          dpiIssuedAt: "",
          occupation: "",
          workplace: "",
          email: null,
          workPhone: null,
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
      phone: null,
    }
  ],

  authorizedPersons: [
    {
      name: "",
      relationship: "",
      phone: null,
    }
  ],
  siblings: [
    {
      name: "",
      age: 0,
      gender: null,
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




}



// Componente de prueba
export default function TestBaseStudentForm() {


  const { register, handleSubmit, formState: { errors } } = useForm<StudentFormValues>({

    resolver: zodResolver(StudentSchema),
    defaultValues,
  });

  const onSubmit = (data: StudentFormValues) => {
    console.log('Datos enviados:', data);
  };

  const onError = (errors: any) => {
    console.log('Errores de validación:', JSON.stringify(errors, null, 2));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>

    </form>
  );
}