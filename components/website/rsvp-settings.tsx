"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, WeddingWebsite, WeddingWebsiteSection } from "@/lib/api";
import { queryKeys } from "@/lib/cache";
import { toast } from "sonner";

interface RsvpSettingsProps {
  weddingId: string;
  website: WeddingWebsite;
}

const DEFAULT_MEALS = ["Standard", "Vegetarian", "Vegan", "Halal"];

export function RsvpSettings({ weddingId, website }: RsvpSettingsProps) {
  const queryClient = useQueryClient();
  const rsvpSection = (website.sections || []).find((s) => s.section_type === "rsvp");
  const content = (rsvpSection?.content || {}) as Record<string, unknown>;

  const [enabled, setEnabled] = useState(content.enabled !== false);
  const [allowPlusOne, setAllowPlusOne] = useState(content.allow_plus_one !== false);
  const [showGuestCount, setShowGuestCount] = useState(content.show_guest_count !== false);
  const [showChildren, setShowChildren] = useState(content.show_children !== false);
  const [showMeal, setShowMeal] = useState(content.show_meal !== false);
  const [showDietary, setShowDietary] = useState(content.show_dietary !== false);
  const [showSpecialRequests, setShowSpecialRequests] = useState(content.show_special_requests !== false);
  const [confirmationMessage, setConfirmationMessage] = useState(
    (content.confirmation_message as string) || "Thank you! Your RSVP has been recorded.",
  );
  const [deadline, setDeadline] = useState((content.rsvp_deadline as string) || "");
  const [mealOptions, setMealOptions] = useState<string[]>(
    (content.meal_options as string[]) || DEFAULT_MEALS,
  );
  const [newMeal, setNewMeal] = useState("");

  useEffect(() => {
    const c = (rsvpSection?.content || {}) as Record<string, unknown>;
    setEnabled(c.enabled !== false);
    setAllowPlusOne(c.allow_plus_one !== false);
    setShowGuestCount(c.show_guest_count !== false);
    setShowChildren(c.show_children !== false);
    setShowMeal(c.show_meal !== false);
    setShowDietary(c.show_dietary !== false);
    setShowSpecialRequests(c.show_special_requests !== false);
    setConfirmationMessage((c.confirmation_message as string) || "Thank you! Your RSVP has been recorded.");
    setDeadline((c.rsvp_deadline as string) || "");
    setMealOptions((c.meal_options as string[]) || DEFAULT_MEALS);
  }, [rsvpSection?.id, rsvpSection?.content]);

  const saveMutation = useMutation({
    mutationFn: async (next: Record<string, unknown>) => {
      if (!rsvpSection) {
        const created = await apiClient.website.createSection<WeddingWebsiteSection>(weddingId, {
          section_type: "rsvp",
          title: "RSVP",
          content: next,
        });
        return created;
      }
      return apiClient.website.updateSection(weddingId, rsvpSection.id, { content: next });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wedding.website(weddingId) });
      toast.success("RSVP settings saved");
    },
    onError: () => toast.error("Failed to save RSVP settings"),
  });

  const buildPayload = (overrides: Record<string, unknown> = {}) => ({
    enabled,
    allow_plus_one: allowPlusOne,
    show_guest_count: showGuestCount,
    show_children: showChildren,
    show_meal: showMeal,
    show_dietary: showDietary,
    show_special_requests: showSpecialRequests,
    confirmation_message: confirmationMessage,
    rsvp_deadline: deadline || null,
    meal_options: mealOptions,
    ...overrides,
  });

  const save = () => saveMutation.mutate(buildPayload());

  const addMeal = () => {
    const value = newMeal.trim();
    if (!value || mealOptions.includes(value)) return;
    const next = [...mealOptions, value];
    setMealOptions(next);
    setNewMeal("");
  };

  const removeMeal = (meal: string) => {
    setMealOptions(mealOptions.filter((m) => m !== meal));
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="font-serif text-lg">RSVP Settings</CardTitle>
        <CardDescription>
          Configure the public RSVP form — meal options, plus-ones, and confirmation message
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label>RSVP Enabled</Label>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label>Allow Plus One</Label>
            <Switch checked={allowPlusOne} onCheckedChange={setAllowPlusOne} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label>Guest Count</Label>
            <Switch checked={showGuestCount} onCheckedChange={setShowGuestCount} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label>Children Count</Label>
            <Switch checked={showChildren} onCheckedChange={setShowChildren} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label>Meal Selection</Label>
            <Switch checked={showMeal} onCheckedChange={setShowMeal} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label>Dietary Restrictions</Label>
            <Switch checked={showDietary} onCheckedChange={setShowDietary} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
            <Label>Special Requests</Label>
            <Switch checked={showSpecialRequests} onCheckedChange={setShowSpecialRequests} />
          </div>
        </div>

        <div>
          <Label htmlFor="deadline">RSVP Deadline</Label>
          <Input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1 max-w-xs"
          />
        </div>

        <div>
          <Label htmlFor="confirm-msg">Confirmation Message</Label>
          <Input
            id="confirm-msg"
            value={confirmationMessage}
            onChange={(e) => setConfirmationMessage(e.target.value)}
            className="mt-1"
          />
        </div>

        {showMeal && (
          <div className="space-y-3">
            <Label>Meal Options</Label>
            <div className="flex flex-wrap gap-2">
              {mealOptions.map((meal) => (
                <span
                  key={meal}
                  className="inline-flex items-center gap-1 rounded-full border bg-slate-50 px-3 py-1 text-sm"
                >
                  {meal}
                  <button type="button" onClick={() => removeMeal(meal)} className="text-slate-400 hover:text-slate-700">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <Input
                value={newMeal}
                onChange={(e) => setNewMeal(e.target.value)}
                placeholder="Add meal option"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMeal())}
              />
              <Button type="button" variant="outline" onClick={addMeal}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Button onClick={save} disabled={saveMutation.isPending} className="bg-[#668c65] hover:bg-[#668c65]/90">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save RSVP Settings
        </Button>
      </CardContent>
    </Card>
  );
}
