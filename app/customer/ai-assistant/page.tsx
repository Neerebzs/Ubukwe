"use client";

import { useRouter } from "next/navigation";
import { AIAssistantDashboard } from "@/components/customer/ai-assistant-dashboard";
import { useQuery } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS, Wedding } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryKeys, dynamicQueryOptions } from "@/lib/cache";

export default function AIAssistantPage() {
  const router = useRouter();

  const { data: wedding, isLoading } = useQuery<Wedding | null>({
    queryKey: queryKeys.wedding.mine(),
    queryFn: async () => {
      try {
        const response = await apiClient.get<Wedding>(API_ENDPOINTS.WEDDING.ME);
        if (response.data?.id) {
          localStorage.setItem("weddingId", response.data.id);
        }
        return response.data || null;
      } catch (err: any) {
        if (err.message?.includes("404")) return null;
        throw err;
      }
    },
    // Wedding data — always fetch fresh
    ...dynamicQueryOptions,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!wedding?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">No Wedding Found</h2>
            <p className="text-muted-foreground">
              Please set up your wedding details to use the AI assistant.
            </p>
            <Button onClick={() => router.push("/customer/dashboard?tab=overview")}>
              Set Up Wedding
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AIAssistantDashboard
        weddingId={wedding.id}
        onNavigate={(path) => router.push(path)}
      />
    </div>
  );
}
