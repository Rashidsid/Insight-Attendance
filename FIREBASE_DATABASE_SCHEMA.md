# Firebase Database Schema - Your Data Structure

## Student Data Structure

Each student document in Firestore will look like this:

```json
{
  "id": "auto-generated-by-firebase",
  "firstName": "Ram",
  "lastName": "Kumar",
  "rollNo": "STU001",
  "class": "10-A",
  "section": "Science",
  "dateOfBirth": "2008-05-15",
  "gender": "Male",
  "email": "ram@example.com",
  "phone": "+91 98765 43210",
  "address": "123 Main St, City",
  "parentName": "Raj Kumar",
  "parentPhone": "+91 98765 43211",
  "parentEmail": "raj.kumar@example.com",
  "status": "Active",
  "attendance": "92%",
  "photo": "https://firebase-storage-url.jpg",
  "recentAttendance": [
    {
      "date": "2025-12-12",
      "status": "Present"
    },
    {
      "date": "2025-12-11",
      "status": "Absent"
    },
    {
      "date": "2025-12-10",
      "status": "Present"
    }
  ],
  "createdAt": "2025-12-01T10:30:00Z",
  "updatedAt": "2025-12-12T15:45:00Z"
}
```

---

## Teacher Data Structure

Each teacher document in Firestore will look like this:

```json
{
  "id": "auto-generated-by-firebase",
  "firstName": "John",
  "lastName": "Doe",
  "teacherId": "TCH001",
  "subject": "Mathematics",
  "classes": "10-A, 10-B",
  "dateOfBirth": "1985-08-20",
  "gender": "Male",
  "email": "john.doe@example.com",
  "phone": "+91 98765 54321",
  "address": "456 Oak Ave, City",
  "qualification": "M.Sc. in Mathematics",
  "experience": "15",
  "joiningDate": "2010-08-01",
  "status": "Active",
  "photo": "https://firebase-storage-url.jpg",
  "recentAttendance": [
    {
      "date": "2025-12-12",
      "status": "Present"
    },
    {
      "date": "2025-12-11",
      "status": "Present"
    }
  ],
  "createdAt": "2025-12-01T10:30:00Z",
  "updatedAt": "2025-12-12T15:45:00Z"
}
```

---

## Firestore Collections Layout

```
Firestore
│
├─── students/ (collection)
│     ├─── document: "auto-id-1"
│     │     ├─── firstName: "Ram"
│     │     ├─── lastName: "Kumar"
│     │     ├─── status: "Active"
│     │     ├─── recentAttendance: [...]
│     │     └─── ... (other fields)
│     │
│     ├─── document: "auto-id-2"
│     │     ├─── firstName: "Shyam"
│     │     ├─── lastName: "Singh"
│     │     └─── ... (other fields)
│     │
│     └─── document: "auto-id-3"
│           ├─── firstName: "Farhan"
│           └─── ... (other fields)
│
└─── teachers/ (collection)
      ├─── document: "auto-id-1"
      │     ├─── firstName: "John"
      │     ├─── lastName: "Doe"
      │     ├─── subject: "Mathematics"
      │     └─── ... (other fields)
      │
      └─── document: "auto-id-2"
            ├─── firstName: "Jane"
            └─── ... (other fields)
```

---

## Cloud Storage Layout

Photos are stored separately in Cloud Storage:

```
Cloud Storage
│
├─── student-photos/
│     ├─── auto-id-1-1702380000000.jpg
│     ├─── auto-id-2-1702380001000.jpg
│     └─── auto-id-3-1702380002000.jpg
│
└─── teacher-photos/
      ├─── auto-id-1-1702380010000.jpg
      └─── auto-id-2-1702380011000.jpg
```

---

## Field Types

