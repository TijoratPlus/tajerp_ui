/** Interface languages of Tijorat+: Russian (default), Tajik, English. */
export type Locale = "ru" | "tg" | "en";

export const LOCALES: readonly Locale[] = ["ru", "tg", "en"];

/** Default locale when no <TajUIProvider> is mounted. */
export const DEFAULT_LOCALE: Locale = "ru";

/** Native names, for language switchers. */
export const LOCALE_NAMES: Record<Locale, string> = {
  ru: "Русский",
  tg: "Тоҷикӣ",
  en: "English",
};

/** Short codes as shown in the RU / TJ / EN switcher. */
export const LOCALE_SHORT: Record<Locale, string> = {
  ru: "RU",
  tg: "TJ",
  en: "EN",
};

function supported(tag: string, api: "number" | "date"): boolean {
  try {
    return (
      (api === "number"
        ? Intl.NumberFormat.supportedLocalesOf([tag])
        : Intl.DateTimeFormat.supportedLocalesOf([tag])
      ).length > 0
    );
  } catch {
    return false;
  }
}

/**
 * BCP-47 tag for Intl formatting. Tajik data is missing from some browser ICU
 * builds; numbers and dates then fall back to Russian, which shares the same
 * conventions (space thousands separator, comma decimals, d.m.y dates).
 */
export function intlLocale(locale: Locale, api: "number" | "date" = "number") {
  if (locale === "en") return "en-US";
  if (locale === "tg" && supported("tg-TJ", api)) return "tg-TJ";
  return "ru-RU";
}
