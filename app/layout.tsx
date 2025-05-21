import type React from "react";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Head from "next/head";

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
            <div className="w-full max-w-screen-xl mx-auto px-4">
              {children}
              <Analytics />
              <footer className="border-t mt-12">
                <div className="py-8">
                  <p className="text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} FondoScope. All rights
                    reserved.
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "한국 그란폰도 통계와 기록 | FondoScope",
  description:
    "홍천 그란폰도, 설악 그란폰도, 양양 그란폰도 등 한국 주요 그란폰도 대회의 참가자 통계, 기록 분포를 확인하고 기록의 순위도 찾아보세요. 대회별 참가자 수, 기록 분포, 기록이 몇위인지 찾는 검색 기능을 제공합니다.",
  keywords: [
    "그란폰도",
    "메디오폰도",
    "자전거",
    "통계",
    "대회",
    "기록",
    "분포",
    "홍천 그란폰도",
    "설악 그란폰도",
    "양양 그란폰도",
    "영산 그란폰도",
    "문경새재 그란폰도",
    "정읍내장산 그란폰도",
    "삼척 그란폰도",
  ],
  authors: [{ name: "FondoScope" }],
  creator: "FondoScope",
  publisher: "FondoScope",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://fondoscope.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "한국 그란폰도 통계, 기록, 순위 | FondoScope",
    description:
      "한국에서 열리는 그란폰도 대회들의 통계, 기록, 순위를 확인해보세요.",
    url: "https://fondoscope.com",
    siteName: "FondoScope",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "한국 그란폰도 통계, 기록, 순위 | FondoScope",
    description:
      "한국에서 열리는 그란폰도 대회들의 통계, 기록, 순위를 확인해보세요.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: "K_bu_gyZtuD8AhOPED0z9esyUAghuqnGV94sC0HoZx4",
  },
  other: {
    "naver-site-verification": "aa1c7da5641edfb88b4d8bef8bd3fce9ad6b9fc7",
  },
};
