# Email System Setup Guide

## Issue: Emails Not Being Sent

If you're not receiving emails when adding students or teachers, follow these steps to fix it.

---

## 🔴 Problem Analysis

### Console Errors You Might See:
```
Error sending student welcome email: FirebaseError: internal
POST https://...firebase...functions...sendEmail net::ERR_FAILED
```

### Root Causes:
1. ❌ Gmail App Password not configured
2. ❌ Firebase Cloud Functions not deployed
3. ❌ Two-Factor Authentication not enabled on Gmail
4. ❌ Less secure app access blocked

---

## ✅ Solution: Setup Gmail for Automated Emails

### Step 1: Enable Two-Factor Authentication on Gmail

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Look for "How you sign in to Google" section
3. Click on **"2-Step Verification"**
4. Follow the prompts to enable 2FA
5. Verify with your phone

### Step 2: Create Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Find **"App passwords"** (appears after 2FA is enabled)
3. Select:
   - **App:** `Mail`
   - **Device:** `Windows PC` (or your device)
4. Google will generate a **16-character password**
5. **Copy this password** - you'll use it next

### Step 3: Update Firebase Cloud Function

**Location:** `functions/src/index.ts`

Replace these lines with your Gmail details:

```typescript
// Configure your Gmail account - Use environment variables in production
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "YOUR_EMAIL@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_APP_PASSWORD || "YOUR_16_CHAR_APP_PASSWORD";
```

**Example:**
```typescript
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "alhurfoods@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_APP_PASSWORD || "abcd efgh ijkl mnop";
```

### Step 4: Deploy Firebase Functions

Run this command in your project root:

```bash
# Make sure you have Firebase CLI installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy only functions
firebase deploy --only functions
```

**Note:** If Firebase CLI is not installed:
```bash
npm install -g firebase-tools
# On Windows, restart your terminal after installation
```

---

## 🧪 Testing the Email System

### Test Email Sending:

1. Navigate to **Admin Dashboard → Admin Settings**
2. Check the **Email Configuration** section
3. Add a test student or teacher with **your own email address**
4. Wait 5-10 seconds
5. **Check your inbox** (and spam folder)

### Expected Email Content:

For Students:
- ✅ Institution name
- ✅ Full name
- ✅ Roll Number (ID)
- ✅ Class
- ✅ Section
- ✅ Welcome message

For Teachers:
- ✅ Institution name
- ✅ Full name
- ✅ Teacher ID
- ✅ Subject assigned
- ✅ Welcome message

---

## 🔍 Debugging Email Issues

### Check Firebase Functions Logs:

```bash
firebase functions:log
```

### Common Errors & Solutions:

| Error | Cause | Fix |
|-------|-------|-----|
| `Authentication failed` | Wrong app password | Get new app password from Google Account |
| `Email authentication failed` | 2FA not enabled | Enable 2-Step Verification on Gmail |
| `Invalid email format` | Bad email in student form | Ensure valid email address (e.g., user@gmail.com) |
| `CORS error` | Firewall or local issue | Check internet connection, try different network |
| `FirebaseError: internal` | Cloud Function crashed | Check `firebase functions:log` for details |

### Manual Testing in Browser Console:

```javascript
// Check pending emails stored locally
const pending = JSON.parse(localStorage.getItem('pendingEmails') || '[]');
console.log('Pending emails:', pending);
```

---

## 📧 Email Configuration Details

### Current Setup:

- **Email Service:** Firebase Cloud Functions + Gmail SMTP
- **Email Template:** Professional HTML with institution branding
- **Trigger:** Automatically when student/teacher is added
- **Fallback:** Emails stored in browser localStorage if Firebase fails
- **Retry:** Automatic retry on page reload

### Files Involved:

- `functions/src/index.ts` - Email sending Cloud Function
- `src/services/emailService.ts` - Email client-side logic
- `src/pages/admin/AddStudent.tsx` - Student email trigger
- `src/pages/admin/AddTeacher.tsx` - Teacher email trigger

---

## 🚀 Production Deployment

### For Production Use:

Instead of hardcoding credentials, use Firebase Environment Variables:

```bash
firebase functions:config:set gmail.email="your-email@gmail.com" gmail.password="your-app-password"
```

Then update `functions/src/index.ts`:

```typescript
const ADMIN_EMAIL = functions.config().gmail.email;
const ADMIN_PASSWORD = functions.config().gmail.password;
```

---

## ✨ Email Customization

To customize emails, edit these templates in `src/services/emailService.ts`:

- `generateStudentWelcomeHTML()` - Student email template
- `generateTeacherWelcomeHTML()` - Teacher email template

You can modify:
- Colors (currently using #A982D9)
- Text content
- Institution name
- Additional information

---

## 📞 Need Help?

If emails still aren't working:

1. ✅ Check Firebase functions logs: `firebase functions:log`
2. ✅ Verify Gmail app password is correct
3. ✅ Ensure 2FA is enabled on your Gmail account
4. ✅ Check browser console for error messages
5. ✅ Try with a different email address
6. ✅ Clear browser cache and try again

---

**Last Updated:** January 25, 2026
**System:** Insight Attendance Management System
