# � GUÍA DE INTEGRACIÓN - MÓDULO DE ESTUDIANTES (Frontend)

**Última actualización:** 2 de Noviembre de 2025  
**Versión:** 2.0 ⭐ COMPLETO CON SCOPES Y 2 PÁGINAS  
**Estado:** ✅ Listo para Producción

---

## 📋 Tabla de Contenidos

1. [Endpoints Disponibles](#endpoints)
2. [Autenticación y Permisos](#autenticación)
3. [Estructura de Datos](#estructura)
4. [Ejemplos de Implementación](#ejemplos)
5. [Manejo de Errores](#errores)
6. [Validaciones](#validaciones)
7. [Integración en Componentes](#componentes)

**🆕 NUEVO:** Endpoint unificado `POST /api/students/with-enrollment` que crea Estudiante + Matrícula en una sola llamada.

---

## 🌐 Endpoints Disponibles {#endpoints}

### Base URL
```
http://localhost:3000/api/students
```

### Listado de Endpoints

#### 1. **GET** - Listar Estudiantes (Paginado)
```
GET /api/students
```

**Parámetros Query:**
| Parámetro | Tipo | Requerido | Ejemplo | Descripción |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Número de página (default: 1) |
| `limit` | number | No | 10 | Registros por página (default: 10, max: 100) |
| `search` | string | No | "Juan" | Buscar por nombre, apellido, DPI |
| `sortBy` | string | No | "givenNames" | Campo para ordenar |
| `sortOrder` | string | No | "asc" | Orden: "asc" o "desc" |

**Campos sortBy disponibles:**
- `givenNames`
- `lastNames`
- `codeSIRE`
- `createdAt`
- `updatedAt`

**Ejemplo Completo:**
```
GET /api/students?page=1&limit=10&search=juan&sortBy=createdAt&sortOrder=desc
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Listado de estudiantes obtenido",
  "data": [
    {
      "id": 1,
      "codeSIRE": "ES001",
      "givenNames": "Juan",
      "lastNames": "Pérez García",
      "birthDate": "2015-05-20T00:00:00Z",
      "birthPlace": "San Salvador",
      "birthTown": "Ciudad Delgado",
      "nationality": "Salvadoreño",
      "gender": "M",
      "nativeLanguage": "Español",
      "secondLanguage": "Inglés",
      "livesWithText": "Padre",
      "financialResponsibleText": "Padre",
      "siblingsCount": 2,
      "brothersCount": 1,
      "sistersCount": 1,
      "favoriteColor": "Azul",
      "hobby": "Fútbol",
      "favoriteFood": "Pizza",
      "favoriteSubject": "Matemáticas",
      "favoriteToy": "Pelota",
      "favoriteCake": "Chocolate",
      "addressId": 5,
      "createdAt": "2025-10-01T09:00:00Z",
      "updatedAt": "2025-11-02T08:45:00Z",
      "_count": {
        "enrollments": 1,
        "pictures": 2,
        "parents": 1,
        "medicalInfo": 1
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

#### 2. **GET** - Estadísticas de Estudiantes
```
GET /api/students/stats
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Estadísticas de estudiantes",
  "data": {
    "totalStudents": 150,
    "totalWithEnrollments": 148,
    "totalWithPictures": 142,
    "totalWithMedicalInfo": 145
  }
}
```

---

#### 3. **GET** - Obtener Estudiante por ID
```
GET /api/students/:id
```

**Parámetros:**
- `id` (path) - ID del estudiante (number)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Estudiante obtenido",
  "data": {
    "id": 1,
    "codeSIRE": "ES001",
    "givenNames": "Juan",
    "lastNames": "Pérez García",
    "birthDate": "2015-05-20T00:00:00Z",
    "birthPlace": "San Salvador",
    "birthTown": "Ciudad Delgado",
    "nationality": "Salvadoreño",
    "gender": "M",
    "nativeLanguage": "Español",
    "secondLanguage": "Inglés",
    "livesWithText": "Padre",
    "financialResponsibleText": "Padre",
    "siblingsCount": 2,
    "brothersCount": 1,
    "sistersCount": 1,
    "favoriteColor": "Azul",
    "hobby": "Fútbol",
    "favoriteFood": "Pizza",
    "favoriteSubject": "Matemáticas",
    "favoriteToy": "Pelota",
    "favoriteCake": "Chocolate",
    "addressId": 5,
    "createdAt": "2025-10-01T09:00:00Z",
    "updatedAt": "2025-11-02T08:45:00Z",
    "address": {
      "id": 5,
      "street": "Calle Principal 123",
      "zone": "Zona 3",
      "municipalityId": 2,
      "departmentId": 1
    },
    "medicalInfo": {
      "id": 1,
      "studentId": 1,
      "hasDisease": false,
      "diseaseDetails": null,
      "takesMedication": false,
      "medicationDetails": null,
      "hasAllergies": true,
      "allergiesDetails": "Alérgico a cacahuates",
      "emergencyMedicationAllowed": true,
      "hasLearningDisability": false,
      "disabilityDetails": null,
      "strengths": "Matemáticas, Deportes",
      "areasToImprove": "Lectura de comprensión"
    },
    "pictures": [
      {
        "id": 1,
        "publicId": "cloud-id-123",
        "kind": "profile",
        "url": "https://res.cloudinary.com/...",
        "description": "Foto de perfil",
        "uploadedAt": "2025-10-01T10:00:00Z"
      }
    ],
    "parents": [
      {
        "id": 1,
        "parentId": 5,
        "studentId": 1,
        "relationshipType": "Padre",
        "isPrimaryContact": true,
        "hasLegalCustody": true,
        "canAccessInfo": true,
        "livesWithStudent": true,
        "financialResponsible": true,
        "emergencyContactPriority": 1,
        "receivesSchoolNotices": true
      }
    ],
    "enrollments": [
      {
        "id": 1,
        "studentId": 1,
        "cycleId": 2,
        "gradeId": 3,
        "sectionId": 5,
        "status": "active",
        "dateEnrolled": "2025-10-01T00:00:00Z"
      }
    ]
  }
}
```

---

#### 4. **POST** - Crear Nuevo Estudiante
```
POST /api/students
Content-Type: application/json
```

**Body (Entrada):**
```json
{
  "codeSIRE": "ES002",
  "givenNames": "María",
  "lastNames": "López García",
  "birthDate": "2015-08-15",
  "birthPlace": "San Salvador",
  "birthTown": "Ciudad Delgado",
  "nationality": "Salvadoreña",
  "gender": "F",
  "nativeLanguage": "Español",
  "secondLanguage": "Inglés",
  "livesWithText": "Madre",
  "financialResponsibleText": "Madre",
  "siblingsCount": 1,
  "brothersCount": 0,
  "sistersCount": 1,
  "favoriteColor": "Rosa",
  "hobby": "Lectura",
  "favoriteFood": "Pasta",
  "favoriteSubject": "Español",
  "favoriteToy": "Muñeca",
  "favoriteCake": "Vainilla",
  "municipalityId": 2,
  "departmentId": 1,
  "street": "Calle Secundaria 456",
  "zone": "Zona 5",
  "hasDisease": false,
  "diseaseDetails": null,
  "takesMedication": false,
  "medicationDetails": null,
  "hasAllergies": false,
  "allergiesDetails": null,
  "emergencyMedicationAllowed": false,
  "hasLearningDisability": false,
  "disabilityDetails": null,
  "strengths": "Escritura",
  "areasToImprove": "Matemáticas",
  "pictures": [
    {
      "url": "https://res.cloudinary.com/...",
      "publicId": "student-2-profile",
      "kind": "profile",
      "description": "Foto de perfil"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Estudiante creado exitosamente",
  "data": {
    "id": 2,
    "codeSIRE": "ES002",
    "givenNames": "María",
    "lastNames": "López García",
    ...
  }
}
```

---

#### 4.1. **POST** - Crear Estudiante CON Matrícula (Unificado) ⭐ NUEVO
```
POST /api/students/with-enrollment
Content-Type: application/json
```

**Body (Entrada):** Incluye datos del estudiante + enrollment

```json
{
  "codeSIRE": "ES002",
  "givenNames": "María",
  "lastNames": "López García",
  "birthDate": "2015-08-15",
  "birthPlace": "San Salvador",
  "birthTown": "Ciudad Delgado",
  "nationality": "Salvadoreña",
  "gender": "F",
  "nativeLanguage": "Español",
  "secondLanguage": "Inglés",
  "livesWithText": "Madre",
  "financialResponsibleText": "Madre",
  "siblingsCount": 1,
  "brothersCount": 0,
  "sistersCount": 1,
  "favoriteColor": "Rosa",
  "hobby": "Lectura",
  "municipalityId": 2,
  "departmentId": 1,
  "street": "Calle Secundaria 456",
  "zone": "Zona 5",
  "hasAllergies": false,
  "allergiesDetails": null,
  "hasDisease": false,
  "diseaseDetails": null,
  "takesMedication": false,
  "medicationDetails": null,
  "emergencyMedicationAllowed": false,
  "hasLearningDisability": false,
  "disabilityDetails": null,
  "strengths": "Escritura",
  "areasToImprove": "Matemáticas",
  "pictures": [
    {
      "url": "https://res.cloudinary.com/...",
      "publicId": "student-2-profile",
      "kind": "profile",
      "description": "Foto de perfil"
    }
  ],
  "enrollment": {
    "cycleId": 1,
    "gradeId": 2,
    "sectionId": 5,
    "status": "active"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Estudiante y matrícula creados exitosamente",
  "data": {
    "student": {
      "id": 2,
      "codeSIRE": "ES002",
      "givenNames": "María",
      "lastNames": "López García",
      "birthDate": "2015-08-15T00:00:00Z",
      "enrollments": [
        {
          "id": 456,
          "studentId": 2,
          "cycleId": 1,
          "gradeId": 2,
          "sectionId": 5,
          "status": "active",
          "dateEnrolled": "2025-11-02T14:30:00Z"
        }
      ]
    },
    "enrollment": {
      "id": 456,
      "studentId": 2,
      "cycleId": 1,
      "gradeId": 2,
      "sectionId": 5,
      "status": "active",
      "dateEnrolled": "2025-11-02T14:30:00Z"
    }
  }
}
```

**✨ Ventajas:**
- ✅ Una sola llamada al backend
- ✅ Crea estudiante + matrícula automáticamente
- ✅ Transacción atómica (ambas u ninguna)
- ✅ Ideal para flujo de registro en UI

**📊 Flujo Recomendado:**
```
1. Usuario llena formulario con:
   - Datos del estudiante
   - Selecciona: Ciclo → Grado → Sección (via GET /api/school-cycles/active/with-structure)
   
2. Usuario hace clic en "REGISTRAR"

3. Frontend envía: POST /api/students/with-enrollment

4. Backend retorna:
   - Student creado (id, datos personales)
   - Enrollment creado (id, cycle/grade/section)

5. ✅ Listo para usar en la plataforma
```

---

#### 5. **PATCH** - Actualizar Estudiante
```
PATCH /api/students/:id
Content-Type: application/json
```

**Parámetros:**
- `id` (path) - ID del estudiante (number)

**Body (Entrada):** Cualquier campo es opcional
```json
{
  "givenNames": "María Antonia",
  "favoriteColor": "Morado",
  "hasAllergies": true,
  "allergiesDetails": "Alérgica a mariscos"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Estudiante actualizado",
  "data": {
    "id": 2,
    "givenNames": "María Antonia",
    ...
  }
}
```

---

#### 6. **DELETE** - Eliminar Estudiante
```
DELETE /api/students/:id
```

**Parámetros:**
- `id` (path) - ID del estudiante (number)

**Response (204 No Content):**
```
(Sin cuerpo)
```

**Response de Error (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "No es posible eliminar el estudiante. Tiene matrículas activas."
}
```

---

#### 7. **GET** - Buscar Usuario por DPI
```
GET /api/students/users/search-by-dpi/:dpi
```

**Parámetros:**
- `dpi` (path) - DPI del usuario a buscar

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Usuario encontrado",
  "data": {
    "id": 5,
    "dpi": "1234567890123",
    "email": "juan@ejemplo.com",
    "givenNames": "Juan",
    "lastNames": "Pérez García",
    "phone": "+50312345678",
    "isActive": true,
    "canAccessPlatform": true,
    "roleId": 3,
    "lastLogin": "2025-11-02T10:30:00Z",
    "createdAt": "2025-10-01T09:00:00Z"
  }
}
```

**Response de Error (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "No existe usuario con DPI: 1234567890123"
}
```

---

#### 8. **GET** - Validar Disponibilidad de DPI
```
GET /api/students/users/validate-dpi/:dpi
```

**Parámetros:**
- `dpi` (path) - DPI a validar

**Response si DPI EXISTE (200 OK):**
```json
{
  "success": true,
  "message": "Validación completada",
  "data": {
    "available": false,
    "message": "El DPI 1234567890123 ya existe en el sistema",
    "userInfo": {
      "id": 5,
      "dpi": "1234567890123",
      "givenNames": "Juan",
      "lastNames": "Pérez García",
      "email": "juan@ejemplo.com"
    }
  }
}
```

**Response si DPI ESTÁ DISPONIBLE (200 OK):**
```json
{
  "success": true,
  "message": "Validación completada",
  "data": {
    "available": true,
    "message": "El DPI 9999999999999 está disponible para crear un nuevo usuario"
  }
}
```

---

#### 9. **POST** - Validar DPI (via POST)
```
POST /api/students/users/check-dpi
Content-Type: application/json
```

**Body (Entrada):**
```json
{
  "dpi": "1234567890123"
}
```

**Response:** Igual al endpoint 8 (GET validate-dpi)

---

#### 10. **GET** - Listar Fotos de Estudiante
```
GET /api/students/:id/pictures
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Fotos obtenidas",
  "data": [
    {
      "id": 1,
      "publicId": "cloud-id-123",
      "kind": "profile",
      "url": "https://res.cloudinary.com/...",
      "description": "Foto de perfil",
      "uploadedAt": "2025-10-01T10:00:00Z"
    },
    {
      "id": 2,
      "publicId": "cloud-id-456",
      "kind": "document",
      "url": "https://res.cloudinary.com/...",
      "description": "Cédula",
      "uploadedAt": "2025-10-02T11:00:00Z"
    }
  ]
}
```

---

#### 11. **GET** - Fotos por Tipo
```
GET /api/students/:id/pictures/:kind
```

**Parámetros:**
- `id` (path) - ID del estudiante
- `kind` (path) - Tipo de foto: `profile`, `document`, `evidence`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Fotos del tipo 'profile' obtenidas",
  "data": [
    {
      "id": 1,
      "publicId": "cloud-id-123",
      "kind": "profile",
      "url": "https://res.cloudinary.com/...",
      "description": "Foto de perfil",
      "uploadedAt": "2025-10-01T10:00:00Z"
    }
  ]
}
```

---

#### 12. **POST** - Agregar Foto a Estudiante
```
POST /api/students/:id/pictures
Content-Type: application/json
```

**Body (Entrada):**
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "student-1-profile",
  "kind": "profile",
  "description": "Foto de perfil actualizada"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Foto agregada exitosamente",
  "data": {
    "id": 3,
    "publicId": "student-1-profile",
    "kind": "profile",
    "url": "https://res.cloudinary.com/...",
    "description": "Foto de perfil actualizada",
    "uploadedAt": "2025-11-02T08:45:00Z"
  }
}
```

---

#### 13. **DELETE** - Eliminar Foto
```
DELETE /api/students/:id/pictures/:pictureId
```

**Parámetros:**
- `id` (path) - ID del estudiante
- `pictureId` (path) - ID de la foto

**Response (204 No Content):**
```
(Sin cuerpo)
```

---

## 🔐 Autenticación y Permisos {#autenticación}

### Headers Requeridos

Todos los endpoints requieren JWT en el header:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE',
  'Content-Type': 'application/json'
}
```

### Permisos RBAC Requeridos

| Endpoint | Permiso Requerido | Scopes Permitidos |
|----------|------------------|------------------|
| GET /students | `student.read` | ALL, GRADE, SECTION |
| GET /students/stats | `student.read` | ALL, GRADE, SECTION |
| GET /students/:id | `student.read-one` | ALL, GRADE, SECTION |
| POST /students | `student.create` | ALL |
| **POST /students/with-enrollment** ⭐ | **`student.create`** | **ALL** |
| PATCH /students/:id | `student.update` | ALL, GRADE, SECTION |
| DELETE /students/:id | `student.delete` | ALL |
| GET /students/:id/pictures | `student.read-one` | ALL, GRADE, SECTION |
| POST /students/:id/pictures | `student.update` | ALL, GRADE, SECTION |
| DELETE /students/:id/pictures/:pictureId | `student.update` | ALL, GRADE, SECTION |
| GET /students/users/search-by-dpi/:dpi | `student.read` | ALL, GRADE, SECTION |
| GET /students/users/validate-dpi/:dpi | `student.read` | ALL, GRADE, SECTION |
| POST /students/users/check-dpi | `student.read` | ALL, GRADE, SECTION |

### Roles que Pueden Usar los Endpoints

- **Admin** - Todos los endpoints (scope: ALL)
- **Coordinador** - Lectura y actualización (scope: GRADE)
- **Maestro** - Lectura (scope: SECTION)
- **Personal Administrativo** - Todos excepto delete (scope: varies)

---

## 📦 Estructura de Datos {#estructura}

### Student (Estudiante)

```typescript
interface Student {
  id: number;                          // ID único
  codeSIRE?: string;                   // Código SIRE único
  givenNames: string;                  // Nombres (requerido)
  lastNames: string;                   // Apellidos (requerido)
  birthDate: Date;                     // Fecha de nacimiento (requerido)
  birthPlace?: string;                 // Lugar de nacimiento
  birthTown?: string;                  // Pueblo de nacimiento
  nationality?: string;                // Nacionalidad
  gender?: 'M' | 'F' | 'O';           // Género
  nativeLanguage?: string;             // Idioma materno
  secondLanguage?: string;             // Segundo idioma
  livesWithText?: string;              // Vive con...
  financialResponsibleText?: string;   // Responsable financiero
  siblingsCount: number;               // Total de hermanos
  brothersCount: number;               // Hermanos varones
  sistersCount: number;                // Hermanas mujeres
  favoriteColor?: string;              // Color favorito
  hobby?: string;                      // Pasatiempo
  favoriteFood?: string;               // Comida favorita
  favoriteSubject?: string;            // Materia favorita
  favoriteToy?: string;                // Juguete favorito
  favoriteCake?: string;               // Pastel favorito
  addressId?: number;                  // FK a Address
  createdAt: Date;                     // Fecha de creación
  updatedAt: Date;                     // Fecha de actualización
  
  // Relaciones
  address?: Address;
  medicalInfo?: MedicalInfo;
  pictures?: Picture[];
  parents?: ParentChildLink[];
  enrollments?: Enrollment[];
  _count?: {
    enrollments: number;
    pictures: number;
    parents: number;
    medicalInfo: number;
  };
}
```

### Address (Dirección)

```typescript
interface Address {
  id: number;
  street?: string;                   // Calle
  zone?: string;                     // Zona
  municipalityId?: number;           // FK a Municipality
  departmentId?: number;             // FK a Department
  municipality?: Municipality;
  department?: Department;
}
```

### MedicalInfo (Información Médica)

```typescript
interface MedicalInfo {
  id: number;
  studentId: number;                              // FK a Student
  hasDisease: boolean;                            // ¿Tiene enfermedad?
  diseaseDetails?: string;                        // Detalles de enfermedad
  takesMedication: boolean;                       // ¿Toma medicamentos?
  medicationDetails?: string;                     // Detalles de medicamentos
  hasAllergies: boolean;                          // ¿Tiene alergias?
  allergiesDetails?: string;                      // Detalles de alergias
  emergencyMedicationAllowed: boolean;            // ¿Autorizado medicamento emergencia?
  hasLearningDisability: boolean;                 // ¿Discapacidad de aprendizaje?
  disabilityDetails?: string;                     // Detalles de discapacidad
  strengths?: string;                             // Fortalezas
  areasToImprove?: string;                        // Áreas de mejora
}
```

### Picture (Foto)

```typescript
interface Picture {
  id: number;
  publicId: string;                  // ID en Cloudinary
  kind: 'profile' | 'document' | 'evidence';  // Tipo de foto
  url: string;                       // URL de Cloudinary
  description?: string;              // Descripción
  uploadedAt: Date;                  // Fecha de carga
  studentId?: number;                // FK a Student
}
```

### ParentChildLink (Relación Padre-Hijo)

```typescript
interface ParentChildLink {
  id: number;
  parentId: number;                  // FK a User (padre)
  studentId: number;                 // FK a Student (hijo)
  relationshipType: string;          // Ej: "Padre", "Madre", "Tutor"
  isPrimaryContact: boolean;         // ¿Es contacto principal?
  hasLegalCustody: boolean;          // ¿Tiene custodia legal?
  canAccessInfo: boolean;            // ¿Puede acceder información?
  livesWithStudent: boolean;         // ¿Vive con el estudiante?
  financialResponsible: boolean;     // ¿Es responsable financiero?
  emergencyContactPriority?: number; // Prioridad en emergencia
  receivesSchoolNotices: boolean;    // ¿Recibe avisos?
}
```

### Enrollment (Matrícula)

```typescript
interface Enrollment {
  id: number;
  studentId: number;                 // FK a Student
  cycleId: number;                   // FK a SchoolCycle
  gradeId: number;                   // FK a Grade
  sectionId: number;                 // FK a Section
  status: 'active' | 'inactive' | 'graduated' | 'withdrawn';
  dateEnrolled: Date;                // Fecha de matrícula
}
```

---

## 💻 Ejemplos de Implementación {#ejemplos}

### React - Servicio HTTP

```javascript
// services/studentService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const studentService = {
  
  // Obtener token (asume que está en localStorage)
  getAuthHeader: () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }),

  // Listar estudiantes
  getStudents: async (page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc') => {
    try {
      const response = await axios.get(`${API_URL}/students`, {
        params: { page, limit, search, sortBy, sortOrder },
        headers: studentService.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      throw error;
    }
  },

  // Obtener estadísticas
  getStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/students/stats`, {
        headers: studentService.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },

  // Obtener estudiante por ID
  getStudentById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/students/${id}`, {
        headers: studentService.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estudiante:', error);
      throw error;
    }
  },

  // Crear estudiante
  createStudent: async (studentData) => {
    try {
      const response = await axios.post(`${API_URL}/students`, studentData, {
        headers: studentService.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear estudiante:', error);
      throw error;
    }
  },

  // Crear estudiante CON matrícula (Unificado) ⭐ NUEVO
  createStudentWithEnrollment: async (studentData) => {
    try {
      const response = await axios.post(`${API_URL}/students/with-enrollment`, studentData, {
        headers: studentService.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear estudiante y matrícula:', error);
      throw error;
    }
  },

  // Actualizar estudiante
  updateStudent: async (id, studentData) => {
    try {
      const response = await axios.patch(`${API_URL}/students/${id}`, studentData, {
        headers: studentService.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar estudiante:', error);
      throw error;
    }
  },

  // Eliminar estudiante
  deleteStudent: async (id) => {
    try {
      await axios.delete(`${API_URL}/students/${id}`, {
        headers: studentService.getAuthHeader()
      });
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      throw error;
    }
  },

  // Validar DPI
  validateDPI: async (dpi) => {
    try {
      const response = await axios.get(`${API_URL}/students/users/validate-dpi/${dpi}`, {
        headers: studentService.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error al validar DPI:', error);
      throw error;
    }
  },

  // Buscar usuario por DPI
  searchUserByDPI: async (dpi) => {
    try {
      const response = await axios.get(`${API_URL}/students/users/search-by-dpi/${dpi}`, {
        headers: studentService.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      throw error;
    }
  },

  // Agregar foto
  addPicture: async (studentId, pictureData) => {
    try {
      const response = await axios.post(`${API_URL}/students/${studentId}/pictures`, pictureData, {
        headers: studentService.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error al agregar foto:', error);
      throw error;
    }
  },

  // Obtener fotos
  getPictures: async (studentId) => {
    try {
      const response = await axios.get(`${API_URL}/students/${studentId}/pictures`, {
        headers: studentService.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener fotos:', error);
      throw error;
    }
  },

  // Eliminar foto
  deletePicture: async (studentId, pictureId) => {
    try {
      await axios.delete(`${API_URL}/students/${studentId}/pictures/${pictureId}`, {
        headers: studentService.getAuthHeader()
      });
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar foto:', error);
      throw error;
    }
  }
};

export default studentService;
```

---

### React - Componente Lista de Estudiantes

```javascript
// components/StudentsList.jsx
import React, { useState, useEffect } from 'react';
import studentService from '../services/studentService';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadStudents();
  }, [page, search]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await studentService.getStudents(page, 10, search);
      
      if (response.success) {
        setStudents(response.data);
        setTotal(response.meta.total);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="students-container">
      <h1>Listado de Estudiantes</h1>

      {/* Búsqueda */}
      <input
        type="text"
        placeholder="Buscar por nombre, apellido o DPI..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {/* Tabla */}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Fecha Nacimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.givenNames}</td>
                  <td>{student.lastNames}</td>
                  <td>{new Date(student.birthDate).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => verDetalle(student.id)}>Ver</button>
                    <button onClick={() => editarEstudiante(student.id)}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          <div className="pagination">
            <button onClick={() => setPage(Math.max(1, page - 1))}>Anterior</button>
            <span>Página {page}</span>
            <button onClick={() => setPage(page + 1)}>Siguiente</button>
          </div>
        </>
      )}
    </div>
  );
}
```

---

### React - Formulario Crear/Editar Estudiante

```javascript
// components/StudentForm.jsx
import React, { useState, useEffect } from 'react';
import studentService from '../services/studentService';

export default function StudentForm({ studentId = null }) {
  const [formData, setFormData] = useState({
    codeSIRE: '',
    givenNames: '',
    lastNames: '',
    birthDate: '',
    gender: '',
    nationality: '',
    municipalityId: '',
    departmentId: '',
    street: '',
    zone: '',
    hasAllergies: false,
    allergiesDetails: '',
    // ... otros campos
  });

  const [loading, setLoading] = useState(false);
  const [dpiValidation, setDpiValidation] = useState(null);

  useEffect(() => {
    if (studentId) {
      loadStudent();
    }
  }, [studentId]);

  const loadStudent = async () => {
    try {
      const response = await studentService.getStudentById(studentId);
      if (response.success) {
        setFormData(response.data);
      }
    } catch (error) {
      alert('Error al cargar estudiante');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleDPIChange = async (e) => {
    const dpi = e.target.value;
    setFormData({ ...formData, dpi });

    if (dpi.length >= 8) {
      try {
        const response = await studentService.validateDPI(dpi);
        setDpiValidation(response.data);
      } catch (error) {
        console.error('Error validando DPI:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (studentId) {
        response = await studentService.updateStudent(studentId, formData);
        alert('Estudiante actualizado');
      } else {
        // ✨ OPCIÓN 1: Crear solo estudiante
        // response = await studentService.createStudent(formData);
        
        // ✨ OPCIÓN 2: Crear estudiante + matrícula (RECOMENDADO)
        response = await studentService.createStudentWithEnrollment(formData);
        alert('Estudiante y matrícula creados');
        setFormData({}); // Limpiar formulario
      }

      if (response.success) {
        // Redirigir o actualizar lista
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>{studentId ? 'Editar' : 'Crear'} Estudiante</h1>

      {/* Validación de DPI */}
      <div>
        <label>DPI (Documento de Identidad)</label>
        <input
          type="text"
          name="dpi"
          placeholder="13 dígitos"
          onChange={handleDPIChange}
          maxLength="13"
        />
        {dpiValidation && (
          <div className={dpiValidation.available ? 'success' : 'warning'}>
            {dpiValidation.message}
            {!dpiValidation.available && dpiValidation.userInfo && (
              <p>Usuario existente: {dpiValidation.userInfo.givenNames} {dpiValidation.userInfo.lastNames}</p>
            )}
          </div>
        )}
      </div>

      {/* Datos Personales */}
      <div>
        <label>Nombres *</label>
        <input
          type="text"
          name="givenNames"
          value={formData.givenNames}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label>Apellidos *</label>
        <input
          type="text"
          name="lastNames"
          value={formData.lastNames}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label>Fecha de Nacimiento *</label>
        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label>Género</label>
        <select name="gender" value={formData.gender} onChange={handleInputChange}>
          <option value="">Seleccionar</option>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
          <option value="O">Otro</option>
        </select>
      </div>

      {/* Información Médica */}
      <fieldset>
        <legend>Información Médica</legend>

        <label>
          <input
            type="checkbox"
            name="hasAllergies"
            checked={formData.hasAllergies}
            onChange={handleInputChange}
          />
          Tiene alergias
        </label>

        {formData.hasAllergies && (
          <textarea
            name="allergiesDetails"
            placeholder="Detallar alergias..."
            value={formData.allergiesDetails}
            onChange={handleInputChange}
          />
        )}
      </fieldset>

      {/* Botones */}
      <div>
        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={() => window.history.back()}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
```

---

### React - Formulario Completo con Matricula ⭐ NUEVO

```javascript
// components/StudentFormWithEnrollment.jsx
import React, { useState, useEffect } from 'react';
import studentService from '../services/studentService';
import schoolCycleService from '../services/schoolCycleService'; // Nuevo

export default function StudentFormWithEnrollment() {
  const [formData, setFormData] = useState({
    // Datos del estudiante
    codeSIRE: '',
    givenNames: '',
    lastNames: '',
    birthDate: '',
    gender: '',
    municipalityId: '',
    departmentId: '',
    street: '',
    zone: '',
    hasAllergies: false,
    allergiesDetails: '',
    
    // Datos de matrícula
    enrollment: {
      cycleId: null,
      gradeId: null,
      sectionId: null,
      status: 'active'
    }
  });

  const [cycles, setCycles] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dpiValidation, setDpiValidation] = useState(null);

  // Cargar ciclos activos con estructura
  useEffect(() => {
    loadActiveCycles();
  }, []);

  const loadActiveCycles = async () => {
    try {
      const response = await schoolCycleService.getActiveCyclesWithStructure();
      if (response.success) {
        setCycles(response.data);
      }
    } catch (error) {
      console.error('Error al cargar ciclos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Cuando cambia el ciclo
  const handleCycleChange = (e) => {
    const cycleId = parseInt(e.target.value);
    setFormData({
      ...formData,
      enrollment: { ...formData.enrollment, cycleId, gradeId: null, sectionId: null }
    });

    // Buscar grados del ciclo
    const cycle = cycles.find(c => c.id === cycleId);
    if (cycle) {
      setGrades(cycle.grades || []);
      setSections([]);
    }
  };

  // Cuando cambia el grado
  const handleGradeChange = (e) => {
    const gradeId = parseInt(e.target.value);
    setFormData({
      ...formData,
      enrollment: { ...formData.enrollment, gradeId, sectionId: null }
    });

    // Buscar secciones del grado
    const grade = grades.find(g => g.id === gradeId);
    if (grade) {
      setSections(grade.sections || []);
    }
  };

  // Cuando cambia la sección
  const handleSectionChange = (e) => {
    const sectionId = parseInt(e.target.value);
    setFormData({
      ...formData,
      enrollment: { ...formData.enrollment, sectionId }
    });
  };

  const handleDPIChange = async (e) => {
    const dpi = e.target.value;
    // setFormData({ ...formData, dpi }); // Si está en Student

    if (dpi.length >= 8) {
      try {
        const response = await studentService.validateDPI(dpi);
        setDpiValidation(response.data);
      } catch (error) {
        console.error('Error validando DPI:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar que se hayan seleccionado ciclo, grado y sección
      if (!formData.enrollment.cycleId || !formData.enrollment.gradeId || !formData.enrollment.sectionId) {
        alert('Por favor selecciona Ciclo, Grado y Sección');
        setLoading(false);
        return;
      }

      // Llamar endpoint unificado
      const response = await studentService.createStudentWithEnrollment(formData);
      
      if (response.success) {
        alert('¡Estudiante y matrícula creados exitosamente!');
        console.log('Student ID:', response.data.student.id);
        console.log('Enrollment ID:', response.data.enrollment.id);
        
        // Limpiar formulario
        setFormData({
          codeSIRE: '',
          givenNames: '',
          lastNames: '',
          birthDate: '',
          gender: '',
          municipalityId: '',
          departmentId: '',
          street: '',
          zone: '',
          hasAllergies: false,
          allergiesDetails: '',
          enrollment: {
            cycleId: null,
            gradeId: null,
            sectionId: null,
            status: 'active'
          }
        });
        setGrades([]);
        setSections([]);
        // Redirigir a lista de estudiantes
        // window.location.href = '/students';
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error al guardar estudiante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Registrar Nuevo Estudiante</h1>

      {/* SECCIÓN 1: Datos Personales */}
      <fieldset>
        <legend>Datos Personales</legend>

        <div>
          <label>Nombres *</label>
          <input
            type="text"
            name="givenNames"
            value={formData.givenNames}
            onChange={handleInputChange}
            placeholder="Juan"
            required
          />
        </div>

        <div>
          <label>Apellidos *</label>
          <input
            type="text"
            name="lastNames"
            value={formData.lastNames}
            onChange={handleInputChange}
            placeholder="Pérez García"
            required
          />
        </div>

        <div>
          <label>Fecha de Nacimiento *</label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Género</label>
          <select name="gender" value={formData.gender} onChange={handleInputChange}>
            <option value="">Seleccionar</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>
      </fieldset>

      {/* SECCIÓN 2: Información Médica */}
      <fieldset>
        <legend>Información Médica</legend>

        <label>
          <input
            type="checkbox"
            name="hasAllergies"
            checked={formData.hasAllergies}
            onChange={handleInputChange}
          />
          Tiene alergias
        </label>

        {formData.hasAllergies && (
          <textarea
            name="allergiesDetails"
            placeholder="Detallar alergias..."
            value={formData.allergiesDetails}
            onChange={handleInputChange}
          />
        )}
      </fieldset>

      {/* SECCIÓN 3: Matricula (NUEVA) ⭐ */}
      <fieldset>
        <legend>Asignación Académica *</legend>

        <div>
          <label>Ciclo Escolar *</label>
          <select
            value={formData.enrollment.cycleId || ''}
            onChange={handleCycleChange}
            required
          >
            <option value="">-- Selecciona un ciclo --</option>
            {cycles.map(cycle => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name} ({cycle.year})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Grado *</label>
          <select
            value={formData.enrollment.gradeId || ''}
            onChange={handleGradeChange}
            disabled={!formData.enrollment.cycleId}
            required
          >
            <option value="">-- Selecciona un grado --</option>
            {grades.map(grade => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Sección *</label>
          <select
            value={formData.enrollment.sectionId || ''}
            onChange={handleSectionChange}
            disabled={!formData.enrollment.gradeId}
            required
          >
            <option value="">-- Selecciona una sección --</option>
            {sections.map(section => (
              <option key={section.id} value={section.id}>
                {section.name} (Capacidad: {section.capacity})
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      {/* Botones */}
      <div>
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'REGISTRAR ESTUDIANTE'}
        </button>
        <button type="button" onClick={() => window.history.back()}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
```

**Flujo del Componente:**
1. ✅ Se cargan ciclos activos al montar
2. ✅ Usuario llena datos del estudiante
3. ✅ Usuario selecciona Ciclo
4. ✅ Se cargan Grados del ciclo
5. ✅ Usuario selecciona Grado
6. ✅ Se cargan Secciones del grado
7. ✅ Usuario selecciona Sección
8. ✅ Usuario presiona REGISTRAR
9. ✅ Se envía TODO (Student + Enrollment) en una sola llamada
10. ✅ Backend crea ambos registros automáticamente

---

### React - Validación de DPI en Tiempo Real

```javascript
// hooks/useDPIValidation.js
import { useState, useCallback } from 'react';
import studentService from '../services/studentService';

export function useDPIValidation() {
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateDPI = useCallback(async (dpi) => {
    if (!dpi || dpi.length < 8) {
      setValidation(null);
      return;
    }

    try {
      setLoading(true);
      const response = await studentService.validateDPI(dpi);
      setValidation(response.data);
    } catch (error) {
      console.error('Error:', error);
      setValidation(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { validation, loading, validateDPI };
}

// Uso en componente:
// const { validation, loading, validateDPI } = useDPIValidation();
// <input onChange={(e) => validateDPI(e.target.value)} />
// {validation && (
//   <p>{validation.message}</p>
// )}
```

---

## ⚠️ Manejo de Errores {#errores}

### Códigos de Error Comunes

| Código | Significado | Acción |
|--------|-----------|--------|
| 400 | Bad Request | Validar entrada de datos |
| 401 | Unauthorized | Token expirado, re-autenticar |
| 403 | Forbidden | Sin permisos, verificar roles |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | DPI duplicado, datos conflictivos |
| 500 | Server Error | Error del servidor, reintentar |

### Estructura de Error

```json
{
  "statusCode": 400,
  "message": "El DPI ya existe en el sistema",
  "error": "Bad Request"
}
```

### Manejo en React

```javascript
try {
  const response = await studentService.createStudent(data);
} catch (error) {
  const status = error.response?.status;
  const message = error.response?.data?.message;

  switch (status) {
    case 400:
      alert(`Datos inválidos: ${message}`);
      break;
    case 401:
      // Redirigir a login
      window.location.href = '/login';
      break;
    case 403:
      alert('No tienes permisos para esta acción');
      break;
    case 404:
      alert('Estudiante no encontrado');
      break;
    case 409:
      alert(`Conflicto: ${message}`);
      break;
    default:
      alert('Error al procesar la solicitud');
  }
}
```

---

## ✅ Validaciones {#validaciones}

### Validaciones en Frontend

Antes de enviar al backend:

```javascript
const validateStudentForm = (data) => {
  const errors = [];

  // Nombres requeridos
  if (!data.givenNames?.trim()) errors.push('Nombres requeridos');
  if (!data.lastNames?.trim()) errors.push('Apellidos requeridos');

  // Fecha de nacimiento válida
  if (!data.birthDate) errors.push('Fecha de nacimiento requerida');
  if (new Date(data.birthDate) > new Date()) errors.push('Fecha de nacimiento inválida');

  // Género válido
  if (data.gender && !['M', 'F', 'O'].includes(data.gender)) {
    errors.push('Género inválido');
  }

  // SIRE único (validar con backend si es necesario)
  if (data.codeSIRE && data.codeSIRE.length > 50) {
    errors.push('SIRE muy largo');
  }

  return errors;
};

// Uso
const errors = validateStudentForm(formData);
if (errors.length > 0) {
  alert(errors.join('\n'));
  return;
}
```

### Validaciones en Backend (Zod)

El backend valida automáticamente usando Zod:

- ✅ Tipos de datos
- ✅ Rangos de valores
- ✅ Formatos (email, URL, etc.)
- ✅ Valores únicos (SIRE, DPI)
- ✅ Referencias existentes (municipalityId, departmentId)

---

## 🎨 Integración en Componentes {#componentes}

### Estructura Recomendada

```
src/
├── pages/
│   ├── Students/
│   │   ├── StudentsList.jsx
│   │   ├── StudentDetail.jsx
│   │   ├── StudentForm.jsx
│   │   └── StudentDashboard.jsx
│   └── index.js
├── components/
│   ├── StudentCard.jsx
│   ├── StudentTable.jsx
│   ├── StudentFormModal.jsx
│   └── DPIValidator.jsx
├── services/
│   └── studentService.js
├── hooks/
│   ├── useDPIValidation.js
│   ├── useStudents.js
│   └── useStudent.js
├── utils/
│   ├── validators.js
│   └── formatters.js
└── api/
    └── client.js
```

### Hook Personalizado - useStudents

```javascript
// hooks/useStudents.js
import { useState, useEffect, useCallback } from 'react';
import studentService from '../services/studentService';

export function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const fetchStudents = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await studentService.getStudents(page, 10, search);
      if (response.success) {
        setStudents(response.data);
        setPagination({
          page: response.meta.page,
          limit: response.meta.limit,
          total: response.meta.total
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createStudent = useCallback(async (data) => {
    try {
      const response = await studentService.createStudent(data);
      if (response.success) {
        setStudents([...students, response.data]);
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [students]);

  const updateStudent = useCallback(async (id, data) => {
    try {
      const response = await studentService.updateStudent(id, data);
      if (response.success) {
        setStudents(students.map(s => s.id === id ? response.data : s));
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [students]);

  const deleteStudent = useCallback(async (id) => {
    try {
      await studentService.deleteStudent(id);
      setStudents(students.filter(s => s.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [students]);

  return {
    students,
    loading,
    error,
    pagination,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent
  };
}

// Uso:
// const { students, loading, fetchStudents } = useStudents();
// useEffect(() => { fetchStudents(1, ''); }, []);
```

---

## 📋 Resumen de Integración

### Checklist

- [ ] Token JWT configurado en headers
- [ ] Servicio HTTP creado (`studentService.js`)
- [ ] Componentes lista/detalle implementados
- [ ] Formulario con validación DPI
- [ ] Validación de permisos RBAC
- [ ] Manejo de errores completo
- [ ] Loading states implementados
- [ ] Paginación configurada
- [ ] Búsqueda funcional
- [ ] Fotos/Cloudinary integrado

### URL Base

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

### Environment Variables

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_JWT_TOKEN_KEY=access_token
```

---

**Documentación Generada:** 2 de Noviembre de 2025
**Versión:** 1.0
**Estado:** ✅ Producción
