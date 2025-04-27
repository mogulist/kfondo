import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "한국 그란폰도 통계",
  description: "한국에서 열리는 그란폰도 대회들의 참가자 통계와 기록 분포를 확인해보세요.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-background">
            <header className="border-b">
              <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <a href="/" className="text-xl font-bold">
                  FondoScope
                </a>
                <nav className="flex items-center gap-4">
                  <a href="/" className="text-sm font-medium hover:underline">
                    홈
                  </a>
                  <a href="#" className="text-sm font-medium hover:underline">
                    통계
                  </a>
                  <a href="#" className="text-sm font-medium hover:underline">
                    정보
                  </a>
                </nav>
              </div>
            </header>
            {children}
            <footer className="border-t mt-12">
              <div className="container mx-auto px-4 py-8">
                <p className="text-center text-sm text-muted-foreground">
                  © {new Date().getFullYear()} FondoScope. 모든 권리 보유.
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
