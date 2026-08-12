import {
  ArrowDownRight,
  ArrowRight,
  Check,
  CircleDollarSign,
  Globe2,
  LayoutTemplate,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeroVisual, Reveal, TiltCard } from "@/components/app/landing-motion";
import { LanguageSwitcher } from "@/components/app/language-switcher";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

type ContentCard = {
  title: string;
  description: string;
};

type Stat = {
  value: string;
  label: string;
};

const stepIcons = [Sparkles, LayoutTemplate, Globe2];
const benefitIcons = [Zap, CircleDollarSign, Search];

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const stats = t.raw("stats") as Stat[];
  const steps = t.raw("steps") as ContentCard[];
  const benefits = t.raw("benefits") as ContentCard[];
  const included = t.raw("pricing.included") as string[];

  return (
    <main className="craftly-site">
      <div aria-hidden="true" className="site-grain" />

      <header className="site-header">
        <Link aria-label="Craftly" className="brand" href={`/${locale}`}>
          <span className="brand-mark">
            <span />
            <span />
          </span>
          <span>CRAFTLY</span>
        </Link>

        <nav aria-label="Main navigation" className="main-nav">
          <Link href="#how">{t("nav.how")}</Link>
          <Link href="#product">{t("nav.product")}</Link>
          <Link href="#pricing">{t("nav.pricing")}</Link>
        </nav>

        <div className="header-actions">
          <LanguageSwitcher />
          <Link className="button button-dark header-cta" href="#pricing">
            {t("nav.start")}
            <ArrowDownRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-glow" />
        <Reveal className="hero-copy">
          <p className="eyebrow">
            <span />
            {t("hero.eyebrow")}
          </p>
          <h1>
            <span>{t("hero.lineOne")}</span>
            <span>{t("hero.lineTwo")}</span>
          </h1>
        </Reveal>

        <HeroVisual
          launchLabel={t("hero.launchLabel")}
          promptLabel={t("hero.promptLabel")}
          readyLabel={t("hero.readyLabel")}
        />

        <Reveal className="hero-bottom" delay={0.15}>
          <p>{t("hero.subtitle")}</p>
          <div className="hero-actions">
            <Link className="button button-accent" href="#pricing">
              {t("hero.primaryAction")}
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
            <Link className="text-link" href="#how">
              {t("hero.secondaryAction")}
              <ArrowDownRight aria-hidden="true" size={18} />
            </Link>
          </div>
          <div className="hero-timeline">
            <span>01 PROMPT</span>
            <i />
            <span>02 DESIGN</span>
            <i />
            <span>03 DEPLOY</span>
          </div>
        </Reveal>
      </section>

      <div className="ticker" role="presentation">
        <div>
          <span>{t("ticker")}</span>
          <i>✦</i>
          <span>{t("ticker")}</span>
          <i>✦</i>
          <span>{t("ticker")}</span>
          <i>✦</i>
        </div>
      </div>

      <section className="problem-section section-shell">
        <Reveal className="section-heading">
          <p className="eyebrow eyebrow-dark">{t("problem.eyebrow")}</p>
          <h2>{t("problem.title")}</h2>
          <p className="section-intro">{t("problem.description")}</p>
        </Reveal>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <Reveal delay={index * 0.08} key={stat.label}>
              <TiltCard className={`stat-card stat-card-${index + 1}`}>
                <span className="stat-index">0{index + 1}</span>
                <strong>{stat.value}</strong>
                <p>{stat.label}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="how-section" id="how">
        <div className="section-shell">
          <Reveal className="section-heading heading-light">
            <p className="eyebrow">{t("how.eyebrow")}</p>
            <h2>{t("how.title")}</h2>
            <p className="section-intro">{t("how.description")}</p>
          </Reveal>

          <div className="steps-grid">
            {steps.map((step, index) => {
              const Icon = stepIcons[index];
              return (
                <Reveal delay={index * 0.1} key={step.title}>
                  <TiltCard className={`step-card step-card-${index + 1}`}>
                    <div className="step-topline">
                      <span>0{index + 1}</span>
                      <Icon aria-hidden="true" size={24} />
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    <ArrowDownRight aria-hidden="true" className="step-arrow" size={34} />
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="product-section section-shell" id="product">
        <Reveal className="product-heading">
          <div>
            <p className="eyebrow eyebrow-dark">{t("product.eyebrow")}</p>
            <h2>{t("product.title")}</h2>
          </div>
          <p>{t("product.description")}</p>
        </Reveal>

        <Reveal className="builder-window">
          <div className="builder-bar">
            <div className="window-dots">
              <i />
              <i />
              <i />
            </div>
            <span>craftly.ai / builder</span>
            <span className="builder-status">{t("product.live")}</span>
          </div>

          <div className="builder-body">
            <div className="prompt-panel">
              <div className="panel-label">{t("product.prompt")}</div>
              <div className="prompt-bubble">{t("product.promptText")}</div>
              <div className="generation-list">
                <span className="is-done">
                  <Check size={14} /> {t("product.checkOne")}
                </span>
                <span className="is-done">
                  <Check size={14} /> {t("product.checkTwo")}
                </span>
                <span>
                  <Sparkles size={14} /> {t("product.checkThree")}
                </span>
              </div>
              <div className="generation-progress">
                <i />
              </div>
            </div>

            <div className="site-preview">
              <div className="preview-nav">
                <b>MÖKKA</b>
                <span>Menu&nbsp;&nbsp; Story&nbsp;&nbsp; Contact</span>
                <i>Book a table</i>
              </div>
              <div className="preview-copy">
                <small>TASHKENT · COFFEE & BRUNCH</small>
                <strong>
                  GOOD DAYS
                  <br />
                  START HERE.
                </strong>
                <p>Fresh coffee, warm bread and a slower morning.</p>
                <span>VIEW MENU →</span>
              </div>
              <div className="preview-orbit orbit-one" />
              <div className="preview-orbit orbit-two" />
            </div>
          </div>
        </Reveal>
      </section>

      <section className="benefits-section">
        <div className="section-shell benefits-layout">
          <Reveal className="benefits-title">
            <p className="eyebrow">{t("benefitsSection.eyebrow")}</p>
            <h2>{t("benefitsSection.title")}</h2>
            <p>{t("benefitsSection.description")}</p>
          </Reveal>

          <div className="benefits-list">
            {benefits.map((benefit, index) => {
              const Icon = benefitIcons[index];
              return (
                <Reveal delay={index * 0.08} key={benefit.title}>
                  <article className="benefit-row">
                    <span className="benefit-icon">
                      <Icon aria-hidden="true" size={22} />
                    </span>
                    <div>
                      <h3>{benefit.title}</h3>
                      <p>{benefit.description}</p>
                    </div>
                    <span className="benefit-number">0{index + 1}</span>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pricing-section section-shell" id="pricing">
        <Reveal className="pricing-heading">
          <p className="eyebrow eyebrow-dark">{t("pricing.eyebrow")}</p>
          <h2>{t("pricing.title")}</h2>
          <p>{t("pricing.description")}</p>
        </Reveal>

        <div className="pricing-layout">
          <Reveal className="price-card price-card-main">
            <div className="price-label">{t("pricing.monthlyLabel")}</div>
            <div className="price-line">
              <span>$</span>
              <strong>20</strong>
              <small>/ {t("pricing.month")}</small>
            </div>
            <p>{t("pricing.monthlyDescription")}</p>
            <Link className="button button-dark price-button" href="mailto:hello@craftly.uz">
              {t("pricing.action")}
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </Reveal>

          <Reveal className="price-card price-card-setup" delay={0.08}>
            <div>
              <div className="price-label">{t("pricing.setupLabel")}</div>
              <div className="setup-price">$100</div>
              <p>{t("pricing.setupDescription")}</p>
            </div>
            <div className="ten-minute-badge">
              <Zap aria-hidden="true" size={18} />
              {t("pricing.speed")}
            </div>
          </Reveal>

          <Reveal className="included-card" delay={0.16}>
            <h3>{t("pricing.includedTitle")}</h3>
            <ul>
              {included.map((item) => (
                <li key={item}>
                  <Check aria-hidden="true" size={16} />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="closing-section">
        <div className="closing-orb" />
        <Reveal className="closing-content">
          <p className="eyebrow">{t("closing.eyebrow")}</p>
          <h2>{t("closing.title")}</h2>
          <p>{t("closing.description")}</p>
          <Link className="button button-accent closing-button" href="mailto:hello@craftly.uz">
            {t("closing.action")}
            <ArrowRight aria-hidden="true" size={20} />
          </Link>
        </Reveal>
      </section>

      <footer className="site-footer">
        <Link className="brand brand-light" href={`/${locale}`}>
          <span className="brand-mark">
            <span />
            <span />
          </span>
          <span>CRAFTLY</span>
        </Link>
        <p>{t("footer.tagline")}</p>
        <div>
          <div className="footer-languages">
            <LanguageSwitcher />
          </div>
          <a href="mailto:hello@craftly.uz">hello@craftly.uz</a>
          <span>© 2026 CRAFTLY</span>
        </div>
      </footer>
    </main>
  );
}
