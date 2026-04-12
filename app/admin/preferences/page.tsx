"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Bell, Globe, Moon, Sun, Shield, Eye, Database } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

export default function AdminPreferencesPage() {
  const router = useRouter();
  const { language, setLanguage } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    newUserAlerts: true,
    verificationRequests: true,
    reportedContent: true,
    systemAlerts: true,
    securityAlerts: true,
  });

  const [display, setDisplay] = useState({
    theme: "light",
    compactMode: false,
    showAdvancedOptions: true,
  });

  const [system, setSystem] = useState({
    autoApproveProviders: false,
    requireEmailVerification: true,
    enableMaintenanceMode: false,
    logDetailedActivity: true,
  });

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('adminPreferences', JSON.stringify({
        notifications,
        display,
        system,
        language,
      }));
      
      toast.success("Preferences saved successfully");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafc] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-serif italic text-slate-900">Admin Preferences</h1>
          <p className="text-sm text-slate-500 mt-2 uppercase tracking-wider">
            Customize admin panel settings
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#668c65]" />
                Language & Region
              </CardTitle>
              <CardDescription>
                Choose your preferred language and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language" className="rounded-xl">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    <SelectItem value="sw">🇰🇪 Kiswahili</SelectItem>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                    <SelectItem value="pt">🇵🇹 Português</SelectItem>
                    <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                    <SelectItem value="zh">🇨🇳 中文</SelectItem>
                    <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#668c65]" />
                Admin Notifications
              </CardTitle>
              <CardDescription>
                Manage administrative notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-slate-500">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-slate-500">Receive push notifications in browser</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, pushNotifications: checked })
                  }
                />
              </div>

              <div className="border-t border-slate-100 pt-4 mt-4">
                <h4 className="text-sm font-medium mb-4">Alert Types</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-user-alerts">New User Registrations</Label>
                      <p className="text-sm text-slate-500">Alert when new users register</p>
                    </div>
                    <Switch
                      id="new-user-alerts"
                      checked={notifications.newUserAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, newUserAlerts: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="verification-requests">Verification Requests</Label>
                      <p className="text-sm text-slate-500">Provider verification submissions</p>
                    </div>
                    <Switch
                      id="verification-requests"
                      checked={notifications.verificationRequests}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, verificationRequests: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="reported-content">Reported Content</Label>
                      <p className="text-sm text-slate-500">User reports and flags</p>
                    </div>
                    <Switch
                      id="reported-content"
                      checked={notifications.reportedContent}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, reportedContent: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="system-alerts">System Alerts</Label>
                      <p className="text-sm text-slate-500">System performance and errors</p>
                    </div>
                    <Switch
                      id="system-alerts"
                      checked={notifications.systemAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, systemAlerts: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="security-alerts">Security Alerts</Label>
                      <p className="text-sm text-slate-500">Security incidents and threats</p>
                    </div>
                    <Switch
                      id="security-alerts"
                      checked={notifications.securityAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, securityAlerts: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#668c65]" />
                Display
              </CardTitle>
              <CardDescription>
                Customize admin panel appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select 
                  value={display.theme} 
                  onValueChange={(value) => setDisplay({ ...display, theme: value })}
                >
                  <SelectTrigger id="theme" className="rounded-xl">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="auto">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Auto (System)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <p className="text-sm text-slate-500">Show more data in less space</p>
                </div>
                <Switch
                  id="compact-mode"
                  checked={display.compactMode}
                  onCheckedChange={(checked) => 
                    setDisplay({ ...display, compactMode: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-advanced-options">Show Advanced Options</Label>
                  <p className="text-sm text-slate-500">Display advanced admin features</p>
                </div>
                <Switch
                  id="show-advanced-options"
                  checked={display.showAdvancedOptions}
                  onCheckedChange={(checked) => 
                    setDisplay({ ...display, showAdvancedOptions: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 border-amber-200 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-amber-600" />
                System Settings
              </CardTitle>
              <CardDescription className="text-amber-700">
                Critical system-wide settings (use with caution)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-approve-providers">Auto-Approve Providers</Label>
                  <p className="text-sm text-slate-500">Automatically verify new providers</p>
                </div>
                <Switch
                  id="auto-approve-providers"
                  checked={system.autoApproveProviders}
                  onCheckedChange={(checked) => 
                    setSystem({ ...system, autoApproveProviders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="require-email-verification">Require Email Verification</Label>
                  <p className="text-sm text-slate-500">Users must verify email to access features</p>
                </div>
                <Switch
                  id="require-email-verification"
                  checked={system.requireEmailVerification}
                  onCheckedChange={(checked) => 
                    setSystem({ ...system, requireEmailVerification: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-slate-500">Disable site for maintenance</p>
                </div>
                <Switch
                  id="enable-maintenance-mode"
                  checked={system.enableMaintenanceMode}
                  onCheckedChange={(checked) => 
                    setSystem({ ...system, enableMaintenanceMode: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="log-detailed-activity">Detailed Activity Logging</Label>
                  <p className="text-sm text-slate-500">Log all user actions for audit</p>
                </div>
                <Switch
                  id="log-detailed-activity"
                  checked={system.logDetailedActivity}
                  onCheckedChange={(checked) => 
                    setSystem({ ...system, logDetailedActivity: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSavePreferences}
              disabled={isLoading}
              className="rounded-xl bg-[#668c65] hover:bg-[#557555] px-8"
            >
              {isLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
