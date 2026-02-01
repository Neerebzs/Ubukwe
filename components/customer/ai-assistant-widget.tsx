"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Loader2
} from "lucide-react";
import { aiAssistantAPI, AISuggestion } from "@/lib/api/ai-assistant";
import Link from "next/link";

interface AIAssistantWidgetProps {
  weddingId: string;
}

export function AIAssistantWidget({ weddingId }: AIAssistantWidgetProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, [weddingId]);

  const loadSuggestions = async () => {
    try {
      const response = await aiAssistantAPI.getActiveSuggestions(weddingId, 3);
      setSuggestions(response.data);
    } catch (error) {
      console.error("Failed to load AI suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const priorityConfig = {
    urgent: { color: "text-red-600", bgColor: "bg-red-50", icon: AlertCircle },
    high: { color: "text-orange-600", bgColor: "bg-orange-50", icon: AlertCircle },
    medium: { color: "text-yellow-600", bgColor: "bg-yellow-50", icon: TrendingUp },
    low: { color: "text-blue-600", bgColor: "bg-blue-50", icon: TrendingUp }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Assistant
            </CardTitle>
            <CardDescription>Smart suggestions for your planning</CardDescription>
          </div>
          <Link href="/customer/ai-assistant">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {suggestions.length > 0 ? (
          <>
            {suggestions.map((suggestion) => {
              const config = priorityConfig[suggestion.priority];
              const Icon = config.icon;

              return (
                <div
                  key={suggestion.id}
                  className={`p-3 rounded-lg border ${config.bgColor} border-opacity-50`}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={`h-4 w-4 mt-0.5 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant={suggestion.priority === 'urgent' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {suggestion.priority}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium line-clamp-2">
                        {suggestion.title}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link href="/customer/ai-assistant">
              <Button variant="outline" className="w-full" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                View All Suggestions
              </Button>
            </Link>
          </>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">
              No urgent suggestions at the moment
            </p>
            <Link href="/customer/ai-assistant">
              <Button variant="outline" size="sm" className="mt-4">
                Open AI Assistant
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
