# 🆕 New Centralized Endpoint for Section Students

## Summary

Created a new centralized endpoint to fetch all students from a section with complete attendance-related information. This solves the problem of not being able to show students when querying the attendance records endpoint (which only returns existing attendance records).

---

## 📋 Endpoint Specification

### HTTP Request
```
GET /api/attendance/section/:sectionId/students?cycleId=5&status=ACTIVE
```

### Parameters
- **sectionId** (path, required): ID of the section
- **cycleId** (query, optional): Filter by school cycle (defaults to active cycle)
- **status** (query, optional): `ACTIVE`, `INACTIVE`, or `ALL` (default: `ACTIVE`)

### Response Format (200 OK)
```json
{
  "success": true,
  "data": {
    "section": {
      "id": 1,
      "name": "4-A",
      "gradeId": 2,
      "gradeName": "Cuarto Grado"
    },
    "cycle": {
      "id": 5,
      "name": "2025",
      "startDate": "2025-01-15",
      "endDate": "2025-12-15",
      "isActive": true
    },
    "enrollmentCount": 35,
    "students": [
      {
        "enrollmentId": 1001,
        "enrollmentStatus": "ACTIVE",
        "studentId": 50,
        "firstName": "Juan",
        "lastName": "Pérez García",
        "fullName": "Juan Pérez García",
        "studentCode": "STU-2025-001",
        "email": "juan.perez@school.edu",
        "phone": "555-0001",
        "picture": {
          "id": 10,
          "url": "https://api.school.edu/pictures/50.jpg",
          "format": "jpg"
        },
        "enrollmentDate": "2025-01-15",
        "enrollmentEndDate": null,
        "enrollmentReason": "NEW_STUDENT"
      },
      // ... more students
    ]
  }
}
```

---

## 🚀 Frontend Implementation

### 1. Use the Hook
```tsx
import { useSectionStudents } from '@/hooks/attendance';

function MyComponent() {
  const { students, section, cycle, isLoading, error, fetchStudents } = useSectionStudents();

  useEffect(() => {
    fetchStudents(1); // sectionId = 1
  }, []);

  return (
    <div>
      {students.map(student => (
        <div key={student.enrollmentId}>
          {student.fullName}
        </div>
      ))}
    </div>
  );
}
```

### 2. Use the Component
```tsx
import { StudentAttendanceList, useAttendanceStatuses } from '@/components/features/attendance';

function AttendancePage() {
  const { statuses } = useAttendanceStatuses();
  const [selectedStatuses, setSelectedStatuses] = useState(new Map());

  const handleStudentSelect = (enrollmentId: number, statusId: number) => {
    const newStatuses = new Map(selectedStatuses);
    newStatuses.set(enrollmentId, statusId);
    setSelectedStatuses(newStatuses);
  };

  return (
    <StudentAttendanceList
      sectionId={1}
      cycleId={5}
      statuses={statuses}
      onStudentSelect={handleStudentSelect}
      selectedStatuses={selectedStatuses}
    />
  );
}
```

---

## 📁 Files Created/Modified

### New Files
1. **Backend Endpoint** (TO BE IMPLEMENTED)
   - File: `src/attendance/attendance.controller.ts`
   - Method: `getSectionStudents(sectionId, cycleId?, status?)`

2. **Frontend Hook**
   - File: `src/hooks/attendance/useSectionStudents.ts`
   - Export: `useSectionStudents()`

3. **Frontend Component**
   - File: `src/components/features/attendance/components/StudentAttendanceList.tsx`
   - Export: `StudentAttendanceList`

4. **Documentation**
   - File: `docs/Sistema de asistencia/NEW_ENDPOINT_SECTION_STUDENTS.md`

### Modified Files
1. `src/hooks/attendance/index.ts` - Added export for `useSectionStudents`
2. `src/components/features/attendance/components/index.ts` - Added export for `StudentAttendanceList`

---

## ✅ Use Cases

### Use Case 1: Teacher Marking Attendance
```
1. Teacher selects section → loads students
2. System calls: GET /api/attendance/section/1/students
3. Shows list of all students with selection dropdowns
4. Teacher selects status for each (Present, Absent, Tardy, etc)
5. Teacher submits → POST /api/attendance/register
```

### Use Case 2: Administrator Viewing Section
```
1. Admin wants to see all students in a section
2. System calls: GET /api/attendance/section/2/students?status=ALL
3. Shows students with all enrollment statuses
4. Can filter by status, cycle, or search by name
```

