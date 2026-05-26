"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-slate-50">
        <AlertCircle className="h-10 w-10 text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Failed to load AI assistant</p>
        <Button onClick={loadDashboard} className="mt-4 bg-[#668c65] hover:bg-[#527451] text-white rounded-xl">
          Try Again
        </Button>
      </div>
    );
  }

  const { analysis, active_suggestions, latest_briefing } = dashboard;
  const highPriority = active_suggestions.filter(s => s.priority === 'urgent' || s.priority === 'high').length;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif italic text-slate-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#668c65]" />
            AI Wedding Assistant
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Your intelligent planning companion</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Days until wedding */}
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Days to Wedding</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-800">{analysis.days_until_wedding}</span>
            <Calendar className="h-5 w-5 text-[#668c65] mb-1" />
          </div>
        </div>

        {/* Task completion */}
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tasks Done</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-800">{analysis.tasks.completion_rate.toFixed(0)}%</span>
            <CheckCircle2 className="h-5 w-5 text-[#668c65] mb-1" />
          </div>
          <p className="text-[11px] text-slate-400">{analysis.tasks.completed} of {analysis.tasks.total}</p>
        </div>

        {/* Budget */}
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Budget Used</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-800">{analysis.budget.usage_percent.toFixed(0)}%</span>
            <DollarSign className="h-5 w-5 text-[#668c65] mb-1" />
          </div>
          <p className="text-[11px] text-slate-400">{analysis.budget.remaining.toLocaleString()} RWF left</p>
        </div>

        {/* Suggestions */}
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Suggestions</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-800">{active_suggestions.length}</span>
            <TrendingUp className="h-5 w-5 text-[#668c65] mb-1" />
          </div>
          <p className="text-[11px] text-slate-400">{highPriority} high priority</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 p-1 rounded-2xl h-auto gap-1">
          <TabsTrigger value="overview" className="rounded-xl text-xs font-bold uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-slate-800">
            Overview
            {active_suggestions.length > 0 && (
              <span className="ml-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full inline-flex items-center justify-center">
                {active_suggestions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="briefing" className="rounded-xl text-xs font-bold uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-slate-800">
            Daily Brief
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl text-xs font-bold uppercase tracking-wider px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-slate-800">
            <Settings className="h-3.5 w-3.5 mr-1" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4 mt-5">
          {/* Alert banner */}
          {(analysis.tasks.overdue > 0 || analysis.budget.overspending_categories > 0) && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-800">Attention needed</p>
                {analysis.tasks.overdue > 0 && (
                  <p className="text-sm text-amber-700">
                    {analysis.tasks.overdue} overdue task{analysis.tasks.overdue > 1 ? 's' : ''} require immediate attention
                  </p>
                )}
                {analysis.budget.overspending_categories > 0 && (
                  <p className="text-sm text-amber-700">
                    {analysis.budget.overspending_categories} budget categor{analysis.budget.overspending_categories > 1 ? 'ies' : 'y'} over limit
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Suggestions section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-700">AI Suggestions</h3>
              {active_suggestions.length === 0 && (
                <button
                  onClick={handleRefresh}
                  className="text-xs font-bold text-[#668c65] hover:underline"
                >
                  Generate suggestions
                </button>
              )}
            </div>

            {active_suggestions.length > 0 ? (
              <div className="space-y-3">
                {active_suggestions.map((suggestion) => (
                  <AISuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onRespond={handleSuggestionRespond}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-slate-50">
                <CheckCircle2 className="h-10 w-10 text-[#668c65] mb-3" />
                <p className="font-serif italic text-slate-700 text-lg">You're all caught up!</p>
                <p className="text-sm text-slate-400 mt-1 text-center">No urgent suggestions right now. Keep up the great work!</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Daily Brief */}
        <TabsContent value="briefing" className="mt-5">
          {latest_briefing ? (
            <DailyBriefing
              briefing={latest_briefing}
              onViewTasks={() => onNavigate?.('/customer/dashboard?tab=tasks')}
              onViewBudget={() => onNavigate?.('/customer/dashboard?tab=budget')}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-slate-50">
              <Calendar className="h-10 w-10 text-slate-300 mb-3" />
              <p className="font-serif italic text-slate-700 text-lg">No briefing yet</p>
              <p className="text-sm text-slate-400 mt-1 mb-5 text-center">Generate your first daily briefing to get started</p>
              <Button onClick={handleGenerateBriefing} className="bg-[#668c65] hover:bg-[#527451] text-white rounded-xl">
                Generate Daily Briefing
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="mt-5">
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
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-slate-200 rounded-xl" />
          <div className="h-4 w-40 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-9 w-24 bg-slate-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white rounded-2xl p-4 space-y-2">
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-8 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-24 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-5 space-y-3">
            <div className="h-5 w-48 bg-slate-200 rounded" />
            <div className="h-16 w-full bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
