"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { type Locale, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const localeLabels: Record<Locale, "english" | "uzbek" | "russian"> = {
  en: "english",
  uz: "uzbek",
  ru: "russian",
};

function getLocalizedPath(pathname: string, locale: Locale) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length > 0 && routing.locales.includes(segments[0] as Locale)) {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }

  return `/${segments.join("/")}`;
}

export function LanguageSwitcher() {
  const activeLocale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("common");

  return (
    <div className="flex items-center gap-2 rounded-full border bg-background/80 p-1 shadow-sm backdrop-blur">
      <span className="sr-only">{t("language")}</span>
      {routing.locales.map((locale) => (
        <Link
          aria-label={t(localeLabels[locale])}
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
            activeLocale === locale &&
              "bg-primary text-primary-foreground hover:text-primary-foreground",
          )}
          href={getLocalizedPath(pathname, locale)}
          key={locale}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
