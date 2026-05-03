"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations("common");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="max-w-md rounded-3xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">{t("errorTitle")}</h1>
        <p className="mt-3 text-muted-foreground">{t("errorDescription")}</p>
        <Button className="mt-6" onClick={reset}>
          {t("retry")}
        </Button>
      </section>
    </main>
  );
}
