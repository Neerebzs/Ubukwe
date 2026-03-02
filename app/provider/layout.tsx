"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["service_provider"]}>
      {children}
    </ProtectedRoute>
  );
}
