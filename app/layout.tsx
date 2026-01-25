import type React from "react";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            {children}
            <Analytics />
            <footer className="border-t mt-12">
              <div className="max-w-screen-xl mx-auto px-4 py-8">
                <p className="text-center text-sm text-muted-foreground">
                  © 2025-{new Date().getFullYear()} K-Fondo. All rights
                  reserved.
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "K-Fondo | 한국 그란폰도 통계와 기록",
  description:
    "K-Fondo는 홍천, 설악, 양양 등 한국 주요 그란폰도 대회의 참가자 통계와 기록 분포를 제공합니다. 내 기록이 몇 등인지 확인하고, 대회별 참가자 수와 기록 분포를 분석해보세요.",
  keywords: [
    "K-Fondo",
    "케이폰도",
    "그란폰도",
    "메디오폰도",
    "자전거",
    "통계",
    "대회",
    "기록",
    "분포",
    "순위",
    "한국 그란폰도",
    "홍천 그란폰도",
    "설악 그란폰도",
    "양양 그란폰도",
    "영산 그란폰도",
    "문경새재 그란폰도",
    "정읍내장산 그란폰도",
    "삼척 그란폰도",
  ],
  authors: [{ name: "K-Fondo" }],
  creator: "K-Fondo",
  publisher: "K-Fondo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://kfondo.cc"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "K-Fondo | 한국 그란폰도 통계, 기록, 순위",
    description:
      "K-Fondo에서 한국 그란폰도 대회들의 통계, 기록, 순위를 확인해보세요. 내 기록이 몇 등인지 바로 찾을 수 있습니다.",
    url: "https://kfondo.cc",
    siteName: "K-Fondo",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "K-Fondo | 한국 그란폰도 통계, 기록, 순위",
    description:
      "K-Fondo에서 한국 그란폰도 대회들의 통계, 기록, 순위를 확인해보세요.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "K_bu_gyZtuD8AhOPED0z9esyUAghuqnGV94sC0HoZx4",
  },
  other: {
    "naver-site-verification": "c42c853d3e698f688ace54aabfdd111ad8d50c30",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};
