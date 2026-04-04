import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
// import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { I18nProvider } from "@/contexts/i18n-context"
import { MobileMenuProvider } from "@/contexts/mobile-menu-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Ubukwe - Rwandan Wedding Services Platform",
  description:
    "Connect with authentic Rwandan wedding service providers for traditional dancers, MCs, decorations, catering, and venues.",
 
  icons: {
    icon: { url: '/favicon.ico', type: 'image/x-icon' },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <I18nProvider>
          <QueryProvider>
            <MobileMenuProvider>
              <Suspense fallback={null}>{children}</Suspense>
            </MobileMenuProvider>
          </QueryProvider>
        </I18nProvider>
        {/* <Analytics /> */}
      </body>
    </html>
  )
}
