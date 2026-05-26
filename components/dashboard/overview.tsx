"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, CheckCircle, Star, Edit2, Save, X, Heart, DollarSign, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS, Wedding, ProviderService, WeddingTask } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface OverviewProps {
  weddingDetails: {
    coupleName: string;
    weddingDate: string;
    guestCount: number;
    budget: number;
    spent: number;
  };
  onBudgetUpdate?: (newBudget: number) => void;
}

export function Overview({
  weddingDetails,
  onBudgetUpdate,
}: OverviewProps) {
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch real wedding details
  const { data: weddingResponse, isLoading } = useQuery<Wedding | null>({
    queryKey: ["wedding-me"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<Wedding>(API_ENDPOINTS.WEDDING.ME);
        return response.data || null;
      } catch (err: any) {
        if (err.message.includes("404")) return null;
        throw err;
      }
    }
  });

  // Fetch wedding tasks for progress calculation
  const { data: tasks } = useQuery<any[]>({
    queryKey: ["wedding-tasks"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<any>(API_ENDPOINTS.WEDDING.TASKS);
        const data = response.data;
        if (Array.isArray(data)) {
          return data;
        } else if (data && Array.isArray((data as any).data)) {
          return (data as any).data;
        } else if (data && typeof data === 'object' && (data as any).tasks && Array.isArray((data as any).tasks)) {
          return (data as any).tasks;
        }
        return [];
      } catch (err: any) {
        if (err.message.includes("404")) return [];
        throw err;
      }
    },
    enabled: !!weddingResponse
  });

  // Fetch recommended services
  const { data: recommendationsRes } = useQuery<ProviderService[]>({
    queryKey: ["service-recommendations"],
    queryFn: async () => {
      const response = await apiClient.get<ProviderService[]>(API_ENDPOINTS.SERVICES.LIST);
      return (response.data || []).slice(0, 3);
    }
  });

  const recommendedServices = recommendationsRes || [];
  const currentWedding = (weddingResponse as any) || null;
  const tasksArray = tasks || [];

  // Calculate real planning progress
  const completedTasks = tasksArray.filter((task: any) => task.is_completed).length;
  const totalTasks = tasksArray.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const planningProgress = {
    completed: completedTasks,
    total: totalTasks,
    percentage: progressPercentage
  };

  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [budget, setBudget] = useState("");

  const parseCoupleName = (coupleName?: string) => {
    if (!coupleName) return { bride: "", groom: "" };
    const parts = coupleName.split(" & ");
    return {
      bride: parts[0]?.trim() || "",
      groom: parts[1]?.trim() || ""
    };
  };

  // Normalize wedding data
  const displayWedding = {
    coupleName: currentWedding?.couple_name || weddingDetails.coupleName,
    weddingDate: currentWedding?.wedding_date || weddingDetails.weddingDate,
    guestCount: currentWedding?.guest_count ?? weddingDetails.guestCount,
    budget: currentWedding ? Number(currentWedding.budget) : (weddingDetails.budget || 0),
    spent: currentWedding ? Number(currentWedding.spent) : (weddingDetails.spent || 0),
    venue: currentWedding?.venue || (weddingDetails as any).venue || "Not set"
  };

  const handleEditClick = () => {
    const { bride, groom } = parseCoupleName(displayWedding.coupleName);
    setBrideName(bride);
    setGroomName(groom);
    setWeddingDate(displayWedding.weddingDate || "");
    setGuestCount(displayWedding.guestCount?.toString() || "");
    setBudget(displayWedding.budget?.toString() || "");
    setIsEditDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (currentWedding) {
        return apiClient.put(API_ENDPOINTS.WEDDING.ME, data);
      } else {
        return apiClient.post(API_ENDPOINTS.WEDDING.BASE, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding-me"] });
      toast.success("Wedding details updated successfully");
      setIsEditDialogOpen(false);
      if (budget && onBudgetUpdate) {
        onBudgetUpdate(parseFloat(budget));
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update wedding details");
    }
  });

  const handleSave = () => {
    if (!brideName || !groomName || !weddingDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    const updateData: any = {
      bride_name: brideName,
      groom_name: groomName,
      wedding_date: weddingDate
    };
    if (guestCount) updateData.guest_count = parseInt(guestCount);
    if (budget) updateData.budget = budget;
    saveMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Wedding details card skeleton */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-5 bg-slate-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
        {/* Budget card skeleton */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4" />
          <div className="h-3 bg-slate-200 rounded-full w-full" />
          <div className="flex justify-between">
            <div className="h-4 bg-slate-100 rounded w-24" />
            <div className="h-4 bg-slate-100 rounded w-24" />
          </div>
        </div>
        {/* Countdown skeleton */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-slate-200" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const isDetailsSet = !!currentWedding;
  const budgetUsedPercentage = displayWedding.budget > 0 ? (displayWedding.spent / displayWedding.budget) * 100 : 0;
  const budgetWarning = budgetUsedPercentage > 90;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Wedding Details Card */}
      <Card className="border-none shadow-[0_20px_50px_rgba(13,148,136,0.05)] bg-white/95 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
        <CardHeader className="pt-10 px-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <CardTitle className="flex items-center text-3xl font-serif italic text-slate-800 tracking-tight">
                <div className="p-2.5 bg-sage-50 rounded-2xl mr-4">
                  <Heart className="h-6 w-6 text-sage-600 fill-sage-600/10" />
                </div>
                Your Celebration
              </CardTitle>
              <p className="text-slate-500 font-medium text-sm ml-16">Curating every precious detail of your story</p>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant={isDetailsSet ? "outline" : "default"}
                  size="lg"
                  onClick={handleEditClick}
                  className={`rounded-2xl px-8 h-12 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${isDetailsSet
                    ? "border-sage-100 text-sage-700 hover:bg-sage-50 hover:border-sage-200"
                    : "shadow-lg"
                    }`}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  {isDetailsSet ? "Refine Details" : "Set Celebration"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[550px] rounded-[2.5rem] border-none shadow-2xl p-10 bg-white/95 backdrop-blur-sm">
                <DialogHeader className="mb-6">
                  <DialogTitle className="font-serif italic text-3xl text-slate-800">Wedding Information</DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium mt-2">
                    Gracefully update the heart of your celebration below.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bride-name" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Bride's Name</Label>
                      <Input
                        id="bride-name"
                        value={brideName}
                        onChange={(e) => setBrideName(e.target.value)}
                        className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-sage-500 transition-all font-medium"
                        placeholder="Grace"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groom-name" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Groom's Name</Label>
                      <Input
                        id="groom-name"
                        value={groomName}
                        onChange={(e) => setGroomName(e.target.value)}
                        className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-sage-500 transition-all font-medium"
                        placeholder="Emile"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wedding-date" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Celebration Date</Label>
                    <Input
                      id="wedding-date"
                      type="date"
                      value={weddingDate}
                      onChange={(e) => setWeddingDate(e.target.value)}
                      className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-sage-500 transition-all font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="guest-count" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Estimated Guests</Label>
                      <Input
                        id="guest-count"
                        type="number"
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-sage-500 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Investment (RWF)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-sage-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-8 flex gap-3">
                  <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-2xl h-12 px-6 font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50">Cancel</Button>
                  <Button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="flex-1 text-white rounded-2xl h-12 font-bold uppercase tracking-widest transition-all shadow-lg px-6"
                  >
                    {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Preserve Details
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="px-10 pb-12">
          <div className="grid md:grid-cols-3 gap-8 mt-4">
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 group transition-all duration-500 hover:bg-white hover:shadow-xl hover:shadow-sage-500/5 hover:-translate-y-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">The Bride</div>
              <div className={`text-2xl font-serif italic ${isDetailsSet ? 'text-sage-700' : 'text-slate-300'}`}>
                {parseCoupleName(displayWedding.coupleName).bride || "Not set"}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 group transition-all duration-500 hover:bg-white hover:shadow-xl hover:shadow-sage-500/5 hover:-translate-y-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">The Groom</div>
              <div className={`text-2xl font-serif italic ${isDetailsSet ? 'text-sage-700' : 'text-slate-300'}`}>
                {parseCoupleName(displayWedding.coupleName).groom || "Not set"}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 group transition-all duration-500 hover:bg-white hover:shadow-xl hover:shadow-sage-500/5 hover:-translate-y-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">Celebration Date</div>
              <div className={`text-xl font-medium ${isDetailsSet ? 'text-slate-800 tracking-tight' : 'text-slate-300'}`}>
                {isDetailsSet ? new Date(displayWedding.weddingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Not set"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wedding Statistics */}
      <div className="grid md:grid-cols-4 gap-8">
        {[
          {
            title: "Investment Used",
            value: displayWedding.budget > 0 ? `${budgetUsedPercentage.toFixed(0)}%` : "0%",
            subtitle: "On Track",
            icon: DollarSign,
            color: "teal",
            warning: budgetWarning,
          },
          {
            title: "Milestones",
            value: `${planningProgress.percentage}%`,
            subtitle: "Trending Up",
            icon: CheckCircle,
            color: "emerald",
          },
          {
            title: "High Priority",
            value: tasksArray.filter((t: any) => !t.is_completed && t.priority === "high").length,
            subtitle: "Action Required",
            icon: AlertTriangle,
            color: "amber",
          },
          {
            title: "Days To Go",
            value: isDetailsSet ? Math.max(0, Math.ceil((new Date(displayWedding.weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : "--",
            subtitle: "Approaching",
            icon: Clock,
            color: "sky",
          },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.03)] rounded-[2rem] overflow-hidden bg-white group hover:shadow-xl hover:shadow-sage-500/10 transition-all duration-500 hover:-translate-y-1">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className={`p-4 rounded-2xl mb-5 group-hover:scale-110 transition-all duration-500 ${stat.color === 'teal' ? 'bg-sage-50 text-sage-600' :
                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                  stat.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'
                }`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-4xl font-serif italic text-slate-800 tracking-tight">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-3">{stat.title}</div>

              <div className={`mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-300 ${stat.color === 'teal' ? 'bg-sage-50/50 border-sage-100 text-sage-700' :
                stat.color === 'emerald' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' :
                  stat.color === 'amber' ? 'bg-amber-50/50 border-amber-100 text-amber-700' : 'bg-sky-50/50 border-sky-100 text-sky-700'
                } group-hover:bg-white group-hover:border-transparent group-hover:shadow-sm`}>
                <TrendingUp className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase">{stat.subtitle}</span>
              </div>

              {stat.warning && (
                <div className="mt-4 animate-bounce">
                  <Badge variant="destructive" className="bg-rose-500 text-white border-none text-[10px] rounded-full px-4 h-6 uppercase font-bold tracking-widest shadow-lg shadow-rose-500/20">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Re-Budget
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Wedding Progress */}
      <Card className="border-none shadow-[0_15px_40px_rgba(0,0,0,0.02)] rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="pt-10 px-10">
          <CardTitle className="flex items-center text-2xl font-serif italic text-slate-800">
            <div className="p-2 bg-sage-50 rounded-xl mr-4">
              <Calendar className="h-5 w-5 text-sage-600" />
            </div>
            Planning Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="px-10 pb-12">
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Progress Report</span>
                <p className="text-slate-600 font-medium">
                  You've gracefully completed <span className="text-sage-600 font-bold">{planningProgress.completed}</span> of <span className="text-sage-600 font-bold">{planningProgress.total}</span> essential tasks.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-sage-50/50 px-5 py-2.5 rounded-2xl border border-sage-100/50">
                <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-sage-700 uppercase tracking-widest">{planningProgress.percentage}% Complete</span>
              </div>
            </div>

            <div className="relative pt-2">
              <Progress value={planningProgress.percentage} className="h-4 bg-slate-50 [&>div]:bg-sage-600 rounded-full border border-slate-100" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
              {[
                { label: "Days To Go", value: isDetailsSet ? Math.max(0, Math.ceil((new Date(displayWedding.weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : "--", icon: Clock },
                { label: "Guest List", value: isDetailsSet ? displayWedding.guestCount : "--", icon: Heart },
                { label: "Artisans", value: recommendedServices.length, icon: Star },
                { label: "Investment Used", value: isDetailsSet ? `${Math.round((Number(displayWedding.spent) / Number(displayWedding.budget)) * 100)}%` : "0%", icon: DollarSign },
              ].map((item, idx) => (
                <div key={idx} className="text-center p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-sage-500/5 hover:-translate-y-1 group">
                  <div className="text-4xl font-serif italic text-sage-700 group-hover:scale-110 transition-transform mb-2">
                    {item.value}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{item.label}</div>
                  <item.icon className="h-3 w-3 text-sage-200 mx-auto mt-3 group-hover:text-sage-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-[0_15px_40px_rgba(0,0,0,0.02)] rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="pt-10 px-10">
            <CardTitle className="flex items-center text-2xl font-serif italic text-slate-800">
              <div className="p-2 bg-sage-50 rounded-xl mr-4">
                <CheckCircle className="h-5 w-5 text-sage-600" />
              </div>
              Immediate Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="px-10 pb-12 space-y-4">
            {tasksArray.length > 0 ? (
              tasksArray
                .filter((task: any) => !task.is_completed)
                .slice(0, 5)
                .map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-sage-500/5 transition-all duration-300 rounded-2xl border border-transparent hover:border-sage-50 group">
                    <div className="flex items-center space-x-5">
                      <div className="w-6 h-6 border-2 border-slate-200 rounded-full flex items-center justify-center group-hover:border-sage-400 transition-colors">
                        <div className="w-2 h-2 bg-sage-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{task.title}</span>
                    </div>
                    {task.priority && (
                      <Badge className={`text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1 border-none rounded-full ${task.priority === 'high' ? 'bg-rose-50 text-rose-600' :
                          task.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                        {task.priority}
                      </Badge>
                    )}
                  </div>
                ))
            ) : (
              <div className="text-center py-20 bg-slate-50/30 rounded-[2rem] border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-serif italic">Your journey is beautifully on track.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_15px_40px_rgba(0,0,0,0.02)] rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="pt-10 px-10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-2xl font-serif italic text-slate-800">
                <div className="p-2 bg-sage-50 rounded-xl mr-4">
                  <Star className="h-5 w-5 text-sage-600" />
                </div>
                Artisanal Curations
              </CardTitle>
              <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-sage-600 hover:text-sage-700 hover:bg-sage-50 rounded-full h-8">Discover All</Button>
            </div>
          </CardHeader>
          <CardContent className="px-10 pb-12 space-y-4">
            {recommendedServices.length > 0 ? recommendedServices.map((service: any) => (
              <div key={service.id} className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-sage-500/5 transition-all duration-500 rounded-2xl border border-transparent hover:border-sage-50 group">
                <div className="flex items-center space-x-5">
                  <div className="w-12 h-12 bg-sage-50 rounded-2xl flex items-center justify-center text-sage-700 font-serif italic text-lg shadow-sm border border-sage-100/50 group-hover:scale-105 transition-transform">
                    {service.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-bold text-sm tracking-tight group-hover:text-sage-700 transition-colors uppercase leading-none mb-1">{service.name}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{service.category}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <p className="text-sm font-extrabold text-slate-800 tracking-tighter">
                    {service.price_range_min ? `${service.price_range_min.toLocaleString()} RWF+` : "Curation Required"}
                  </p>
                  <div className="flex items-center bg-sage-50/50 px-2.5 py-0.5 rounded-full border border-sage-100/50">
                    <Star className="h-2.5 w-2.5 text-sage-500 fill-sage-500 mr-1.5" />
                    <span className="text-[10px] font-bold text-sage-700">{service.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 bg-slate-50/30 rounded-[2rem] border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-serif italic">Your bespoke team is being curated...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
