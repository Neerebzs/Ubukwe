"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Bell, Globe, Moon, Sun, Mail, MessageSquare, Calendar, Shield, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { TwoFactorSettings } from "@/components/security/TwoFactorSettings";
import { useAuth } from "@/hooks/useAuth";

export default function ProviderPreferencesPage() {
  const router = useRouter();
  const { language, setLanguage } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    bookingAlerts: true,
    messageAlerts: true,
    reviewAlerts: true,
    marketingEmails: false,
  });

  // Display preferences
  const [display, setDisplay] = useState({
    theme: "light",
    compactMode: false,
    showProfilePublic: true,
  });

  // Privacy preferences
  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showPhone: true,
    showLocation: true,
    allowMessages: true,
  });

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      // Save to localStorage for now (can be extended to API)
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
    <div className="min-h-screen bg-[#f9fafc] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-serif italic text-slate-900">Preferences</h1>
          <p className="text-sm text-slate-500 mt-2 uppercase tracking-wider">
            Customize your experience
          </p>
        </div>

        <div className="space-y-6">
          {/* Language & Region */}
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

          {/* Notification Preferences */}
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

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-slate-500">Receive notifications via SMS</p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={notifications.smsNotifications}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, smsNotifications: checked })
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

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing-emails">Marketing Emails</Label>
                      <p className="text-sm text-slate-500">Tips, updates, and promotions</p>
                    </div>
                    <Switch
                      id="marketing-emails"
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, marketingEmails: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Preferences */}
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

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-profile-public">Public Profile Visibility</Label>
                  <p className="text-sm text-slate-500">Show your profile to customers</p>
                </div>
                <Switch
                  id="show-profile-public"
                  checked={display.showProfilePublic}
                  onCheckedChange={(checked) => 
                    setDisplay({ ...display, showProfilePublic: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Preferences */}
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
                  <Label htmlFor="show-location">Show Location</Label>
                  <p className="text-sm text-slate-500">Display location on public profile</p>
                </div>
                <Switch
                  id="show-location"
                  checked={privacy.showLocation}
                  onCheckedChange={(checked) => 
                    setPrivacy({ ...privacy, showLocation: checked })
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

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSavePreferences}
              disabled={isLoading}
              className="rounded-xl bg-[#668c65] hover:bg-[#557555] px-8"
            >
              {isLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </div>

          {/* ── Two-Factor Authentication ── */}
          <TwoFactorSettings userEmail={user?.email ?? ""} />
        </div>
      </div>
    </div>
  );
}
