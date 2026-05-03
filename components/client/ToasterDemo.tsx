"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { showToaster } from "@/lib/customToaster";

export default function ToasterDemo() {
  const t = useTranslations("client");

  return <Button onClick={() => showToaster(t("toastMessage"))}>{t("toastButton")}</Button>;
}
