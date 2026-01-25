import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ThemeConfig {
  sidebarBg: string;
  sidebarAccent: string;
  buttonHoverBg: string;
  primaryColor: string;
  logo: string | null;
  lastUpdated: number;
}

export const defaultTheme: ThemeConfig = {
  sidebarBg: '#E7D7F6',
  sidebarAccent: '#A982D9',
  buttonHoverBg: 'rgba(255, 255, 255, 0.5)',
  primaryColor: '#A982D9',
  logo: '/images/admin.png',
  lastUpdated: Date.now(),
};

const THEME_PRESETS = {
  purple: {
    sidebarBg: '#E7D7F6',
    sidebarAccent: '#A982D9',
    buttonHoverBg: 'rgba(255, 255, 255, 0.5)',
    primaryColor: '#A982D9',
    label: 'Purple (Default)',
  },
  blue: {
    sidebarBg: '#DCE7F8',
    sidebarAccent: '#5B8DEE',
    buttonHoverBg: 'rgba(255, 255, 255, 0.5)',
    primaryColor: '#5B8DEE',
    label: 'Blue',
  },
  green: {
    sidebarBg: '#D7F1E7',
    sidebarAccent: '#2ECC71',
    buttonHoverBg: 'rgba(255, 255, 255, 0.5)',
    primaryColor: '#2ECC71',
    label: 'Green',
  },
  red: {
    sidebarBg: '#F8DCE0',
    sidebarAccent: '#E74C3C',
    buttonHoverBg: 'rgba(255, 255, 255, 0.5)',
    primaryColor: '#E74C3C',
    label: 'Red',
  },
  orange: {
    sidebarBg: '#F8E4D0',
    sidebarAccent: '#F39C12',
    buttonHoverBg: 'rgba(255, 255, 255, 0.5)',
    primaryColor: '#F39C12',
    label: 'Orange',
  },
  indigo: {
    sidebarBg: '#E7DCF8',
    sidebarAccent: '#6C5CE7',
    buttonHoverBg: 'rgba(255, 255, 255, 0.5)',
    primaryColor: '#6C5CE7',
    label: 'Indigo',
  },
};

export type ThemePreset = keyof typeof THEME_PRESETS;

export const getThemePresets = () => THEME_PRESETS;

export const applyTheme = (config: ThemeConfig) => {
  const root = document.documentElement;
  
  // Apply custom CSS variables for dynamic theming
  root.style.setProperty('--sidebar-bg', config.sidebarBg);
  root.style.setProperty('--sidebar-accent', config.sidebarAccent);
  root.style.setProperty('--button-hover-bg', config.buttonHoverBg);
  root.style.setProperty('--primary-color', config.primaryColor);
  
  // Store in localStorage for persistence
  localStorage.setItem('adminTheme', JSON.stringify(config));
};

export const getThemeFromStorage = (): ThemeConfig => {
  const stored = localStorage.getItem('adminTheme');
  return stored ? JSON.parse(stored) : defaultTheme;
};

export const saveThemeToFirebase = async (adminEmail: string, config: ThemeConfig) => {
  try {
    const themeRef = doc(db, 'adminSettings', adminEmail);
    await setDoc(themeRef, {
      theme: config,
      updatedAt: new Date(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving theme to Firebase:', error);
    return false;
  }
};

export const getThemeFromFirebase = async (adminEmail: string): Promise<ThemeConfig | null> => {
  try {
    const docRef = doc(db, 'adminSettings', adminEmail);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists() && docSnap.data().theme) {
      return docSnap.data().theme;
    }
    return null;
  } catch (error) {
    console.error('Error fetching theme from Firebase:', error);
    return null;
  }
};

export const uploadLogo = async (adminEmail: string, file: File): Promise<string | null> => {
  // This is a placeholder for logo upload logic
  // In a real implementation, you'd upload to Firebase Storage
  // For now, we'll use base64 encoding
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      localStorage.setItem(`adminLogo_${adminEmail}`, base64String);
      resolve(base64String);
    };
    reader.readAsDataURL(file);
  });
};

export const getLogoFromStorage = (adminEmail: string): string | null => {
  return localStorage.getItem(`adminLogo_${adminEmail}`);
};
