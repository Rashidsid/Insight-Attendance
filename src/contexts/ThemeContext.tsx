import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeConfig, defaultTheme, getThemeFromStorage, getThemeFromFirebase, applyTheme } from '../services/themeService';

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [loading, setLoading] = useState(true);

  // Load theme on mount and apply it globally
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const adminEmail = localStorage.getItem('adminEmail');
        let savedTheme = getThemeFromStorage();

        // Try to fetch from Firebase if available
        if (adminEmail) {
          try {
            const firebaseTheme = await getThemeFromFirebase(adminEmail);
            if (firebaseTheme) {
              savedTheme = firebaseTheme;
            }
          } catch (error) {
            console.warn('Could not load theme from Firebase:', error);
          }
        }

        setTheme(savedTheme);
        applyTheme(savedTheme);
      } catch (error) {
        console.error('Error loading theme:', error);
        applyTheme(defaultTheme);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  const updateTheme = (newTheme: ThemeConfig) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
