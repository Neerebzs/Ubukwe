import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { I18nProvider } from "@/contexts/i18n-context"
import { MobileMenuProvider } from "@/contexts/mobile-menu-context"
import { PWARegister } from "./pwa-register"
import { GoogleTagManagerScript, GoogleTagManagerNoScript } from "@/components/analytics/GoogleTagManager"
import { PageViewTracker } from "@/components/analytics/PageViewTracker"
import "./globals.css"

export const metadata: Metadata = {
  title: "Ubukwe - Rwandan Wedding Services Platform",
  description:
    "Connect with authentic Rwandan wedding service providers for traditional dancers, MCs, decorations, catering, and venues.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ubukwe',
  },
  icons: {
    icon: { url: '/favicon.ico', type: 'image/x-icon' },
    apple: { url: '/icon-192.png', type: 'image/png' },
  },
}

export const viewport: Viewport = {
  themeColor: '#6b856c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}


import { SystemSettingsProvider } from "@/contexts/system-settings-context"
import { Toaster } from "@/components/ui/toaster"



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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6b856c" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        {/* Google Tag Manager — must be first script in <head> */}
        <GoogleTagManagerScript />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {/* GTM noscript fallback */}
        <GoogleTagManagerNoScript />
        <PWARegister />
        <SystemSettingsProvider>
          <I18nProvider>
            <QueryProvider>
              <MobileMenuProvider>
                {/* PageViewTracker has its own internal Suspense for useSearchParams */}
                <PageViewTracker />
                <Suspense fallback={null}>{children}</Suspense>
                <Toaster />
              </MobileMenuProvider>
            </QueryProvider>
          </I18nProvider>
        </SystemSettingsProvider>
      </body>
    </html>
  )
}

