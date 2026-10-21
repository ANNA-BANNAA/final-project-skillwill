const LOCALES = { ka: "ka-GE", en: "en-US" };

export function formatPrice(value, lang, currency = "GEL") {
  return new Intl.NumberFormat(LOCALES[lang], { style: "currency", currency }).format(value);
}

export function formatDate(value, lang) {
  return new Intl.DateTimeFormat(LOCALES[lang], { dateStyle: "medium" }).format(new Date(value));
}