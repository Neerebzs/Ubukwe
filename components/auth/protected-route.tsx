"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<"admin" | "event_owner" | "service_provider">;
  redirectTo?: string;
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/auth/signin" }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Wait for component to mount and auth state to load
    if (!mounted || isLoading) return;

    // If not authenticated, redirect to login
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // If authenticated but wrong role, redirect to appropriate dashboard
    if (!allowedRoles.includes(user.role)) {
      // Redirect to the correct dashboard based on user role
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "service_provider") {
        router.push("/provider/dashboard");
      } else if (user.role === "event_owner") {
        router.push("/customer/dashboard");
      } else {
        // Fallback to login if role is unknown
        router.push(redirectTo);
      }
    }
  }, [user, isLoading, allowedRoles, router, redirectTo, mounted]);

  // Show loading state during SSR and initial mount
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state while redirecting unauthorized users
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and has correct role
  return <>{children}</>;
}
