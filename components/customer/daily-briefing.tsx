"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  CheckCircle2, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight
} from "lucide-react";
import { AIBriefing } from "@/lib/api/ai-assistant";
import { format } from "date-fns";

interface DailyBriefingProps {
  briefing: AIBriefing;
  onViewTasks?: () => void;
  onViewBudget?: () => void;
}

export function DailyBriefing({ briefing, onViewTasks, onViewBudget }: DailyBriefingProps) {
  const completionColor = 
    (briefing.completion_rate || 0) >= 75 ? "text-green-600" :
    (briefing.completion_rate || 0) >= 50 ? "text-yellow-600" :
    "text-red-600";

  const budgetHealthColor =
    (briefing.budget_health_score || 0) >= 70 ? "text-green-600" :
    (briefing.budget_health_score || 0) >= 40 ? "text-yellow-600" :
    "text-red-600";

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              {briefing.briefing_type === 'daily' ? 'Daily Briefing' : 'Weekly Planning Brief'}
            </CardTitle>
            <CardDescription>
              {format(new Date(briefing.briefing_date), 'EEEE, MMMM d, yyyy')}
            </CardDescription>
          </div>
          {briefing.days_until_wedding !== null && briefing.days_until_wedding !== undefined && (
            <Badge variant="outline" className="text-lg px-3 py-1">
              <Clock className="h-4 w-4 mr-1" />
              {briefing.days_until_wedding} days
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {briefing.summary}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {/* Completion Rate */}
          {briefing.completion_rate !== null && briefing.completion_rate !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Task Progress
                </span>
                <span className={`text-sm font-bold ${completionColor}`}>
                  {briefing.completion_rate.toFixed(0)}%
                </span>
              </div>
              <Progress value={briefing.completion_rate} className="h-2" />
            </div>
          )}

          {/* Budget Health */}
          {briefing.budget_health_score !== null && briefing.budget_health_score !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Budget Health
                </span>
                <span className={`text-sm font-bold ${budgetHealthColor}`}>
                  {briefing.budget_health_score.toFixed(0)}/100
                </span>
              </div>
              <Progress value={briefing.budget_health_score} className="h-2" />
            </div>
          )}
        </div>

        {/* Urgent Tasks */}
        {briefing.urgent_tasks && briefing.urgent_tasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Urgent Tasks ({briefing.urgent_tasks.length})
              </h4>
              {onViewTasks && (
                <Button variant="ghost" size="sm" onClick={onViewTasks}>
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {briefing.urgent_tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <span className="text-sm font-medium">{task.title}</span>
                  {task.due_date && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(task.due_date), 'MMM d')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Alerts */}
        {briefing.budget_alerts && briefing.budget_alerts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-red-600" />
                Budget Alerts ({briefing.budget_alerts.length})
              </h4>
              {onViewBudget && (
                <Button variant="ghost" size="sm" onClick={onViewBudget}>
                  View Budget
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {briefing.budget_alerts.slice(0, 3).map((alert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200"
                >
                  <span className="text-sm font-medium">{alert.category}</span>
                  <span className="text-sm font-bold text-red-600">
                    {alert.overspend 
                      ? `$${alert.overspend.toFixed(2)} over`
                      : `${alert.usage_percent?.toFixed(0)}% used`
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Milestones (Weekly) */}
        {briefing.upcoming_milestones && briefing.upcoming_milestones.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Upcoming This Week ({briefing.upcoming_milestones.length})
            </h4>
            <div className="space-y-2">
              {briefing.upcoming_milestones.slice(0, 5).map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <span className="text-sm font-medium">{milestone.title}</span>
                  {milestone.due_date && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(milestone.due_date), 'MMM d')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Focus Areas (Weekly) */}
        {briefing.suggested_focus_areas && briefing.suggested_focus_areas.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Focus This Week</h4>
            <div className="space-y-2">
              {briefing.suggested_focus_areas.map((area, index) => (
                <div
                  key={index}
                  className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={area.priority === 'high' ? 'destructive' : 'secondary'}>
                      {area.priority}
                    </Badge>
                    <span className="text-sm font-semibold">{area.area}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{area.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
