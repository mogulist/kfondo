import type React from "react";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "한국 그란폰도 통계 | FondoScope",
  description:
    "한국에서 열리는 그란폰도 대회들의 참가자 통계와 기록 분포를 확인해보세요. 대회별 참가자 수, 기록 분포, 성별/연령대별 통계를 제공합니다.",
  keywords: ["그란폰도", "자전거", "통계", "대회", "기록", "분포"],
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
    title: "한국 그란폰도 통계 | FondoScope",
    description:
      "한국에서 열리는 그란폰도 대회들의 참가자 통계와 기록 분포를 확인해보세요.",
    url: "https://fondoscope.com",
    siteName: "FondoScope",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "한국 그란폰도 통계 | FondoScope",
    description:
      "한국에서 열리는 그란폰도 대회들의 참가자 통계와 기록 분포를 확인해보세요.",
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
    google: "google-site-verification-code", // Google Search Console 인증 코드를 추가해야 합니다
  },
};

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
            <header className="border-b">
              <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <a href="/" className="text-xl font-bold">
                  FondoScope
                </a>
                <nav className="flex items-center gap-4">
                  {/* 
                  <a href="/" className="text-sm font-medium hover:underline">
                    홈
                  </a>
                  <a href="#" className="text-sm font-medium hover:underline">
                    통계
                  </a>
                  <a href="#" className="text-sm font-medium hover:underline">
                    정보
                  </a>
                  */}
                </nav>
              </div>
            </header>
            {children}
            <footer className="border-t mt-12">
              <div className="container mx-auto px-4 py-8">
                <p className="text-center text-sm text-muted-foreground">
                  © {new Date().getFullYear()} FondoScope. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
