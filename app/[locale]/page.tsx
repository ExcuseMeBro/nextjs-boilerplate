import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  LockKeyhole,
  Rocket,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnimatedStack } from "@/components/app/animated-stack";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { AuthCard } from "@/components/auth/auth-card";
import ToasterDemo from "@/components/client/ToasterDemo";
import { Button } from "@/components/ui/button";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const stackItems = [
  "Next.js 16",
  "React 19",
  "REST",
  "JWT",
  "i18n",
  "Biome",
  "Motion",
  "Tailwind CSS",
];

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const featureCards = [
    {
      icon: LockKeyhole,
      title: t("authTitle"),
      description: t("authDescription"),
    },
    {
      icon: Rocket,
      title: t("restTitle"),
      description: t("restDescription"),
    },
    {
      icon: Globe2,
      title: t("i18nTitle"),
      description: t("i18nDescription"),
    },
    {
      icon: Sparkles,
      title: t("animationTitle"),
      description: t("animationDescription"),
    },
    {
      icon: ShieldCheck,
      title: t("securityTitle"),
      description: t("securityDescription"),
    },
    {
      icon: Zap,
      title: t("performanceTitle"),
      description: t("performanceDescription"),
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_32rem)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-8 md:px-10 md:py-12">
        <header className="flex items-center justify-between gap-4">
          <Link
            className="flex items-center gap-2 font-semibold tracking-tight"
            href={`/${locale}`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              N
            </span>
            <span>Next.js Boilerplate</span>
          </Link>
          <LanguageSwitcher />
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {t("badge")}
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-tight md:text-7xl">
                {t("title")}
              </h1>
              <p className="max-w-2xl text-balance text-lg leading-8 text-muted-foreground md:text-xl">
                {t("subtitle")}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="#stack">
                  {t("primaryAction")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/api/health">{t("secondaryAction")}</Link>
              </Button>
              <ToasterDemo />
            </div>
          </div>

          <AuthCard />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]" id="stack">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight">{t("stackTitle")}</h2>
            <AnimatedStack items={stackItems} />
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight">{t("qualityTitle")}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {featureCards.map((feature) => (
                <article className="rounded-2xl border bg-background p-5" key={feature.title}>
                  <feature.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{t("healthCardTitle")}</h2>
              <p className="mt-2 text-muted-foreground">{t("healthCardDescription")}</p>
            </div>
            <Button asChild variant="secondary">
              <Link href="/api/health">{t("healthCardButton")}</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
