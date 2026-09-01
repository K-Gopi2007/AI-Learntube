import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FloatingAI from "@/components/FloatingAI";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LearnTube AI",
  description: "Transform educational videos into personalized learning journeys.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background`}>
        {children}
        <FloatingAI />
      </body>
    </html>
  );
}