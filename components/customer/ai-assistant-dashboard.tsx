"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  RefreshCw, 
  Settings, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Loader2
} from "lucide-react";
import { AISuggestionCard } from "./ai-suggestion-card";
import { DailyBriefing } from "./daily-briefing";
import { AIPreferencesPanel } from "./ai-preferences-panel";
import { aiAssistantAPI, AIDashboard } from "@/lib/api/ai-assistant";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface AIAssistantDashboardProps {
  weddingId: string;
  onNavigate?: (path: string) => void;
}

export function AIAssistantDashboard({ weddingId, onNavigate }: AIAssistantDashboardProps) {
  const [dashboard, setDashboard] = useState<AIDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadDashboard();
  }, [weddingId]);

  const loadDashboard = async () => {
    try {
      const response = await aiAssistantAPI.getDashboard(weddingId);
      setDashboard(response.data);
    } catch (error) {
      toast.error("Failed to load AI assistant");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Generate new suggestions
      await aiAssistantAPI.generateSuggestions(weddingId);
      
      // Reload dashboard
      await loadDashboard();
      
      toast.success("AI insights refreshed");
    } catch (error) {
      toast.error("Failed to refresh");
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGenerateBriefing = async () => {
    try {
      await aiAssistantAPI.generateDailyBriefing(weddingId);
      await loadDashboard();
      toast.success("Daily briefing generated");
    } catch (error) {
      toast.error("Failed to generate briefing");
      console.error(error);
    }
  };

  const handleSuggestionRespond = async () => {
    // Reload dashboard after responding to suggestion
    await loadDashboard();
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!dashboard) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Failed to load AI assistant</p>
          <Button onClick={loadDashboard} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { analysis, active_suggestions, latest_briefing } = dashboard;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            AI Wedding Assistant
          </h2>
          <p className="text-muted-foreground mt-1">
            Your intelligent planning companion
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Days Until Wedding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-3xl font-bold">
                {analysis.days_until_wedding}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Task Completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-3xl font-bold">
                {analysis.tasks.completion_rate.toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analysis.tasks.completed} of {analysis.tasks.total} tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Budget Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <span className="text-3xl font-bold">
                {analysis.budget.usage_percent.toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${analysis.budget.remaining.toFixed(0)} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="text-3xl font-bold">
                {active_suggestions.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {active_suggestions.filter(s => s.priority === 'urgent' || s.priority === 'high').length} high priority
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            Overview
            {active_suggestions.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {active_suggestions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="briefing">
            Daily Briefing
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          {/* Alerts */}
          {(analysis.tasks.overdue > 0 || analysis.budget.overspending_categories > 0) && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Attention Needed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.tasks.overdue > 0 && (
                  <p className="text-sm text-orange-800">
                    • {analysis.tasks.overdue} overdue task{analysis.tasks.overdue > 1 ? 's' : ''} requiring immediate attention
                  </p>
                )}
                {analysis.budget.overspending_categories > 0 && (
                  <p className="text-sm text-orange-800">
                    • {analysis.budget.overspending_categories} budget categor{analysis.budget.overspending_categories > 1 ? 'ies' : 'y'} over limit
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Suggestions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">AI Suggestions</h3>
              {active_suggestions.length === 0 && (
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  Generate Suggestions
                </Button>
              )}
            </div>

            {active_suggestions.length > 0 ? (
              <div className="space-y-4">
                {active_suggestions.map((suggestion) => (
                  <AISuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onRespond={handleSuggestionRespond}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
                  <p className="text-lg font-medium">You're all caught up!</p>
                  <p className="text-muted-foreground text-center mt-2">
                    No urgent suggestions at the moment. Keep up the great work!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="briefing" className="mt-6">
          {latest_briefing ? (
            <DailyBriefing
              briefing={latest_briefing}
              onViewTasks={() => onNavigate?.('/customer/dashboard?tab=tasks')}
              onViewBudget={() => onNavigate?.('/customer/dashboard?tab=budget')}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No briefing yet</p>
                <p className="text-muted-foreground text-center mt-2 mb-4">
                  Generate your first daily briefing to get started
                </p>
                <Button onClick={handleGenerateBriefing}>
                  Generate Daily Briefing
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <AIPreferencesPanel
            weddingId={weddingId}
            preferences={dashboard.preferences}
            onUpdate={loadDashboard}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-3 w-24 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
