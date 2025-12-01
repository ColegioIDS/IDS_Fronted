// src/utils/generate-student-mock-data.ts
/**
 * Generador de datos aleatorios para pruebas rápidas de estudiantes
 * Uso: Copiar el objeto generado y pegarlo en el formulario (limpiar primero)
 */

import { StudentFormValues } from '@/schemas/Students';

// Arrays para datos aleatorios
const firstNames = ['Juan', 'María', 'Carlos', 'Sofía', 'Diego', 'Ana', 'Miguel', 'Laura', 'Roberto', 'Valentina'];
const lastNames = ['García', 'Rodríguez', 'Martínez', 'López', 'Pérez', 'Sánchez', 'Gómez', 'Morales', 'Rivera', 'Flores'];
const genders = ['Masculino', 'Femenino', 'Otro'];
const relationships = ['Madre', 'Padre', 'Tutor', 'Abuelo', 'Tío', 'Otro'];
const places = ['Guatemala', 'Escuintla', 'Antigua', 'Ciudad de Guatemala', 'Mixco'];
const zones = ['Zona 1', 'Zona 2', 'Zona 3', 'Zona 4', 'Zona 5', 'Zona 10', 'Zona 12'];
const occupations = ['Ingeniero', 'Médico', 'Abogado', 'Profesor', 'Contador', 'Vendedor', 'Empresario', 'Ama de Casa'];
const workplaces = ['Colegio IDS', 'Empresa X', 'Hospital Central', 'Consultorio Privado', 'Negocio Propio', 'Institución Pública'];
const hobbies = ['Fútbol', 'Basketball', 'Lectura', 'Videojuegos', 'Natación', 'Dibujo', 'Música', 'Danza'];
const foods = ['Pizza', 'Hamburguesas', 'Tacos', 'Pollo', 'Pasta', 'Arroz', 'Quesadillas', 'Tortas'];
const cakes = ['Chocolate', 'Vainilla', 'Fresa', 'Red Velvet', 'Carrot Cake', 'Cheesecake'];
const subjects = ['Matemáticas', 'Español', 'Inglés', 'Ciencias', 'Historia', 'Educación Física', 'Arte', 'Informática'];
const colors = ['Azul', 'Rojo', 'Verde', 'Negro', 'Amarillo', 'Púrpura', 'Naranja', 'Rosa'];
const toys = ['Lego', 'Hot Wheels', 'Muñecas', 'Balón', 'Videojuegos', 'Rompecabezas', 'Construcciones'];
const streets = ['Calle Principal', 'Avenida Central', 'Calle 5', 'Avenida 10', 'Pasaje A', 'Calle del Parque'];
const routes = ['Ruta A', 'Ruta B', 'Ruta C', 'Ruta Norte', 'Ruta Sur', 'Ruta Este', 'Ruta Oeste'];

// Funciones auxiliares
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDPI(): string {
  // Formato: AAMMDDXXXX (13 dígitos)
  let dpi = '';
  for (let i = 0; i < 13; i++) {
    dpi += Math.floor(Math.random() * 10);
  }
  return dpi;
}

function generatePhone(): string {
  // Formato: +502 XXXX-XXXX
  let phone = '5023';
  for (let i = 0; i < 8; i++) {
    phone += Math.floor(Math.random() * 10);
  }
  return phone;
}

