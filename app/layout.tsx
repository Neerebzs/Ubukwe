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
        
        {/* System Loading Indicator - Hidden after React hydration */}
        <div id="system-loading-indicator" style={{
          position: 'fixed',
          inset: '0',
          zIndex: '9999',
          backgroundColor: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
        }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Outer ring */}
            <div style={{
              position: 'absolute',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '3px solid rgba(255, 255, 255, 0.1)',
            }} />
            {/* Spinning ring */}
            <div style={{
              position: 'absolute',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '3px solid #668c65',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite',
            }} />
            {/* Heart icon */}
            <svg 
              style={{ width: '32px', height: '32px', color: '#668c65', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>
          <p style={{
            color: 'white',
            fontSize: '10px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}>
            Loading VowNest...
          </p>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}} />
        </div>
        
        <script dangerouslySetInnerHTML={{__html: `
          // Hide loading indicator once React hydrates
          if (typeof window !== 'undefined') {
            window.addEventListener('load', function() {
              setTimeout(function() {
                var loader = document.getElementById('system-loading-indicator');
                if (loader) {
                  loader.style.opacity = '0';
                  loader.style.transition = 'opacity 0.3s ease-out';
                  setTimeout(function() {
                    loader.style.display = 'none';
                  }, 300);
                }
              }, 500); // Small delay to ensure smooth transition
            });
          }
        `}} />
        
        <PWARegister />
        <QueryProvider>
          <SystemSettingsProvider>
            <I18nProvider>
              <MobileMenuProvider>
                {/* PageViewTracker has its own internal Suspense for useSearchParams */}
                <PageViewTracker />
                <Suspense fallback={null}>{children}</Suspense>
                <Toaster />
              </MobileMenuProvider>
            </I18nProvider>
          </SystemSettingsProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

