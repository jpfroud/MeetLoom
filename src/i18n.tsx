import { createContext, useContext, useState, type ReactNode } from "react";
import type { Locale } from "../shared/model";

type I18n = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (fr: string, en: string) => string;
};
const Context = createContext<I18n>({
  locale: "fr",
  setLocale: () => {},
  t: (fr) => fr,
});
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, update] = useState<Locale>(() =>
    localStorage.getItem("meetloom.locale") === "en" ? "en" : "fr",
  );
  const setLocale = (value: Locale) => {
    update(value);
    localStorage.setItem("meetloom.locale", value);
    document.documentElement.lang = value;
  };
  return (
    <Context.Provider
      value={{ locale, setLocale, t: (fr, en) => (locale === "fr" ? fr : en) }}
    >
      {children}
    </Context.Provider>
  );
}
export const useI18n = () => useContext(Context);
