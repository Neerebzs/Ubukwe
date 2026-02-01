"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AIAssistantDashboard } from "@/components/customer/ai-assistant-dashboard";
import { useAuth } from "@/hooks/useAuth";

export default function AIAssistantPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [weddingId, setWeddingId] = useState<string | null>(null);

  useEffect(() => {
    // Get wedding ID from user data or localStorage
    const storedWeddingId = localStorage.getItem('weddingId');
    if (storedWeddingId) {
      setWeddingId(storedWeddingId);
    } else if (user?.wedding_id) {
      setWeddingId(user.wedding_id);
      localStorage.setItem('weddingId', user.wedding_id);
    }
  }, [user]);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (!weddingId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">No Wedding Found</h2>
            <p className="text-muted-foreground mb-4">
              Please create a wedding to use the AI assistant
            </p>
            <button
              onClick={() => router.push('/customer/dashboard')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AIAssistantDashboard 
        weddingId={weddingId} 
        onNavigate={handleNavigate}
      />
    </div>
  );
}
