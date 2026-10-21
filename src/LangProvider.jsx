import { useEffect, useState } from "react";
import { LangContext } from "./LangContext";
import ka from "./locales/ka.json";
import en from "./locales/en.json";

const DICTS = { ka, en };

function get(obj, path) {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}

function readLang() {
  try {
    const saved = localStorage.getItem("lang");
    return saved === "en" || saved === "ka" ? saved : "ka"; // ნაგულისხმევი: ქართული
  } catch {
    return "ka";
  }
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(readLang);

  // ენის შეცვლისას: <html lang> და localStorage
  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("lang", lang);
    } catch {
      // localStorage შეიძლება მიუწვდომელი იყოს
    }
  }, [lang]);

  // t("catalog.empty") ან t("cart.label", { count: 3 }) → _one / _other
  function t(key, vars = {}) {
    let k = key;
    if (vars.count !== undefined) {
      const form = new Intl.PluralRules(lang).select(vars.count);
      if (get(DICTS[lang], key + "_" + form) !== undefined) k = key + "_" + form;
    }
    const text = get(DICTS[lang], k) ?? get(DICTS.ka, k);
    if (typeof text !== "string") return key; // უცნობი გასაღები (მაგ. სერვერის ტექსტი) უცვლელი რჩება
    return text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? "");
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}