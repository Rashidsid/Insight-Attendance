/**
 * Form Validation Utilities
 * Centralized validation functions for all forms
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (10 digits, handles various formats)
const PHONE_REGEX = /^[0-9]{10}$/;

// Roll number validation (alphanumeric, 3-10 characters)
const ROLL_NUMBER_REGEX = /^[A-Za-z0-9]{3,10}$/;

// Teacher ID validation (alphanumeric, 3-10 characters)
const TEACHER_ID_REGEX = /^[A-Za-z0-9]{3,10}$/;

// Subject code validation (2-5 characters, alphanumeric)
const SUBJECT_CODE_REGEX = /^[A-Za-z0-9]{2,5}$/;

/**
 * Email validation
 */
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email || !email.trim()) {
    return { valid: false, error: "Email is required" };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }
  return { valid: true };
};

/**
 * Phone validation
 */
export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone || !phone.trim()) {
    return { valid: false, error: "Phone number is required" };
  }
  // Remove any non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, "");
  if (!PHONE_REGEX.test(digitsOnly)) {
    return { valid: false, error: "Phone number must be 10 digits" };
  }
  return { valid: true };
};

/**
 * Name validation (first name, last name, etc.)
 */
export const validateName = (name: string, fieldName: string = "Name"): { valid: boolean; error?: string } => {
  if (!name || !name.trim()) {
    return { valid: false, error: `${fieldName} is required` };
  }
  if (name.trim().length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters` };
  }
  if (name.trim().length > 50) {
    return { valid: false, error: `${fieldName} must not exceed 50 characters` };
  }
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(name.trim())) {
    return { valid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
  }
  return { valid: true };
};

/**
 * Roll number validation
 */
export const validateRollNumber = (rollNumber: string): { valid: boolean; error?: string } => {
  if (!rollNumber || !rollNumber.trim()) {
    return { valid: false, error: "Roll number is required" };
  }
  if (!ROLL_NUMBER_REGEX.test(rollNumber.trim())) {
    return { valid: false, error: "Roll number must be 3-10 alphanumeric characters" };
  }
  return { valid: true };
};

/**
 * Teacher ID validation
 */
export const validateTeacherId = (teacherId: string): { valid: boolean; error?: string } => {
  if (!teacherId || !teacherId.trim()) {
    return { valid: false, error: "Teacher ID is required" };
  }
  if (!TEACHER_ID_REGEX.test(teacherId.trim())) {
    return { valid: false, error: "Teacher ID must be 3-10 alphanumeric characters" };
  }
  return { valid: true };
};

/**
 * Subject code validation
 */
export const validateSubjectCode = (code: string): { valid: boolean; error?: string } => {
  if (!code || !code.trim()) {
    return { valid: false, error: "Subject code is required" };
  }
  if (!SUBJECT_CODE_REGEX.test(code.trim())) {
    return { valid: false, error: "Subject code must be 2-5 alphanumeric characters" };
  }
  return { valid: true };
};

/**
 * Subject name validation
 */
export const validateSubjectName = (name: string): { valid: boolean; error?: string } => {
  if (!name || !name.trim()) {
    return { valid: false, error: "Subject name is required" };
  }
  if (name.trim().length < 2) {
    return { valid: false, error: "Subject name must be at least 2 characters" };
  }
  if (name.trim().length > 50) {
    return { valid: false, error: "Subject name must not exceed 50 characters" };
  }
  return { valid: true };
};

/**
 * Class name validation
 */
export const validateClass = (className: string): { valid: boolean; error?: string } => {
  if (!className || !className.trim()) {
    return { valid: false, error: "Class is required" };
  }
  if (className.trim().length > 10) {
    return { valid: false, error: "Class name must not exceed 10 characters" };
  }
  return { valid: true };
};

/**
 * Section validation
 */
export const validateSection = (section: string): { valid: boolean; error?: string } => {
  if (!section || !section.trim()) {
    return { valid: false, error: "Section is required" };
  }
  if (section.trim().length > 5) {
    return { valid: false, error: "Section must not exceed 5 characters" };
  }
  return { valid: true };
};

/**
 * Date validation - ensures date is not in the future
 */
export const validateDateOfBirth = (dateString: string): { valid: boolean; error?: string } => {
  if (!dateString) {
    return { valid: false, error: "Date of birth is required" };
  }
  const date = new Date(dateString);
  const today = new Date();
  
  if (date > today) {
    return { valid: false, error: "Date of birth cannot be in the future" };
  }
  
  // Check age is reasonable (at least 5 years old)
  const age = today.getFullYear() - date.getFullYear();
  if (age < 5) {
    return { valid: false, error: "Student must be at least 5 years old" };
  }
  
  return { valid: true };
};

/**
 * Admission date validation - ensures date is not in the future
 */
export const validateAdmissionDate = (dateString: string): { valid: boolean; error?: string } => {
  if (!dateString) {
    return { valid: false, error: "Admission date is required" };
  }
  const date = new Date(dateString);
  const today = new Date();
  
  if (date > today) {
    return { valid: false, error: "Admission date cannot be in the future" };
  }
  
  return { valid: true };
};

/**
 * Gender validation
 */
export const validateGender = (gender: string): { valid: boolean; error?: string } => {
  if (!gender) {
    return { valid: false, error: "Gender is required" };
  }
  if (!["Male", "Female", "Other"].includes(gender)) {
    return { valid: false, error: "Invalid gender selection" };
  }
  return { valid: true };
};

/**
 * File size validation (in MB)
 */
export const validateFileSize = (file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: "File is required" };
  }
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }
  return { valid: true };
};

/**
 * File type validation
 */
export const validateFileType = (file: File, allowedTypes: string[] = ["image/jpeg", "image/png", "image/gif"]): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: "File is required" };
  }
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(", ")}` };
  }
  return { valid: true };
};

/**
 * Combined file validation
 */
export const validateFile = (file: File, maxSizeMB: number = 5, allowedTypes: string[] = ["image/jpeg", "image/png", "image/gif"]): { valid: boolean; error?: string } => {
  const sizeValidation = validateFileSize(file, maxSizeMB);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }
  
  const typeValidation = validateFileType(file, allowedTypes);
  if (!typeValidation.valid) {
    return typeValidation;
  }
  
  return { valid: true };
};

/**
 * Required field validation
 */
export const validateRequired = (value: string | boolean, fieldName: string = "This field"): { valid: boolean; error?: string } => {
  if (typeof value === "boolean") {
    return { valid: value, error: `${fieldName} is required` };
  }
  if (!value || !value.toString().trim()) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
};

/**
 * Validate all required fields in an object
 */
export const validateRequiredFields = (
  data: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  for (const field of requiredFields) {
    const value = data[field];
    if (!value || (typeof value === "string" && !value.trim())) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Password strength validation
 */
export const validatePassword = (password: string): { valid: boolean; error?: string; strength?: "weak" | "medium" | "strong" } => {
  if (!password) {
    return { valid: false, error: "Password is required" };
  }
  
  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters", strength: "weak" };
  }
  
  let strength: "weak" | "medium" | "strong" = "weak";
  
  // Check password strength
  if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
    strength = "strong";
  } else if (password.length >= 8 && (/[A-Z]/.test(password) || /[0-9]/.test(password))) {
    strength = "medium";
  }
  
  return { valid: true, strength };
};