function generateEmail(firstName: string, lastName: string): string {
  const random = Math.floor(Math.random() * 1000);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${random}@email.com`;
}

function generateRandomDate(minYears: number, maxYears: number): Date {
  const today = new Date();
  const minDate = new Date(today.getFullYear() - maxYears, 0, 1);
  const maxDate = new Date(today.getFullYear() - minYears, 11, 31);
  return new Date(minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime()));
}

function generateCodeSIRE(): string {
  const prefix = 'EST';
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
  return `${prefix}${year}${random}`;
}

// Función principal
export function generateStudentMockData(): StudentFormValues {
  const gender = getRandomItem(genders);
  const givenNames = getRandomItem(firstNames);
  const studentLastNames = `${getRandomItem(lastNames)} ${getRandomItem(lastNames)}`;
  const birthDate = generateRandomDate(8, 18);
  const parentGender = getRandomItem(['Masculino', 'Femenino']);
  const parentFirstName = parentGender === 'Masculino' ? getRandomItem(firstNames.filter(n => !['María', 'Ana', 'Sofía', 'Laura', 'Valentina'].includes(n))) : getRandomItem(firstNames.filter(n => ['María', 'Ana', 'Sofía', 'Laura', 'Valentina'].includes(n)));
  const relationship1 = getRandomItem(relationships);
  
  // Asegurar que el segundo padre sea diferente
  let relationship2 = getRandomItem(relationships);
  while (relationship2 === relationship1 && relationships.length > 1) {
    relationship2 = getRandomItem(relationships);
  }

  const siblingsCount = getRandomNumber(0, 4);
  const brothersCount = getRandomNumber(0, siblingsCount);
  const sistersCount = siblingsCount - brothersCount;

  // ✅ Seleccionar departamento y municipio válido por ID
  const departmentId = getRandomNumber(1, 5).toString();
  const municipalityId = getRandomNumber(1, 10).toString();

  return {
    codeSIRE: generateCodeSIRE(),
    givenNames,
    lastNames: studentLastNames,
    birthDate,
    birthPlace: getRandomItem(places),
    nationality: 'Guatemalteco',
    livesWithText: getRandomItem(['Con ambos padres', 'Con la madre', 'Con el padre', 'Con abuelos']),
    financialResponsibleText: getRandomItem(['Padre', 'Madre', 'Abuelo', 'Tío']),
    gender: gender as any,
    siblingsCount,
    brothersCount,
    sistersCount,
    hasLibrary: Math.random() > 0.3,
    hasLunches: Math.random() > 0.4,
    favoriteColor: getRandomItem(colors),
    hobby: getRandomItem(hobbies),
    favoriteFood: getRandomItem(foods),
    favoriteSubject: getRandomItem(subjects),
    favoriteToy: getRandomItem(toys),
    favoriteCake: getRandomItem(cakes),
    profileImage: null,
    pictures: [],

    // Enrollment (REQUERIDO - debes cambiar estos valores manualmente)
    enrollment: {
      cycleId: 1, // ⚠️ CAMBIAR: Usar el ciclo activo
      gradeId: 1, // ⚠️ CAMBIAR: Seleccionar un grado válido
      sectionId: 1, // ⚠️ CAMBIAR: Seleccionar una sección válida
      status: 'ACTIVE',
    },

    // Dirección
    address: {
      street: getRandomItem(streets),
      zone: getRandomItem(zones),
      municipality: municipalityId, // ✅ ID del municipio
      department: departmentId, // ✅ ID del departamento
    },

    // Información Médica
    medicalInfo: {
      hasDisease: Math.random() > 0.8,
      diseaseDetails: Math.random() > 0.8 ? 'Alergia leve' : undefined,
      takesMedication: Math.random() > 0.9,
      medicationDetails: Math.random() > 0.9 ? 'Vitaminas diarias' : undefined,
      hasAllergies: Math.random() > 0.7,
      allergiesDetails: Math.random() > 0.7 ? 'Polen, frutos secos' : undefined,
      emergencyMedicationAllowed: true,
      hasLearningDisability: false,
      disabilityDetails: undefined,
      strengths: 'Muy atento, participa activamente',
      areasToImprove: 'Mejorar velocidad de lectura',
    },

    // Registros Académicos
    academicRecords: [
      {
        schoolName: 'Colegio anterior',
        gradeCompleted: getRandomNumber(1, 6).toString(),
        gradePromotedTo: getRandomNumber(1, 6).toString(),
        year: new Date().getFullYear() - 1,
      }
    ],

    // Padres (REQUERIDO - al menos uno)
    parents: [
      {
        userId: null,
        newParent: {
          givenNames: parentFirstName,
          lastNames: getRandomItem(lastNames),
          dpi: generateDPI(),
          phone: generatePhone(),
          birthDate: generateRandomDate(20, 60),
          gender: parentGender as any,
          email: generateEmail(parentFirstName, 'padre'),
          details: {
            dpiIssuedAt: getRandomItem(places),
            occupation: getRandomItem(occupations),
            workplace: getRandomItem(workplaces),
            workPhone: generatePhone(),
          },
        },
        relationshipType: relationship1 as any,
        isPrimaryContact: true,
        hasLegalCustody: true,
        financialResponsible: true,
        livesWithStudent: true,
        emergencyContactPriority: 1,
      },
      {
        userId: null,
        newParent: {
          givenNames: getRandomItem(firstNames),
          lastNames: getRandomItem(lastNames),
          dpi: generateDPI(),
          phone: generatePhone(),
          birthDate: generateRandomDate(20, 60),
          gender: getRandomItem(['Masculino', 'Femenino']) as any,
          email: generateEmail('segundo', 'padre'),
          details: {
            dpiIssuedAt: getRandomItem(places),
            occupation: getRandomItem(occupations),
            workplace: getRandomItem(workplaces),
            workPhone: generatePhone(),
          },
        },
        relationshipType: relationship2 as any,
        isPrimaryContact: false,
        hasLegalCustody: false,
        financialResponsible: false,
        livesWithStudent: false,
        emergencyContactPriority: 2,
      },
    ],

    // Contactos de Emergencia
    emergencyContacts: [
      {
        name: getRandomItem(firstNames),
        relationship: 'Tía',
        phone: generatePhone(),
      },
      {
        name: getRandomItem(firstNames),
        relationship: 'Vecina',
        phone: generatePhone(),
      },
    ],

    // Personas Autorizadas
    authorizedPersons: [
      {
        name: getRandomItem(firstNames),
        relationship: 'Abuela',
        phone: generatePhone(),
      },
      {
        name: getRandomItem(firstNames),
        relationship: 'Tío',
        phone: generatePhone(),
      },
    ],

    // Hermanos
    siblings: Array.from({ length: siblingsCount }, (_, i) => ({
      name: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
      age: getRandomNumber(3, 20),
      gender: i < brothersCount ? ('Masculino' as any) : ('Femenino' as any),
    })),

    // Servicio de Bus
    busService: {
      hasService: Math.random() > 0.5,
      pickupPersonName: getRandomItem(firstNames),
      dropoffPersonName: getRandomItem(firstNames),
      homeAddress: getRandomItem(streets),
      referencePoints: 'Cerca de la iglesia',
      emergencyContact: generatePhone(),
      emergencyDeliveryPerson: getRandomItem(firstNames),
      route: getRandomItem(routes),
      monthlyFee: getRandomNumber(200, 500),
      acceptedRules: true,
      signedDate: new Date(),
    },
  };
}

// Función para generar múltiples estudiantes
export function generateMultipleStudents(count: number): StudentFormValues[] {
  return Array.from({ length: count }, () => generateStudentMockData());
}

// Log de ejemplo
export function logExampleData(): void {
  const example = generateStudentMockData();
}
