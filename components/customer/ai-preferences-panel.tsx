"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Save, Bell, Clock, Zap, Shield } from "lucide-react";
import { AIUserPreferences, aiAssistantAPI } from "@/lib/api/ai-assistant";
import { toast } from "sonner";

interface AIPreferencesPanelProps {
  weddingId: string;
  preferences?: AIUserPreferences;
  onUpdate?: () => void;
}

export function AIPreferencesPanel({ weddingId, preferences: initialPreferences, onUpdate }: AIPreferencesPanelProps) {
  const [preferences, setPreferences] = useState<Partial<AIUserPreferences>>({
    enable_daily_briefing: true,
    enable_weekly_briefing: true,
    enable_urgent_alerts: true,
    enable_budget_alerts: true,
    preferred_notification_time: "09:00",
    notification_frequency: "balanced",
    suggestion_aggressiveness: "moderate",
    auto_dismiss_old_suggestions: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (initialPreferences) {
      setPreferences({
        enable_daily_briefing: initialPreferences.enable_daily_briefing,
        enable_weekly_briefing: initialPreferences.enable_weekly_briefing,
        enable_urgent_alerts: initialPreferences.enable_urgent_alerts,
        enable_budget_alerts: initialPreferences.enable_budget_alerts,
        preferred_notification_time: initialPreferences.preferred_notification_time,
        notification_frequency: initialPreferences.notification_frequency,
        suggestion_aggressiveness: initialPreferences.suggestion_aggressiveness,
        auto_dismiss_old_suggestions: initialPreferences.auto_dismiss_old_suggestions,
      });
    }
  }, [initialPreferences]);

  const handleChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await aiAssistantAPI.updatePreferences(weddingId, preferences);
      toast.success("Preferences saved successfully");
      setHasChanges(false);
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to save preferences");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const aggressivenessLabels = {
    conservative: "Conservative - Only critical alerts",
    moderate: "Moderate - Balanced suggestions",
    proactive: "Proactive - Comprehensive guidance"
  };

  const frequencyLabels = {
    minimal: "Minimal - Only urgent items",
    balanced: "Balanced - Daily summary + alerts",
    detailed: "Detailed - All suggestions + briefings"
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Control when and how the AI assistant communicates with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Briefings */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Briefings</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="daily-briefing">Daily Briefing</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a daily summary each morning
                </p>
              </div>
              <Switch
                id="daily-briefing"
                checked={preferences.enable_daily_briefing}
                onCheckedChange={(checked) => handleChange('enable_daily_briefing', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-briefing">Weekly Briefing</Label>
                <p className="text-sm text-muted-foreground">
                  Get a strategic overview every Monday
                </p>
              </div>
              <Switch
                id="weekly-briefing"
                checked={preferences.enable_weekly_briefing}
                onCheckedChange={(checked) => handleChange('enable_weekly_briefing', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Alerts */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Alerts</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="urgent-alerts">Urgent Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about critical tasks and deadlines
                </p>
              </div>
              <Switch
                id="urgent-alerts"
                checked={preferences.enable_urgent_alerts}
                onCheckedChange={(checked) => handleChange('enable_urgent_alerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="budget-alerts">Budget Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive warnings about budget overruns
                </p>
              </div>
              <Switch
                id="budget-alerts"
                checked={preferences.enable_budget_alerts}
                onCheckedChange={(checked) => handleChange('enable_budget_alerts', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Timing */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <h4 className="text-sm font-semibold">Preferred Time</h4>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notification-time">Daily Briefing Time</Label>
              <Select
                value={preferences.preferred_notification_time}
                onValueChange={(value) => handleChange('preferred_notification_time', value)}
              >
                <SelectTrigger id="notification-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="07:00">7:00 AM</SelectItem>
                  <SelectItem value="08:00">8:00 AM</SelectItem>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                When you'd like to receive your daily briefing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Behavior
          </CardTitle>
          <CardDescription>
            Customize how the AI assistant works for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Notification Frequency</Label>
            <Select
              value={preferences.notification_frequency}
              onValueChange={(value) => handleChange('notification_frequency', value)}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {frequencyLabels[preferences.notification_frequency as keyof typeof frequencyLabels]}
            </p>
          </div>

          <Separator />

          {/* Suggestion Aggressiveness */}
          <div className="space-y-2">
            <Label htmlFor="aggressiveness">Suggestion Style</Label>
            <Select
              value={preferences.suggestion_aggressiveness}
              onValueChange={(value) => handleChange('suggestion_aggressiveness', value)}
            >
              <SelectTrigger id="aggressiveness">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="proactive">Proactive</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {aggressivenessLabels[preferences.suggestion_aggressiveness as keyof typeof aggressivenessLabels]}
            </p>
          </div>

          <Separator />

          {/* Auto Dismiss */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-dismiss">Auto-dismiss Old Suggestions</Label>
              <p className="text-sm text-muted-foreground">
                Automatically remove outdated suggestions
              </p>
            </div>
            <Switch
              id="auto-dismiss"
              checked={preferences.auto_dismiss_old_suggestions}
              onCheckedChange={(checked) => handleChange('auto_dismiss_old_suggestions', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Shield className="h-5 w-5" />
            Privacy & Control
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            • You have full control over AI suggestions and can dismiss any at any time
          </p>
          <p>
            • The AI learns from your responses to provide better suggestions
          </p>
          <p>
            • All suggestions are transparent with clear reasoning
          </p>
          <p>
            • You can adjust or disable AI features anytime
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
