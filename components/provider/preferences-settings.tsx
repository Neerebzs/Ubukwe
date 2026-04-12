"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Globe, Moon, Sun, Shield, Eye } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

export function ProviderPreferencesSettings() {
  const { language, setLanguage } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    bookingAlerts: true,
    messageAlerts: true,
    reviewAlerts: true,
    marketingEmails: false,
  });

  const [display, setDisplay] = useState({
    theme: "light",
    compactMode: false,
    showProfilePublic: true,
  });

  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showPhone: true,
    showLocation: true,
    allowMessages: true,
  });

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('userPreferences', JSON.stringify({
        notifications,
        display,
        privacy,
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
            Notifications
          </CardTitle>
          <CardDescription>
            Manage how you receive notifications
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
            <h4 className="text-sm font-medium mb-4">Notification Types</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="booking-alerts">Booking Alerts</Label>
                  <p className="text-sm text-slate-500">New bookings and updates</p>
                </div>
                <Switch
                  id="booking-alerts"
                  checked={notifications.bookingAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, bookingAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="message-alerts">Message Alerts</Label>
                  <p className="text-sm text-slate-500">New messages from customers</p>
                </div>
                <Switch
                  id="message-alerts"
                  checked={notifications.messageAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, messageAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="review-alerts">Review Alerts</Label>
                  <p className="text-sm text-slate-500">New reviews and ratings</p>
                </div>
                <Switch
                  id="review-alerts"
                  checked={notifications.reviewAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, reviewAlerts: checked })
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
            Customize how the interface looks
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
              <p className="text-sm text-slate-500">Show more content in less space</p>
            </div>
            <Switch
              id="compact-mode"
              checked={display.compactMode}
              onCheckedChange={(checked) => 
                setDisplay({ ...display, compactMode: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#668c65]" />
            Privacy
          </CardTitle>
          <CardDescription>
            Control what information is visible to others
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-email">Show Email Address</Label>
              <p className="text-sm text-slate-500">Display email on public profile</p>
            </div>
            <Switch
              id="show-email"
              checked={privacy.showEmail}
              onCheckedChange={(checked) => 
                setPrivacy({ ...privacy, showEmail: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-phone">Show Phone Number</Label>
              <p className="text-sm text-slate-500">Display phone on public profile</p>
            </div>
            <Switch
              id="show-phone"
              checked={privacy.showPhone}
              onCheckedChange={(checked) => 
                setPrivacy({ ...privacy, showPhone: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-messages">Allow Direct Messages</Label>
              <p className="text-sm text-slate-500">Let customers message you directly</p>
            </div>
            <Switch
              id="allow-messages"
              checked={privacy.allowMessages}
              onCheckedChange={(checked) => 
                setPrivacy({ ...privacy, allowMessages: checked })
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
  );
}
