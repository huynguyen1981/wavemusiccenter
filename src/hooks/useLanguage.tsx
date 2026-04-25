import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language } from '../types';
import { UI_TEXT } from '../constants';
import { settingsService } from '../services/firebaseService';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  refreshSettings: () => Promise<void>;
  dynamicTranslations: Record<string, { en: string; vi: string }>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi');
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, { en: string; vi: string }>>({});

  const fetchSettings = async () => {
    try {
      const settings = await settingsService.getSettings();
      if (settings && settings.translations) {
        setDynamicTranslations(settings.translations);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const t = React.useCallback((key: string) => {
    // Priority: Dynamic (Admin) > Static (Fallback)
    const translation = dynamicTranslations[key] || UI_TEXT[key];
    const value = translation?.[language];
    
    // Nếu có giá trị (kể cả chuỗi rỗng) thì dùng, nếu không có key đó thì mới trả về key
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
    
    // Fallback cụ thể cho logo nếu trống
    if (key === 'website_logo') return '';

    return value || key;
  }, [language, dynamicTranslations]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      refreshSettings: fetchSettings,
      dynamicTranslations 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
