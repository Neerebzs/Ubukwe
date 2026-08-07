"use client"

import { Toaster as SonnerToaster } from "sonner"

export function SonnerToasterProvider() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "font-sans",
        },
      }}
    />
  )
}
