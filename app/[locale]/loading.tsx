import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations("common");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
      <span className="sr-only">{t("loading")}</span>
    </main>
  );
}