| Field | Type | Example | Required |
|-------|------|---------|----------|
| firstName | String | "Ram" | ✅ Yes |
| lastName | String | "Kumar" | ✅ Yes |
| rollNo (Student) | String | "STU001" | ✅ Yes |
| teacherId (Teacher) | String | "TCH001" | ✅ Yes |
| class | String | "10-A" | ✅ Yes |
| section | String | "Science" | ✅ Yes |
| status | String | "Active" or "Inactive" | ✅ Yes |
| email | String | "ram@example.com" | ✅ Yes |
| phone | String | "+91 98765 43210" | ✅ Yes |
| address | String | "123 Main St, City" | ✅ Yes |
| photo | String (URL) | "https://..." | ❌ Optional |
| recentAttendance | Array | [{date, status}, ...] | ❌ Optional |
| createdAt | Timestamp | Auto (Firebase) | 🤖 Auto |
| updatedAt | Timestamp | Auto (Firebase) | 🤖 Auto |

---

## Status Values

### Students
- `"Active"` - Student is currently enrolled
- `"Inactive"` - Student is not enrolled

### Teachers
- `"Active"` - Teacher is currently teaching
- `"On Leave"` - Teacher is on leave

---

## Attendance Status Values

- `"Present"` - Student/Teacher was present
- `"Absent"` - Student/Teacher was absent
- `"Late"` - Student/Teacher arrived late

---

## How Data Flows

### 1. Add New Student
```
User fills form → addStudent() → Firebase stores → Auto ID generated → Return ID
```

### 2. Get Student List
```
Page loads → getAllStudents() → Firebase returns all → Display in UI
```

### 3. Update Student Status
```
User clicks status button → updateStudentStatus(id, newStatus) → Firebase updates → UI reflects change
```

### 4. Upload Photo
```
User selects file → uploadStudentPhoto(id, file) → Uploaded to Storage → Get URL → Save URL in student document
```

### 5. Update Attendance
```
User marks attendance → updateStudentAttendance(id, records) → Firebase updates recentAttendance array
```

---

## Example: Complete Flow for Adding a Student

```typescript
import { addStudent, uploadStudentPhoto, updateStudent } from '../services/studentService';

// 1. Create student object
const studentData = {
  firstName: 'Ram',
  lastName: 'Kumar',
  rollNo: 'STU001',
  class: '10-A',
  section: 'Science',
  dateOfBirth: '2008-05-15',
  gender: 'Male',
  email: 'ram@example.com',
  phone: '+91 98765 43210',
  address: '123 Main St, City',
  parentName: 'Raj Kumar',
  parentPhone: '+91 98765 43211',
  parentEmail: 'raj.kumar@example.com',
  status: 'Active',
  attendance: '92%',
};

// 2. Add student to Firebase
const studentId = await addStudent(studentData);

// 3. Upload photo if provided
if (photoFile) {
  const photoURL = await uploadStudentPhoto(studentId, photoFile);
  
  // 4. Update student document with photo URL
  await updateStudent(studentId, { photo: photoURL });
}

// 5. Student is now in Firebase database!
```

---

## Example: Complete Flow for Updating Attendance

```typescript
import { updateStudentAttendance } from '../services/studentService';

// Current attendance records
const attendance = [
  { date: '2025-12-12', status: 'Present' },
  { date: '2025-12-11', status: 'Absent' },
  { date: '2025-12-10', status: 'Present' },
];

// User marks attendance for today
attendance.unshift({
  date: '2025-12-13',
  status: 'Present'
});

// Update in Firebase
await updateStudentAttendance(studentId, attendance);
```

---

## What Changes from localStorage?

| Aspect | localStorage | Firebase |
|--------|-------------|----------|
| Storage | Your computer | Google's servers |
| Access | Only from this device | From anywhere |
| Multiple users | One person only | Everyone can access |
| Photo storage | Base64 strings (huge) | URLs to Cloud Storage (small) |
| Backup | None (if cleared, data lost) | Auto backup |
| Speed | Very fast (local) | Fast (cloud) |
| Sync | Manual (refresh page) | Real-time updates |

---

## Next Steps

1. ✅ Firebase is installed
2. ✅ Services are created
3. ⏳ You need to set Firestore rules
4. ⏳ Pages need to be updated to use services

Ready to update your pages? Which one first?
