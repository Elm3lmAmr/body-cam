import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    'dashboard': 'Dashboard',
    'live': 'Live Streams',
    'recordings': 'Recordings',
    'incidents': 'Incidents',
    'logout': 'Logout',
    'raise_red_flag': 'Raise Red Flag',
    'incident_uid': 'Incident ID',
    'description': 'Description',
    'dispatch_to': 'Dispatch To',
    'created_at': 'Created At',
    'start_date': 'Start Date',
    'end_date': 'End Date',
    'filter': 'Filter',
    'no_incidents': 'No incidents found.',
    'cancel': 'Cancel',
    'submit': 'Submit',
    'head_of_security': 'Head of Security Operations',
    'raise_incident': 'Raise Incident',
    'incident_raised_success': 'Incident raised successfully.',
    'reports': 'Reports'
  },
  ar: {
    'dashboard': 'لوحة القيادة',
    'live': 'البث المباشر',
    'recordings': 'التسجيلات',
    'incidents': 'الحوادث',
    'logout': 'تسجيل خروج',
    'raise_red_flag': 'الابلاغ عن حادث',
    'incident_uid': 'معرف الحادث',
    'description': 'الوصف',
    'dispatch_to': 'إرسال إلى',
    'created_at': 'وقت الإنشاء',
    'start_date': 'تاريخ البدء',
    'end_date': 'تاريخ الانتهاء',
    'filter': 'تصفية',
    'no_incidents': 'لم يتم العثور على حوادث.',
    'cancel': 'إلغاء',
    'submit': 'إرسال',
    'head_of_security': 'رئيس عمليات الأمن',
    'raise_incident': 'الإبلاغ عن حادث',
    'incident_raised_success': 'تم الإبلاغ عن الحادث بنجاح.',
    'reports': 'التقارير'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prevLang => (prevLang === 'en' ? 'ar' : 'en'));
  };

  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
