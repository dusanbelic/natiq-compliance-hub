import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translateToArabic } from '@/lib/translations';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  toggleLanguage: () => void;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('natiq_language') as Language) || 'en';
  });

  const isRTL = language === 'ar';

  useEffect(() => {
    // Update document direction
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('natiq_language', language);
  }, [language, isRTL]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  // Translation function - uses real Arabic translations
  const t = (text: string): string => {
    if (language === 'ar') {
      return translateToArabic(text);
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, isRTL, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
