"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  X
} from "lucide-react";
import { AISuggestion, aiAssistantAPI } from "@/lib/api/ai-assistant";
import { toast } from "sonner";

interface AISuggestionCardProps {
  suggestion: AISuggestion;
  onRespond?: (suggestionId: string, response: string) => void;
}

const priorityConfig = {
  urgent: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    badge: "destructive"
  },
  high: {
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    badge: "default"
  },
  medium: {
    icon: Info,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    badge: "secondary"
  },
  low: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    badge: "outline"
  }
};

const typeLabels = {
  task_priority: "Task Priority",
  budget_alert: "Budget Alert",
  vendor_booking: "Vendor Booking",
  timeline_risk: "Timeline Risk"
};

const ACTION_ROUTES: Record<string, string> = {
  view_tasks:         "/customer/dashboard?tab=planning",
  create_task:        "/customer/dashboard?tab=planning",
  view_overdue:       "/customer/dashboard?tab=planning",
  view_high_priority: "/customer/dashboard?tab=planning",
  navigate_tasks:     "/customer/dashboard?tab=planning",
  reschedule_tasks:   "/customer/dashboard?tab=planning",
  view_task:          "/customer/dashboard?tab=planning",
  complete_task:      "/customer/dashboard?tab=planning",
  browse_vendors:     "/customer/dashboard?tab=vendors",
};

export function AISuggestionCard({ suggestion, onRespond }: AISuggestionCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const config = priorityConfig[suggestion.priority];
  const Icon = config.icon;

  const handleRespond = async (response: 'accepted' | 'ignored' | 'postponed' | 'dismissed') => {
    if (response === 'accepted' || response === 'dismissed') {
      setShowFeedback(true);
      setIsResponding(true);
      return;
    }

    await submitResponse(response);
  };

  const submitResponse = async (response: 'accepted' | 'ignored' | 'postponed' | 'dismissed') => {
    setIsLoading(true);
    try {
      await aiAssistantAPI.respondToSuggestion(
        suggestion.id,
        response,
        feedback || undefined
      );

      toast.success(
        response === 'accepted' 
          ? "Great! We'll help you with this." 
          : response === 'dismissed'
          ? "Suggestion dismissed"
          : response === 'postponed'
          ? "We'll remind you later"
          : "Noted"
      );

      onRespond?.(suggestion.id, response);
    } catch (error) {
      toast.error("Failed to respond to suggestion");
      console.error(error);
    } finally {
      setIsLoading(false);
      setShowFeedback(false);
      setIsResponding(false);
      setFeedback("");
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-5 space-y-4 ${
      suggestion.priority === 'urgent' ? 'ring-1 ring-rose-200' :
      suggestion.priority === 'high' ? 'ring-1 ring-amber-200' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`${config.bgColor} p-2 rounded-xl shrink-0`}>
          <Icon className={`h-4 w-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
              {suggestion.priority}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              {typeLabels[suggestion.suggestion_type]}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800 leading-snug">{suggestion.title}</p>
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-slate-500 leading-relaxed">{suggestion.message}</p>

      {/* Expandable details */}
      {(suggestion.reasoning || suggestion.impact_if_acted || suggestion.impact_if_ignored) && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-bold text-[#668c65] hover:underline">
            <Lightbulb className="h-3.5 w-3.5" />
            {isExpanded ? "Hide details" : "Why this matters"}
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-3">
            {suggestion.reasoning && (
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
                  <Info className="h-3 w-3" /> Reasoning
                </p>
                <p className="text-xs text-slate-600">{suggestion.reasoning}</p>
              </div>
            )}
            {suggestion.impact_if_acted && (
              <div className="bg-[#668c65]/5 p-3 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#668c65] mb-1 flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3" /> If you act
                </p>
                <p className="text-xs text-slate-600">{suggestion.impact_if_acted}</p>
              </div>
            )}
            {suggestion.impact_if_ignored && (
              <div className="bg-amber-50 p-3 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1 flex items-center gap-1.5">
                  <TrendingDown className="h-3 w-3" /> If you wait
                </p>
                <p className="text-xs text-slate-600">{suggestion.impact_if_ignored}</p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Feedback */}
      {showFeedback && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">Any feedback? (Optional)</label>
          <Textarea
            placeholder="Let us know your thoughts..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={2}
            className="rounded-xl text-sm"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1">
        {!isResponding ? (
          <>
            {suggestion.suggested_actions?.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  if (action.action === 'dismiss') {
                    handleRespond('dismissed');
                  } else if (action.action === 'postpone') {
                    handleRespond('postponed');
                  } else if (ACTION_ROUTES[action.action]) {
                    handleRespond('accepted');
                    router.push(ACTION_ROUTES[action.action]);
                  } else {
                    handleRespond('accepted');
                  }
                }}
                disabled={isLoading}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 ${
                  index === 0
                    ? 'bg-[#668c65] text-white hover:bg-[#527451]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {action.label}
              </button>
            ))}
            {!suggestion.suggested_actions?.some(a => a.action === 'dismiss') && (
              <button
                onClick={() => handleRespond('dismissed')}
                disabled={isLoading}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Dismiss
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => submitResponse('accepted')}
              disabled={isLoading}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#668c65] text-white hover:bg-[#527451] transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Confirm
            </button>
            <button
              onClick={() => { setShowFeedback(false); setIsResponding(false); setFeedback(""); }}
              disabled={isLoading}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
