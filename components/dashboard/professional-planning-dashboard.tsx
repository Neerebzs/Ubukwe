"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    DollarSign,
    CheckSquare,
    TrendingUp,
    Users,
    Heart,
    Target,
    Zap,
    BarChart3,
    Settings
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import { Overview } from "./overview";
import { BudgetManagement } from "./budget-management";
import { ProfessionalWeddingTasks } from "./professional-wedding-tasks";
import { Loader2 } from "lucide-react";

interface ProfessionalPlanningDashboardProps {
    defaultTab?: string;
}

export function ProfessionalPlanningDashboard({ defaultTab = "overview" }: ProfessionalPlanningDashboardProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [totalBudget, setTotalBudget] = useState(0);

    // Fetch wedding details
    const { data: weddingData, isLoading } = useQuery({
        queryKey: ["wedding-me"],
        queryFn: async () => {
            try {
                const response = await apiClient.get(API_ENDPOINTS.WEDDING.ME);
                return response.data;
            } catch (err: any) {
                if (err.message.includes("404")) return null;
                throw err;
            }
        }
    });

    // Fetch tasks for dashboard metrics
    const { data: tasks } = useQuery({
        queryKey: ["wedding-tasks"],
        queryFn: async () => {
            const response = await apiClient.get(API_ENDPOINTS.WEDDING.TASKS);
            const data = response.data;
            return Array.isArray(data) ? data : (data?.data || data?.tasks || []);
        },
        enabled: !!weddingData
    });

    const handleBudgetUpdate = (newBudget: number) => {
        setTotalBudget(newBudget);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading wedding planning dashboard...</span>
            </div>
        );
    }

    // Prepare wedding details for components
    const weddingDetails = {
        coupleName: weddingData?.couple_name || "",
        weddingDate: weddingData?.wedding_date || "",
        guestCount: weddingData?.guest_count || 0,
        budget: weddingData?.budget ? parseFloat(weddingData.budget) : 0,
        spent: weddingData?.spent ? parseFloat(weddingData.spent) : 0,
    };

    const currentBudget = weddingDetails.budget || totalBudget;

    // Calculate dashboard metrics
    const tasksArray = tasks || [];
    const completedTasks = tasksArray.filter(task => task.is_completed).length;
    const totalTasks = tasksArray.length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const overdueTasks = tasksArray.filter(task => {
        if (!task.end_date || task.is_completed) return false;
        return new Date(task.end_date) < new Date();
    }).length;

    const urgentTasks = tasksArray.filter(task => {
        if (!task.end_date || task.is_completed) return false;
        const daysUntilDue = Math.ceil((new Date(task.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 7 && daysUntilDue >= 0;
    }).length;

    const budgetUsedPercentage = currentBudget > 0 ? (weddingDetails.spent / currentBudget) * 100 : 0;
    const isOverBudget = weddingDetails.spent > currentBudget;

    // Calculate days until wedding
    const daysUntilWedding = weddingDetails.weddingDate ? 
        Math.max(0, Math.ceil((new Date(weddingDetails.weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 
        null;

    return (
        <div className="space-y-6">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Professional Wedding Planning</h1>
                    <p className="text-muted-foreground">
                        {weddingData?.couple_name ? 
                            `Planning ${weddingData.couple_name}'s perfect day` : 
                            "Your comprehensive wedding planning dashboard"
                        }
                    </p>
                </div>
                {weddingData && (
                    <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                            {daysUntilWedding !== null ? `${daysUntilWedding} days` : "Date TBD"}
                        </div>
                        <div className="text-sm text-muted-foreground">until your wedding</div>
                    </div>
                )}
            </div>

            {/* Quick Stats Cards */}
            {weddingData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <CheckSquare className="h-5 w-5 text-green-600" />
                                <div>
                                    <div className="text-2xl font-bold">{progressPercentage}%</div>
                                    <div className="text-xs text-muted-foreground">Tasks Complete</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                                <div>
                                    <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                                        {budgetUsedPercentage.toFixed(0)}%
                                    </div>
                                    <div className="text-xs text-muted-foreground">Budget Used</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Target className="h-5 w-5 text-yellow-600" />
                                <div>
                                    <div className="text-2xl font-bold text-yellow-600">{urgentTasks}</div>
                                    <div className="text-xs text-muted-foreground">Due Soon</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-purple-600" />
                                <div>
                                    <div className="text-2xl font-bold">{weddingDetails.guestCount || 0}</div>
                                    <div className="text-xs text-muted-foreground">Guests</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Alert Cards for Important Issues */}
            {weddingData && (overdueTasks > 0 || isOverBudget) && (
                <div className="grid gap-4">
                    {overdueTasks > 0 && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-5 w-5 text-red-600" />
                                        <div>
                                            <div className="font-semibold text-red-800">
                                                {overdueTasks} Overdue Task{overdueTasks > 1 ? 's' : ''}
                                            </div>
                                            <div className="text-sm text-red-600">
                                                These tasks need immediate attention
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setActiveTab("tasks")}
                                        className="border-red-300 text-red-700 hover:bg-red-100"
                                    >
                                        View Tasks
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {isOverBudget && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <DollarSign className="h-5 w-5 text-red-600" />
                                        <div>
                                            <div className="font-semibold text-red-800">Budget Exceeded</div>
                                            <div className="text-sm text-red-600">
                                                You're RWF {(weddingDetails.spent - currentBudget).toLocaleString()} over budget
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setActiveTab("budget")}
                                        className="border-red-300 text-red-700 hover:bg-red-100"
                                    >
                                        Review Budget
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Main Dashboard Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Wedding Overview
                    </TabsTrigger>
                    <TabsTrigger value="budget" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Budget Management
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4" />
                        Task Planning
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <Overview 
                        weddingDetails={weddingDetails} 
                        onBudgetUpdate={handleBudgetUpdate}
                    />
                </TabsContent>

                <TabsContent value="budget" className="space-y-6">
                    {currentBudget > 0 ? (
                        <BudgetManagement 
                            totalBudget={currentBudget}
                            onBudgetUpdate={handleBudgetUpdate}
                        />
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                                <DollarSign className="h-16 w-16 text-muted-foreground/30 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Set Your Wedding Budget First</h3>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    To enable professional budget-driven planning, please set your total wedding budget in the overview tab.
                                </p>
                                <Button onClick={() => setActiveTab("overview")}>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Set Budget
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="tasks" className="space-y-6">
                    <ProfessionalWeddingTasks 
                        weddingDate={weddingDetails.weddingDate}
                        totalBudget={currentBudget}
                    />
                </TabsContent>
            </Tabs>

            {/* Professional Tips Card */}
            {weddingData && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="flex items-center text-blue-800">
                            <Zap className="h-5 w-5 mr-2" />
                            Professional Planning Tips
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                            <div>
                                <h4 className="font-semibold mb-2">Budget-First Approach</h4>
                                <ul className="space-y-1 text-xs">
                                    <li>• Set your total budget before planning tasks</li>
                                    <li>• Use auto-generated tasks based on budget categories</li>
                                    <li>• Track spending against allocated amounts</li>
                                    <li>• Keep 10% emergency buffer for unexpected costs</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Timeline Management</h4>
                                <ul className="space-y-1 text-xs">
                                    <li>• Book venue and catering 6-9 months ahead</li>
                                    <li>• Photography and major vendors 4-6 months</li>
                                    <li>• Attire and beauty services 2-3 months</li>
                                    <li>• Final details and confirmations 2-4 weeks</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
