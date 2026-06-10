"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Settings, Image as ImageIcon, MapPin, Phone, Mail, Loader2 } from "lucide-react";
import { useSystemSettings } from "@/contexts/system-settings-context";
import { apiClient } from "@/lib/api-client";

export function AdminSystemSettings() {
  const { settings, updateSettings } = useSystemSettings();
  const [isLoading, setIsLoading] = useState(false);

  // Local state to manage form fields before saving
  const [formData, setFormData] = useState({
    logoUrl: settings.logoUrl,
    homeHeroImageUrl: settings.homeHeroImageUrl,
    authBackgroundImageUrl: settings.authBackgroundImageUrl,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    contactLocationLine1: settings.contactLocationLine1,
    contactLocationLine2: settings.contactLocationLine2,
  });

  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(prev => ({ ...prev, [fieldName]: true }));
      try {
        const response = await apiClient.upload.general(file, 'system_settings');
        // Handle various backend response formats gracefully
        const uploadedUrl = response.data?.url || response.data || '';
        
        if (uploadedUrl) {
          setFormData(prev => ({ ...prev, [fieldName]: uploadedUrl }));
          toast.success("Image uploaded successfully.");
        } else {
          throw new Error("Invalid URL returned from server.");
        }
      } catch (error) {
        console.error("Upload failed", error);
        toast.error("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(prev => ({ ...prev, [fieldName]: false }));
      }
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await apiClient.admin.systemSettings.update(formData);
      updateSettings(formData);
      toast.success("System settings saved successfully.");
    } catch (error) {
      console.error("Failed to save system settings", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-[#668c65]" />
            Brand Assets & Imagery
          </CardTitle>
          <CardDescription>
            Update the primary global images across the platform. You may use external image URLs or local paths.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Logo Field */}
          <div className="space-y-3">
            <Label>System Logo</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {formData.logoUrl && (
                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center p-2 shadow-sm">
                   <img src={formData.logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              <div className="flex-1 w-full">
                <Label htmlFor="logoUrl" className="cursor-pointer block relative">
                  <div className={`border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center transition-all duration-300 ${isUploading['logoUrl'] ? 'opacity-50' : 'hover:bg-[#668c65]/5 hover:border-[#668c65]'}`}>
                    {isUploading['logoUrl'] ? (
                      <Loader2 className="h-8 w-8 animate-spin text-[#668c65] mx-auto mb-3" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                    )}
                    <span className="text-sm font-bold text-[#668c65]">
                      {isUploading['logoUrl'] ? 'Uploading...' : 'Click to browse files'}
                    </span>
                    <p className="text-xs text-slate-400 mt-1 font-normal">PNG, JPG or SVG (Max 2MB)</p>
                  </div>
                  <input 
                    type="file" 
                    id="logoUrl" 
                    accept="image/*" 
                    className="hidden" 
                    disabled={isUploading['logoUrl']}
                    onChange={(e) => handleImageUpload(e, 'logoUrl')} 
                  />
                </Label>
              </div>
            </div>
          </div>

          {/* Home Hero Field */}
          <div className="space-y-3">
            <Label>Home Page Hero Image</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {formData.homeHeroImageUrl && (
                <div className="h-24 w-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-sm">
                   <img src={formData.homeHeroImageUrl} alt="Hero preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 w-full">
                <Label htmlFor="homeHeroImageUrl" className="cursor-pointer block relative">
                  <div className={`border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center transition-all duration-300 ${isUploading['homeHeroImageUrl'] ? 'opacity-50' : 'hover:bg-[#668c65]/5 hover:border-[#668c65]'}`}>
                    {isUploading['homeHeroImageUrl'] ? (
                      <Loader2 className="h-8 w-8 animate-spin text-[#668c65] mx-auto mb-3" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                    )}
                    <span className="text-sm font-bold text-[#668c65]">
                      {isUploading['homeHeroImageUrl'] ? 'Uploading...' : 'Upload hero cover'}
                    </span>
                    <p className="text-xs text-slate-400 mt-1 font-normal">High-res immersive imagery ideal</p>
                  </div>
                  <input 
                    type="file" 
                    id="homeHeroImageUrl" 
                    accept="image/*" 
                    className="hidden"
                    disabled={isUploading['homeHeroImageUrl']}
                    onChange={(e) => handleImageUpload(e, 'homeHeroImageUrl')} 
                  />
                </Label>
              </div>
            </div>
          </div>

          {/* Auth Field */}
          <div className="space-y-3">
            <Label>Authentication Screens Background</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {formData.authBackgroundImageUrl && (
                <div className="h-32 w-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-sm">
                   <img src={formData.authBackgroundImageUrl} alt="Auth preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 w-full">
                <Label htmlFor="authBackgroundImageUrl" className="cursor-pointer block relative">
                  <div className={`border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center transition-all duration-300 ${isUploading['authBackgroundImageUrl'] ? 'opacity-50' : 'hover:bg-[#668c65]/5 hover:border-[#668c65]'}`}>
                    {isUploading['authBackgroundImageUrl'] ? (
                      <Loader2 className="h-8 w-8 animate-spin text-[#668c65] mx-auto mb-3" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                    )}
                    <span className="text-sm font-bold text-[#668c65]">
                      {isUploading['authBackgroundImageUrl'] ? 'Uploading...' : 'Upload auth background'}
                    </span>
                    <p className="text-xs text-slate-400 mt-1 font-normal">Vertical imagery works best</p>
                  </div>
                  <input 
                    type="file" 
                    id="authBackgroundImageUrl" 
                    accept="image/*" 
                    className="hidden" 
                    disabled={isUploading['authBackgroundImageUrl']}
                    onChange={(e) => handleImageUpload(e, 'authBackgroundImageUrl')} 
                  />
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#668c65]" />
            Operational Support Info
          </CardTitle>
          <CardDescription>
            Update contact information globally visible on the footer.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> Support Email</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              placeholder="support@vownest.rw"
              value={formData.contactEmail}
              onChange={handleChange}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> Phone Number</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              placeholder="+250 788 000 000"
              value={formData.contactPhone}
              onChange={handleChange}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactLocationLine1" className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> Location (City, Country)</Label>
            <Input
              id="contactLocationLine1"
              name="contactLocationLine1"
              placeholder="Kigali, Rwanda"
              value={formData.contactLocationLine1}
              onChange={handleChange}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactLocationLine2">Location (Street, Building)</Label>
            <Input
              id="contactLocationLine2"
              name="contactLocationLine2"
              placeholder="KN 2 Rd, Nyarugenge"
              value={formData.contactLocationLine2}
              onChange={handleChange}
              className="rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="rounded-xl bg-[#668c65] hover:bg-[#557555] px-8 text-white font-medium"
        >
          {isLoading ? "Broadcasting Changes..." : "Apply System Settings"}
        </Button>
      </div>
    </div>
  );
}
