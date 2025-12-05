import { createContext, useContext, useMemo, useState } from "react";
import { translations } from "./translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "uz";
    return localStorage.getItem("lang") || "uz";
  });

  const changeLang = (next) => {
    setLang(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", next);
    }
  };

  // TO'G'RI t() funksiyasi – nested kalitlarni qo'llab-quvvatlaydi
  const t = (key, fallback) => {
    const pack = translations[lang] || translations.uz;

    // "patients.title" → ["patients", "title"]
    const value = key
      .split(".")
      .reduce(
        (obj, k) => (obj && obj[k] !== undefined ? obj[k] : undefined),
        pack,
      );

    // Agar topilmasa fallback yoki key o'zini qaytar
    return value !== undefined ? value : fallback || key;
  };

  const value = useMemo(
    () => ({
      lang,
      setLang: changeLang,
      t,
    }),
    [lang],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
}