### Use Case 3: Correcting Attendance Records
```
1. Secretary needs to correct attendance for a specific section/date
2. System calls: GET /api/attendance/section/3/students
3. Shows current students
4. Can update attendance records for specific enrollments
```

---

## 🔄 Workflow Integration

### Before (Problem)
```
GET /api/attendance/section/1/cycle/5/date/2025-11-19
↓
Response: { "success": false, "message": "No attendance records found" }
↓
Result: Can't show students! ❌
```

### After (Solution)
```
GET /api/attendance/section/1/students?cycleId=5
↓
Response: { students: [...], section: {...}, cycle: {...} }
↓
Result: Show students list! ✅
↓
Teacher marks attendance
↓
POST /api/attendance/register
↓
Response: Attendance saved successfully ✅
```

---

## 📊 Data Included

Each student object includes:

| Field | Type | Purpose |
|-------|------|---------|
| `enrollmentId` | number | **PRIMARY** - Use this to mark attendance |
| `enrollmentStatus` | string | Show which students are active |
| `studentId` | number | Reference to student record |
| `firstName`, `lastName`, `fullName` | string | Display in UI |
| `studentCode` | string | Student ID code |
| `email`, `phone` | string | Contact info |
| `picture` | object | Profile photo URL |
| `enrollmentDate` | date | When enrolled |
| `enrollmentReason` | string | How they enrolled (NEW_STUDENT, TRANSFER_IN, etc) |

---

## 🔐 Authorization

The endpoint enforces:
- ✅ User must be authenticated
- ✅ User role must have attendance permission
- ✅ User scope allows access to this section:
  - `ALL`: Can access any section
  - `GRADE`: Only sections in their grade
  - `SECTION`: Only their assigned section
  - `OWN`: Only sections where they teach
  - `DEPARTMENT`: Only sections in their department

---

## 🧪 Testing the Endpoint

### Test 1: Get all students in a section
```bash
curl "http://localhost:5000/api/attendance/section/1/students" \
  -H "Cookie: JWT=your_token"
```

### Test 2: Get only active students
```bash
curl "http://localhost:5000/api/attendance/section/1/students?status=ACTIVE" \
  -H "Cookie: JWT=your_token"
```

### Test 3: Get for specific cycle
```bash
curl "http://localhost:5000/api/attendance/section/1/students?cycleId=5" \
  -H "Cookie: JWT=your_token"
```

---

## 🛠️ Backend Implementation TODO

- [ ] Create DTO: `GetSectionStudentsResponseDto`
- [ ] Create method in AttendanceService: `getSectionStudents()`
- [ ] Create endpoint in AttendanceController: `GET /api/attendance/section/:id/students`
- [ ] Add authorization checks
- [ ] Add error handling (section not found, no students, access denied)
- [ ] Optimize query (use includes/relations to avoid N+1)
- [ ] Add unit tests
- [ ] Add Swagger/OpenAPI documentation
- [ ] Test with different user roles/scopes

---

## 📈 Performance Notes

### Recommended Database Indexes
```sql
CREATE INDEX idx_enrollment_section_status 
  ON "Enrollment"(sectionId, status);

CREATE INDEX idx_student_enrollment_id 
  ON "Student"(id);

CREATE INDEX idx_picture_student_id 
  ON "Picture"(studentId);
```

### Query Optimization
- Use `leftJoin` for picture (optional relationship)
- Load relations: `Student`, `Picture`, enrollment status
- Order by: `firstName ASC`, `lastName ASC`
- Filter by status and cycle if provided

---

## 🔗 Related Endpoints

| Endpoint | Purpose |
|----------|---------|
| **GET** `/api/attendance/section/:id/students` | [NEW] Get students for attendance |
| **POST** `/api/attendance/register` | Register attendance for students |
| **GET** `/api/attendance/section/:id/cycle/:cycleId/date/:date` | Get attendance records |
| **GET** `/api/enrollment/section/:id` | Alternative (less detailed) |
| **GET** `/api/attendance-statuses` | Get status types |

---

## 📝 Summary

This endpoint centralizes student information needed for attendance marking. Instead of trying to work with attendance records when none exist, we now have a dedicated endpoint that always returns the full list of enrolled students, making it easy to:

✅ Show all students in a section  
✅ Mark attendance for each  
✅ Handle empty sections gracefully  
✅ Support filtering by status  
✅ Include all relevant student data  
✅ Enforce proper authorization  

---

**Status**: Ready for Backend Implementation  
**Frontend**: ✅ Hook and Component Created  
**Documentation**: ✅ Complete
