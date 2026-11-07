import { expect, test } from "bun:test";
import { useQueryClient } from "@tanstack/react-query";
import { MotionConfigContext } from "motion/react";
import { createElement as h, useContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppProviders } from "../app/[locale]/providers";
import { AnimatedStack } from "../components/app/animated-stack";
import { HeroVisual, Reveal, TiltCard } from "../components/app/landing-motion";
import { useAuth } from "../lib/auth/client";

function Probe() {
  expect(useContext(MotionConfigContext).reducedMotion).toBe("user");
  expect(useAuth()).toMatchObject({ authenticated: false, user: null, loading: true });
  expect(useQueryClient().getDefaultOptions().queries).toMatchObject({
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  return h(
    Reveal,
    null,
    h(TiltCard, null, "Locale content survives"),
    h(AnimatedStack, { items: ["One", "Two"] }),
    h(HeroVisual, { launchLabel: "Launch", promptLabel: "Prompt", readyLabel: "Ready" }),
  );
}

test("strict lightweight Motion boundary retains providers and server-rendered content", () => {
  const html = renderToStaticMarkup(h(AppProviders, null, h(Probe)));
  expect(html).toContain("Locale content survives");
  expect(html).toContain("Ready");
  expect(html).toContain("prefers-color-scheme");
  expect(html).toContain("system");
});
