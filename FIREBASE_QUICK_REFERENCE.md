# Firebase Setup - Quick Reference Card

## What is Firebase?
Cloud database by Google. Your data is on Google's servers, accessible from anywhere.

## Your Firebase Project
- **Project ID:** insight-attendance-system
- **Database:** Firestore (NoSQL)
- **Storage:** Cloud Storage (for photos)
- **Auth:** Firebase Authentication

---

## 3 Steps to Start Using Firebase

### Step 1: Go to Firebase Console
https://console.firebase.google.com/

### Step 2: Set Firestore Rules
- Select "insight-attendance-system" project
- Go to: Firestore Database → Rules
- Paste this:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
- Click "Publish"

### Step 3: Update Your React Pages
Replace localStorage code with Firebase service functions.

---

## File Locations

| What | Where |
|------|-------|
| Firebase config | `src/config/firebase.ts` |
| Student functions | `src/services/studentService.ts` |
| Teacher functions | `src/services/teacherService.ts` |
| Login functions | `src/services/authService.ts` |
| Full guide | `FIREBASE_SETUP_GUIDE.md` |
| Summary | `FIREBASE_SETUP_SUMMARY.md` |

---

## Most Used Functions

### Get Students
```typescript
import { getAllStudents } from '../services/studentService';
const students = await getAllStudents();
```

### Add Student
```typescript
import { addStudent } from '../services/studentService';
const id = await addStudent({
  firstName: 'Ram',
  lastName: 'Kumar',
  rollNo: 'STU001',
  // ... other fields
});
```

### Update Student
```typescript
import { updateStudent } from '../services/studentService';
await updateStudent('studentId', { status: 'Active' });
```

### Upload Photo
```typescript
import { uploadStudentPhoto } from '../services/studentService';
const photoURL = await uploadStudentPhoto('studentId', fileObject);
```

### Update Status
```typescript
import { updateStudentStatus } from '../services/studentService';
await updateStudentStatus('studentId', 'Active');
```

### Update Attendance
```typescript
import { updateStudentAttendance } from '../services/studentService';
await updateStudentAttendance('studentId', [{
  date: '2025-12-12',
  status: 'Present'
}]);
```

### Delete Student
```typescript
import { deleteStudent } from '../services/studentService';
await deleteStudent('studentId');
```

---

## Same Functions for Teachers

Replace `studentService` with `teacherService`:
- `getAllTeachers()`
- `getTeacherById(id)`
- `addTeacher(data)`
- `updateTeacher(id, data)`
- `deleteTeacher(id)`
- `uploadTeacherPhoto(id, file)`
- `updateTeacherStatus(id, status)`
- `updateTeacherAttendance(id, records)`
- `searchTeachers(query)`

---

## Authentication Functions

```typescript
import { loginUser, logoutUser, getCurrentUser, isUserLoggedIn } from '../services/authService';

// Login
await loginUser('email@example.com', 'password');

// Logout
await logoutUser();

// Check if logged in
if (isUserLoggedIn()) { /* ... */ }

// Get current user
const user = getCurrentUser();
```

---

## Database Collections

Automatically created when you add data:

```
Firestore Database
├── students/ (collection)
│   └── doc1, doc2, doc3... (documents)
│
└── teachers/ (collection)
    └── doc1, doc2, doc3... (documents)

Cloud Storage
├── student-photos/
└── teacher-photos/
```

---

## Common Pattern: Fetch & Update UI

```typescript
import { getAllStudents } from '../services/studentService';

const [students, setStudents] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetch = async () => {
    setLoading(true);
    try {
      const data = await getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetch();
}, []);

if (loading) return <div>Loading...</div>;
return <div>{students.length} students</div>;
```

---

## Error Handling Template

```typescript
try {
  // Your Firebase operation
  const data = await getAllStudents();
  setStudents(data);
} catch (error) {
  console.error('Error:', error);
  
  // Show error to user
  if (error.code === 'permission-denied') {
    alert('You don\'t have permission to access this');
  } else {
    alert('Something went wrong: ' + error.message);
  }
}
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Firebase not initialized" | Run `npm install firebase` |
| "Permission denied" | Set Firestore rules (Step 2) |
| "Photo not uploading" | Check Storage permissions in Firebase Console |
| "Can't find studentService" | Check file path: `src/services/studentService.ts` |
| Data not showing | Check browser console for errors |
| All operations slow | Check Firestore indexes |

---

## Next: Update Pages

All your pages need to be updated to use Firebase. Let me know which one to start with:

1. StudentDashboard
2. StudentView
3. AddStudent
4. EditStudent
5. TeacherDashboard
6. TeacherView
7. AddTeacher
8. EditTeacher

Say "update StudentDashboard" and I'll do it! 🚀
