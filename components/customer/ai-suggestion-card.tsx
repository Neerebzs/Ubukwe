"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export function AISuggestionCard({ suggestion, onRespond }: AISuggestionCardProps) {
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
    <Card className={`${config.borderColor} border-l-4 hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
            <div className={`${config.bgColor} p-2 rounded-lg`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant={config.badge as any} className="uppercase text-xs">
                  {suggestion.priority}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {typeLabels[suggestion.suggestion_type]}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight">{suggestion.title}</CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <CardDescription className="text-base leading-relaxed">
          {suggestion.message}
        </CardDescription>

        {(suggestion.reasoning || suggestion.impact_if_acted || suggestion.impact_if_ignored) && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  {isExpanded ? "Hide details" : "Why this matters"}
                </span>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              {suggestion.reasoning && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Reasoning
                  </p>
                  <p className="text-sm text-blue-800">{suggestion.reasoning}</p>
                </div>
              )}

              {suggestion.impact_if_acted && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-900 mb-1 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    If you act
                  </p>
                  <p className="text-sm text-green-800">{suggestion.impact_if_acted}</p>
                </div>
              )}

              {suggestion.impact_if_ignored && (
                <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-amber-900 mb-1 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    If you wait
                  </p>
                  <p className="text-sm text-amber-800">{suggestion.impact_if_ignored}</p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {showFeedback && (
          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium">
              Any feedback? (Optional)
            </label>
            <Textarea
              placeholder="Let us know your thoughts..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={2}
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 pt-0">
        {!isResponding ? (
          <>
            {suggestion.suggested_actions?.map((action, index) => (
              <Button
                key={index}
                variant={index === 0 ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (action.action === 'dismiss') {
                    handleRespond('dismissed');
                  } else if (action.action === 'postpone') {
                    handleRespond('postponed');
                  } else {
                    handleRespond('accepted');
                  }
                }}
                disabled={isLoading}
              >
                {action.label}
              </Button>
            ))}
            
            {!suggestion.suggested_actions?.some(a => a.action === 'dismiss') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRespond('dismissed')}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-1" />
                Dismiss
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={() => submitResponse('accepted')}
              disabled={isLoading}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Confirm
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowFeedback(false);
                setIsResponding(false);
                setFeedback("");
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
