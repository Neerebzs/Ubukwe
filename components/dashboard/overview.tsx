"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, CheckCircle, Star, Edit2, Save, X, Heart, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
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
  const { data: weddingResponse, isLoading } = useQuery({
    queryKey: ["wedding-me"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<Wedding>(API_ENDPOINTS.WEDDING.ME);
        return response.data;
      } catch (err: any) {
        if (err.message.includes("404")) return null;
        throw err;
      }
    }
  });

  // Fetch wedding tasks for progress calculation
  const { data: tasks } = useQuery({
    queryKey: ["wedding-tasks"],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.WEDDING.TASKS);
        const data = response.data;
        if (Array.isArray(data)) {
          return data;
        } else if (data && Array.isArray(data.data)) {
          return data.data;
        } else if (data && typeof data === 'object' && data.tasks && Array.isArray(data.tasks)) {
          return data.tasks;
        }
        return [];
      } catch (err: any) {
        if (err.message.includes("404")) return [];
        throw err;
      }
    },
    enabled: !!weddingResponse // Only fetch tasks if wedding is set up
  });

  // Fetch recommended services
  const { data: recommendationsRes } = useQuery({
    queryKey: ["service-recommendations"],
    queryFn: async () => {
      const response = await apiClient.get<ProviderService[]>(API_ENDPOINTS.SERVICES.LIST);
      return (response.data || []).slice(0, 3);
    }
  });

  const recommendedServices = recommendationsRes || [];
  const currentWedding = weddingResponse || null;
  const tasksArray = tasks || [];

  // Calculate real planning progress
  const completedTasks = tasksArray.filter(task => task.is_completed).length;
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
      // Notify parent component about budget update
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
    
    if (guestCount) {
      updateData.guest_count = parseInt(guestCount);
    }
    
    if (budget) {
      updateData.budget = budget;
    }
    
    saveMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading wedding details...</span>
      </div>
    );
  }

  const isDetailsSet = !!currentWedding;

  // Normalize wedding data to use camelCase consistently
  const displayWedding = {
    coupleName: currentWedding?.couple_name || weddingDetails.coupleName,
    weddingDate: currentWedding?.wedding_date || weddingDetails.weddingDate,
    guestCount: currentWedding?.guest_count ?? weddingDetails.guestCount,
    budget: currentWedding ? Number(currentWedding.budget) : (weddingDetails.budget || 0),
    spent: currentWedding ? Number(currentWedding.spent) : (weddingDetails.spent || 0),
    venue: currentWedding?.venue || weddingDetails.venue || "Not set"
  };

  // Calculate budget metrics
  const budgetUsedPercentage = displayWedding.budget > 0 ? (displayWedding.spent / displayWedding.budget) * 100 : 0;
  const remainingBudget = displayWedding.budget - displayWedding.spent;
  const isOverBudget = displayWedding.spent > displayWedding.budget;
  const budgetWarning = budgetUsedPercentage > 90;

  return (
    <div className="space-y-6">
      {/* Wedding Details Card with Edit */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-primary" />
              Wedding Details
            </CardTitle>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant={isDetailsSet ? "outline" : "default"}
                  size="sm"
                  onClick={handleEditClick}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  {isDetailsSet ? "Edit Details" : "Add Details"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{isDetailsSet ? "Edit Wedding Details" : "Add Wedding Details"}</DialogTitle>
                  <DialogDescription>
                    {isDetailsSet
                      ? "Update your wedding information including bride and groom names and wedding date."
                      : "Add your wedding information including bride and groom names and wedding date."
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="bride-name">Bride's Name</Label>
                    <Input
                      id="bride-name"
                      placeholder="Enter bride's name"
                      value={brideName}
                      onChange={(e) => setBrideName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="groom-name">Groom's Name</Label>
                    <Input
                      id="groom-name"
                      placeholder="Enter groom's name"
                      value={groomName}
                      onChange={(e) => setGroomName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="wedding-date">Wedding Date</Label>
                    <Input
                      id="wedding-date"
                      type="date"
                      value={weddingDate}
                      onChange={(e) => setWeddingDate(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="guest-count">Guest Count</Label>
                      <Input
                        id="guest-count"
                        type="number"
                        placeholder="e.g., 150"
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        min="1"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="budget">Total Budget (RWF)</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="e.g., 5000000"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        min="0"
                        step="10000"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isDetailsSet ? "Save Changes" : "Save Details"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Bride</div>
              <div className={`text-lg font-semibold ${isDetailsSet ? 'text-primary' : 'text-muted-foreground'}`}>
                {parseCoupleName(displayWedding.coupleName).bride || "Not set"}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Groom</div>
              <div className={`text-lg font-semibold ${isDetailsSet ? 'text-primary' : 'text-muted-foreground'}`}>
                {parseCoupleName(displayWedding.coupleName).groom || "Not set"}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Wedding Date</div>
              <div className={`text-lg font-semibold ${isDetailsSet ? 'text-foreground' : 'text-muted-foreground'}`}>
                {isDetailsSet ? new Date(displayWedding.weddingDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : "Not set"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wedding Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Wedding Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {displayWedding.budget > 0 ? `${budgetUsedPercentage.toFixed(0)}%` : "0%"}
              </div>
              <div className="text-sm text-muted-foreground">Budget Used</div>
              {budgetWarning && (
                <Badge variant="destructive" className="text-xs mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Alert
                </Badge>
              )}
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{planningProgress.percentage}%</div>
              <div className="text-sm text-muted-foreground">Tasks Complete</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {tasksArray.filter(t => !t.is_completed && t.priority === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {tasksArray.filter(t => {
                  if (!t.end_date || t.is_completed) return false;
                  const daysUntil = Math.ceil((new Date(t.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return daysUntil <= 7 && daysUntil >= 0;
                }).length}
              </div>
              <div className="text-sm text-muted-foreground">Due This Week</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wedding Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Wedding Planning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {planningProgress.completed} of {planningProgress.total} tasks completed
              </span>
              <span className="text-sm text-muted-foreground">{planningProgress.percentage}% complete</span>
            </div>
            <Progress value={planningProgress.percentage} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {isDetailsSet ? Math.max(0, Math.ceil(
                    (new Date(displayWedding.weddingDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24),
                  )) : "--"}
                </div>
                <div className="text-xs text-muted-foreground">Days to go</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{isDetailsSet ? displayWedding.guestCount : "--"}</div>
                <div className="text-xs text-muted-foreground">Guests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-muted-foreground">Services booked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {isDetailsSet ? Math.round((Number(displayWedding.spent) / Number(displayWedding.budget)) * 100) : "0"}%
                </div>
                <div className="text-xs text-muted-foreground">Budget used</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Recommendations */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasksArray.length > 0 ? (
              tasksArray
                .filter((task) => !task.is_completed)
                .slice(0, 4)
                .map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 border-2 border-muted-foreground rounded"></div>
                      <span className="text-sm">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.priority && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            task.priority === 'high' ? 'border-red-200 text-red-700' :
                            task.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                            'border-green-200 text-green-700'
                          }`}
                        >
                          {task.priority}
                        </Badge>
                      )}
                      {task.assigned_to && (
                        <Badge variant="outline" className="text-xs">
                          {task.assigned_to === 'groom' ? 'Groom' : 
                           task.assigned_to === 'bride' ? 'Bride' : 'Both'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                {currentWedding ? "No pending tasks. Add some tasks to get started!" : "Set up your wedding details first to start planning."}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Recommended for You
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedServices.length > 0 ? recommendedServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-primary truncate font-medium max-w-[150px]">{service.name}</div>
                  <div>
                    <p className="text-xs text-muted-foreground">{service.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{service.price_range_min ? `${service.price_range_min.toLocaleString()} RWF` : "Contact"}</p>
                  <div className="flex items-center justify-end text-xs">
                    <Star className="h-3 w-3 text-yellow-400 mr-1" />
                    <span>{service.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No recommendations yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
