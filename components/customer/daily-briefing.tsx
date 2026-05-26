"use client";

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
    <div className="bg-white rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            {briefing.briefing_type === 'daily' ? 'Daily Briefing' : 'Weekly Brief'}
          </p>
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#668c65]" />
            {format(new Date(briefing.briefing_date), 'EEEE, MMMM d, yyyy')}
          </h3>
        </div>
        {briefing.days_until_wedding != null && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 shrink-0">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs font-bold text-slate-600">{briefing.days_until_wedding} days</span>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-slate-50 p-4 rounded-2xl">
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{briefing.summary}</p>
      </div>

      {/* Metrics */}
      {(briefing.completion_rate != null || briefing.budget_health_score != null) && (
        <div className="grid grid-cols-2 gap-3">
          {briefing.completion_rate != null && (
            <div className="bg-slate-50 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Tasks
                </span>
                <span className={`text-xs font-bold ${completionColor}`}>{briefing.completion_rate.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#668c65] rounded-full" style={{ width: `${briefing.completion_rate}%` }} />
              </div>
            </div>
          )}
          {briefing.budget_health_score != null && (
            <div className="bg-slate-50 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Budget
                </span>
                <span className={`text-xs font-bold ${budgetHealthColor}`}>{briefing.budget_health_score.toFixed(0)}/100</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#668c65] rounded-full" style={{ width: `${briefing.budget_health_score}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Urgent Tasks */}
      {briefing.urgent_tasks && briefing.urgent_tasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Urgent Tasks ({briefing.urgent_tasks.length})
            </h4>
            {onViewTasks && (
              <button onClick={onViewTasks} className="text-xs font-bold text-[#668c65] hover:underline flex items-center gap-0.5">
                View all <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            {briefing.urgent_tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between px-3 py-2 bg-amber-50 rounded-xl">
                <span className="text-sm font-medium text-slate-700">{task.title}</span>
                {task.due_date && (
                  <span className="text-[10px] font-bold text-amber-600">{format(new Date(task.due_date), 'MMM d')}</span>
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
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-rose-500" />
              Budget Alerts ({briefing.budget_alerts.length})
            </h4>
            {onViewBudget && (
              <button onClick={onViewBudget} className="text-xs font-bold text-[#668c65] hover:underline flex items-center gap-0.5">
                View budget <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            {briefing.budget_alerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="flex items-center justify-between px-3 py-2 bg-rose-50 rounded-xl">
                <span className="text-sm font-medium text-slate-700">{alert.category}</span>
                <span className="text-xs font-bold text-rose-500">
                  {alert.overspend ? `${alert.overspend.toFixed(0)} RWF over` : `${alert.usage_percent?.toFixed(0)}% used`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Milestones */}
      {briefing.upcoming_milestones && briefing.upcoming_milestones.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-[#668c65]" />
            This Week ({briefing.upcoming_milestones.length})
          </h4>
          <div className="space-y-1.5">
            {briefing.upcoming_milestones.slice(0, 5).map((milestone) => (
              <div key={milestone.id} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
                <span className="text-sm font-medium text-slate-700">{milestone.title}</span>
                {milestone.due_date && (
                  <span className="text-[10px] font-bold text-slate-400">{format(new Date(milestone.due_date), 'MMM d')}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Focus Areas */}
      {briefing.suggested_focus_areas && briefing.suggested_focus_areas.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Focus This Week</h4>
          <div className="space-y-2">
            {briefing.suggested_focus_areas.map((area, index) => (
              <div key={index} className="p-3 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    area.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {area.priority}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{area.area}</span>
                </div>
                <p className="text-xs text-slate-500">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
