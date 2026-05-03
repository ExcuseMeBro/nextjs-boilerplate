import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations("common");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="max-w-md rounded-3xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">{t("notFoundTitle")}</h1>
        <p className="mt-3 text-muted-foreground">{t("notFoundDescription")}</p>
        <Button asChild className="mt-6">
          <Link href={`/${locale}`}>{t("goHome")}</Link>
        </Button>
      </section>
    </main>
  );
}
