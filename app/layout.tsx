import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniHub — 开发者工具发现平台",
  description: "API 项目、Claude Code 技能、开源工具的精选聚合平台，帮你找到下一个好工具。",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <Navbar />
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
