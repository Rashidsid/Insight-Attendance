// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEkzUI4dTkL96ayS6RqqOWZHIgauygxaA",
  authDomain: "insight-attendance-system.firebaseapp.com",
  projectId: "insight-attendance-system",
  storageBucket: "insight-attendance-system.firebasestorage.app",
  messagingSenderId: "555653777490",
  appId: "1:555653777490:web:24d20e2e2f66221a06f78b",
  measurementId: "G-Z51K45TKLX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const functions = getFunctions(app);

export default app;
