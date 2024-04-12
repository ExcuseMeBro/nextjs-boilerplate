import type { Metadata } from "next";
import "@/styles/globals.css";
import React from "react";
import { Toaster } from "@/components/ui/sonner"

import { Inter as FontSans } from "next/font/google"
import {cn} from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Next app boilerplate",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
      )}>
      <main>{children}</main>
      <Toaster />
      </body>
    </html>
  );
}
