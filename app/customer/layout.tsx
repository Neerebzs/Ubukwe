"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
// some change
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["event_owner"]}>
      {children}
    </ProtectedRoute>
  );
}
