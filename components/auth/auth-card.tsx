"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/client";

export function AuthCard() {
  const t = useTranslations("auth");
  const { authenticated, loading, login, logout, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!email || !password) {
      setMessage(t("requiredFields"));
      return;
    }

    setSubmitting(true);

    try {
      await login({ email, password });
      setPassword("");
    } catch {
      setMessage(t("loginError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    setMessage(null);
    setSubmitting(true);

    try {
      await logout();
    } catch {
      setMessage(t("logoutError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">{t("statusTitle")}</h2>
        <p className="text-sm text-muted-foreground">{loading ? t("loading") : t("loginHint")}</p>
      </div>

      <div className="mt-6 rounded-2xl bg-muted p-4 text-sm">
        {authenticated ? `${t("signedIn")} ${user?.email ?? user?.name ?? ""}` : t("signedOut")}
      </div>

      {authenticated ? (
        <Button
          className="mt-6 w-full"
          disabled={submitting}
          onClick={handleLogout}
          variant="secondary"
        >
          {t("logoutButton")}
        </Button>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2 text-sm font-medium">
            <span>{t("emailLabel")}</span>
            <input
              autoComplete="email"
              className="w-full rounded-xl border bg-background px-3 py-2 outline-none ring-ring transition focus:ring-2"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>{t("passwordLabel")}</span>
            <input
              autoComplete="current-password"
              className="w-full rounded-xl border bg-background px-3 py-2 outline-none ring-ring transition focus:ring-2"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>
          <Button className="w-full" disabled={submitting} type="submit">
            {t("loginButton")}
          </Button>
        </form>
      )}

      {message && <p className="mt-4 text-sm text-destructive">{message}</p>}
    </section>
  );
}
