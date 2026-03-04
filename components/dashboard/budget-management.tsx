"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Plus,
    Edit2,
    Save,
    X,
    Calculator,
    PieChart as PieChartIcon,
    Loader2,
    LayoutGrid,
    FileText,
    Wallet,
    Target,
    AlertCircle
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import { toast } from "sonner";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// Standard wedding budget categories based on international best practices
export const BUDGET_CATEGORIES = [
    {
        id: "venue",
        name: "Venue",
        description: "Reception and ceremony venues",
        defaultPercentage: 40,
        color: "bg-blue-500",
        tasks: [
            "Research venue options",
            "Schedule venue visits",
            "Compare venue packages",
            "Book ceremony venue",
            "Book reception venue",
            "Confirm venue details",
            "Final venue payment"
        ]
    },
    {
        id: "catering",
        name: "Catering & Food",
        description: "Food, drinks, and catering services",
        defaultPercentage: 25,
        color: "bg-green-500",
        tasks: [
            "Request catering quotations",
            "Schedule food tastings",
            "Compare menus & prices",
            "Book caterer",
            "Finalize guest count",
            "Confirm dietary requirements",
            "Final catering payment"
        ]
    },
    {
        id: "photography",
        name: "Photography & Videography",
        description: "Wedding photography and videography",
        defaultPercentage: 10,
        color: "bg-purple-500",
        tasks: [
            "Research photographers",
            "Review portfolios",
            "Schedule consultations",
            "Book photographer",
            "Book videographer",
            "Plan photo timeline",
            "Engagement photo session"
        ]
    },
    {
        id: "attire",
        name: "Attire & Beauty",
        description: "Wedding dress, suit, accessories, hair & makeup",
        defaultPercentage: 8,
        color: "bg-pink-500",
        tasks: [
            "Shop for wedding dress",
            "Shop for groom's suit",
            "Book alterations",
            "Choose accessories",
            "Book hair & makeup trial",
            "Book wedding day beauty",
            "Final fittings"
        ]
    },
    {
        id: "decoration",
        name: "Decoration & Flowers",
        description: "Floral arrangements and decorations",
        defaultPercentage: 6,
        color: "bg-yellow-500",
        tasks: [
            "Choose wedding theme",
            "Research florists",
            "Design floral arrangements",
            "Book florist",
            "Order centerpieces",
            "Confirm delivery schedule",
            "Set up decorations"
        ]
    },
    {
        id: "entertainment",
        name: "Music & Entertainment",
        description: "DJ, band, or other entertainment",
        defaultPercentage: 4,
        color: "bg-red-500",
        tasks: [
            "Research entertainment options",
            "Book DJ or band",
            "Create playlist",
            "Plan ceremony music",
            "Arrange sound system",
            "Confirm equipment needs",
            "Final music meeting"
        ]
    },
    {
        id: "invitations",
        name: "Invitations & Stationery",
        description: "Save the dates, invitations, programs",
        defaultPercentage: 2,
        color: "bg-indigo-500",
        tasks: [
            "Design save the dates",
            "Send save the dates",
            "Design invitations",
            "Order invitations",
            "Send invitations",
            "Track RSVPs",
            "Order programs & menus"
        ]
    },
    {
        id: "transportation",
        name: "Transportation",
        description: "Wedding day transportation",
        defaultPercentage: 2,
        color: "bg-sage-500",
        tasks: [
            "Book bridal transportation",
            "Book guest transportation",
            "Confirm pickup times",
            "Plan route & timing"
        ]
    },
    {
        id: "accommodation",
        name: "Accommodation",
        description: "Guest accommodation and honeymoon",
        defaultPercentage: 2,
        color: "bg-orange-500",
        tasks: [
            "Book guest accommodations",
            "Plan honeymoon",
            "Book honeymoon travel",
            "Arrange welcome bags"
        ]
    },
    {
        id: "miscellaneous",
        name: "Miscellaneous & Emergency",
        description: "Unexpected expenses and extras",
        defaultPercentage: 1,
        color: "bg-gray-500",
        tasks: [
            "Wedding insurance",
            "Marriage license",
            "Emergency fund planning"
        ]
    }
];

interface BudgetManagementProps {
    totalBudget?: number;
    onBudgetUpdate?: (newBudget: number) => void;
}

export function BudgetManagement({ totalBudget = 0, onBudgetUpdate }: BudgetManagementProps) {
    const queryClient = useQueryClient();
    const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
    const [newTotalBudget, setNewTotalBudget] = useState(totalBudget.toString());
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const getSlug = (name: string) => name.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^\w]/g, '');

    const [newCategory, setNewCategory] = useState({
        name: "",
        description: "",
        allocatedAmount: ""
    });

    // Fetch wedding budget data
    const { data: weddingData } = useQuery({
        queryKey: ["wedding-budget"],
        queryFn: async () => {
            const response = await apiClient.get(API_ENDPOINTS.WEDDING.ME);
            const resData = response.data as any;
            return (resData && typeof resData === 'object' && 'data' in resData) ? resData.data : resData;
        }
    });

    // Fetch budget categories
    const { data: budgetCategoriesData } = useQuery({
        queryKey: ["budget-categories", weddingData?.id],
        queryFn: async () => {
            if (!weddingData?.id) return [];
            const response = await apiClient.get(API_ENDPOINTS.WEDDING.BUDGET_CATEGORIES(weddingData.id));
            const resData = response.data as any;
            return (resData && typeof resData === 'object' && 'data' in resData) ? resData.data : (resData || []);
        },
        enabled: !!weddingData?.id
    });

    // Fetch tasks to calculate category progress
    const { data: tasks } = useQuery({
        queryKey: ["wedding-tasks"],
        queryFn: async () => {
            const response = await apiClient.get(API_ENDPOINTS.WEDDING.TASKS);
            const resData = response.data as any;
            if (Array.isArray(resData)) return resData;
            if (resData && typeof resData === 'object') {
                return ('data' in resData ? resData.data : ('tasks' in resData ? resData.tasks : []));
            }
            return [];
        }
    });

    const updateBudgetMutation = useMutation({
        mutationFn: async (budget: number) => {
            return apiClient.put(API_ENDPOINTS.WEDDING.ME, { budget: budget });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wedding-budget"] });
            toast.success("Budget updated successfully");
            setIsEditBudgetOpen(false);
            onBudgetUpdate?.(parseFloat(newTotalBudget));
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to update budget");
        }
    });

    const createDefaultCategoriesMutation = useMutation({
        mutationFn: async (weddingId: string) => {
            return apiClient.post(API_ENDPOINTS.WEDDING.CREATE_DEFAULT_CATEGORIES(weddingId));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budget-categories"] });
            toast.success("Default budget categories created successfully");
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to create budget categories");
        }
    });

    const createCustomCategoryMutation = useMutation({
        mutationFn: async (data: { weddingId: string; categoryData: any }) => {
            return apiClient.post(
                API_ENDPOINTS.WEDDING.BUDGET_CATEGORIES(data.weddingId),
                data.categoryData
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budget-categories"] });
            toast.success("Custom category added successfully");
            setIsAddCategoryOpen(false);
            setNewCategory({ name: "", description: "", allocatedAmount: "" });
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to add category");
        }
    });

    const handleSaveBudget = () => {
        const budget = parseFloat(newTotalBudget);
        if (isNaN(budget) || budget <= 0) {
            toast.error("Please enter a valid budget amount");
            return;
        }
        updateBudgetMutation.mutate(budget);
    };

    const handleAddCustomCategory = () => {
        if (!newCategory.name) {
            toast.error("Please enter a category name");
            return;
        }

        const allocatedAmount = parseFloat(newCategory.allocatedAmount);
        if (isNaN(allocatedAmount) || allocatedAmount < 0) {
            toast.error("Please enter a valid allocated amount");
            return;
        }

        if (!weddingData?.id) {
            toast.error("Wedding not found. Please set up your wedding first.");
            return;
        }

        createCustomCategoryMutation.mutate({
            weddingId: weddingData.id,
            categoryData: {
                category_name: newCategory.name,
                description: newCategory.description || "",
                allocated_amount: allocatedAmount,
                spent_amount: 0
            }
        });
    };

    const currentBudget = weddingData?.budget ? parseFloat(weddingData.budget) : totalBudget;

    // Use actual budget categories data or initialize with default structure
    const actualBudgetCategories = budgetCategoriesData || [];

    // Calculate total spent from all completed tasks across all categories
    const totalSpentFromTasks = actualBudgetCategories.reduce((total: number, category: any) => {
        const completedTasks = (category.tasks || []).filter((task: any) => task.is_completed);
        const categorySpent = completedTasks.reduce((sum: number, task: any) => sum + (task.amount || 0), 0);
        return total + categorySpent;
    }, 0);

    const currentSpent = totalSpentFromTasks;
    const remainingBudget = currentBudget - currentSpent;
    const budgetUsedPercentage = currentBudget > 0 ? (currentSpent / currentBudget) * 100 : 0;

    // If no budget categories exist and we have a budget, show option to create default categories
    const shouldShowCreateDefault = currentBudget > 0 && actualBudgetCategories.length === 0;

    // Use actual budget categories data or show empty state
    const categorySpending = actualBudgetCategories.length > 0 ? actualBudgetCategories : [];

    const generateTasksForCategory = (categoryId: string) => {
        const budgetCategory = BUDGET_CATEGORIES.find((c: any) => c.id === categoryId);
        if (!budgetCategory) return;

        // Find the actual budget category data
        const actualCategory = actualBudgetCategories.find((c: any) => getSlug(c.category_name) === categoryId);
        const taskBudget = actualCategory ? Math.round(actualCategory.allocated_amount / budgetCategory.tasks.length) : 0;

        // This would create tasks automatically - for now we'll show a toast
        toast.success(`Auto-generating ${budgetCategory.tasks.length} tasks for ${budgetCategory.name} with ${taskBudget.toLocaleString()} RWF each`);
    };

    return (
        <div className="space-y-6">
            {/* Budget Overview Header */}
            {/* Budget Overview Header */}
            <Card className="border-none shadow-[0_20px_50px_rgba(13,148,136,0.05)] bg-white/95 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
                <CardHeader className="pt-10 px-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center text-3xl font-serif italic text-slate-800 tracking-tight">
                                <div className="p-2.5 bg-sage-50 rounded-2xl mr-4">
                                    <DollarSign className="h-6 w-6 text-sage-600" />
                                </div>
                                Budget Registry
                            </CardTitle>
                            <p className="text-slate-500 font-medium text-sm ml-16">Elegantly managing your wedding investment</p>
                        </div>
                        <Button
                            variant={currentBudget > 0 ? "outline" : "default"}
                            size="lg"
                            onClick={() => {
                                setNewTotalBudget(currentBudget.toString());
                                setIsEditBudgetOpen(true);
                            }}
                            className={`rounded-2xl px-8 h-12 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${currentBudget > 0
                                ? "border-sage-100 text-sage-700 hover:bg-sage-50 hover:border-sage-200"
                                : "bg-sage-600 hover:bg-sage-700 text-white shadow-lg shadow-sage-600/20"
                                }`}
                        >
                            {currentBudget > 0 ? (
                                <>
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Refine Budget
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Set Investment
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="px-10 pb-12">
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { label: "Total Investment", value: `RWF ${currentBudget.toLocaleString()}`, color: "slate" },
                            { label: "Gracefully Spent", value: `RWF ${currentSpent.toLocaleString()}`, color: "rose" },
                            { label: "Remaining", value: `RWF ${remainingBudget.toLocaleString()}`, color: "teal" },
                            { label: "Utilization", value: `${budgetUsedPercentage.toFixed(1)}%`, color: "emerald" },
                        ].map((stat, i) => (
                            <div key={i} className="text-center p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-sage-500/5 hover:-translate-y-1">
                                <div className={`text-xl font-bold tracking-tighter mb-2 ${stat.color === 'rose' ? 'text-rose-600' :
                                    stat.color === 'teal' ? 'text-sage-700' :
                                        stat.color === 'emerald' ? 'text-emerald-700' : 'text-slate-800'
                                    }`}>
                                    {stat.value}
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Spending Flow</span>
                                <Badge variant="outline" className="rounded-full px-3 py-0.5 border-sage-100 text-sage-700 bg-sage-50/30 text-[10px] uppercase font-bold tracking-widest h-5">
                                    {budgetUsedPercentage > 90 ? 'Critical' : 'Balanced'}
                                </Badge>
                            </div>
                            <span className="text-sm font-serif italic text-sage-700">
                                {budgetUsedPercentage.toFixed(1)}% Curated
                            </span>
                        </div>
                        <div className="relative h-4 bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                            <Progress
                                value={budgetUsedPercentage}
                                className={`h-full transition-all duration-1000 ${budgetUsedPercentage > 90 ? '[&>div]:bg-rose-500' :
                                    budgetUsedPercentage > 75 ? '[&>div]:bg-amber-500' : '[&>div]:bg-sage-600'
                                    }`}
                            />
                        </div>
                        {budgetUsedPercentage > 90 && (
                            <div className="flex items-center justify-center gap-2 text-rose-600 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                                <AlertTriangle className="h-3 w-3" />
                                Investment Alert: Approaching Limit
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Budget Categories */}
            <Tabs defaultValue="categories" className="space-y-8">
                <TabsList className="flex items-center justify-start gap-2 bg-slate-50/50 p-1.5 rounded-2xl w-fit border border-slate-100">
                    {[
                        { value: "categories", label: "Registry", icon: LayoutGrid },
                        { value: "manage", label: "Allocations", icon: Edit2 },
                        { value: "analytics", label: "Analytics", icon: PieChart },
                        { value: "projections", label: "Forecasts", icon: TrendingUp },
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-sage-700 data-[state=active]:shadow-sm data-[state=active]:border border-slate-100/50"
                        >
                            <tab.icon className="h-3.5 w-3.5" />
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="categories" className="space-y-4">
                    {/* Show create default categories option */}
                    {actualBudgetCategories.length === 0 && (
                        <Card className="border-none shadow-[0_15px_40px_rgba(13,148,136,0.05)] bg-slate-50/50 rounded-[2rem] overflow-hidden">
                            <CardContent className="p-10">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-serif italic text-slate-800">Initialize Your Registry</h3>
                                        <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed">
                                            {currentBudget > 0
                                                ? "Set up a professional budget structure curated to international wedding standards. This will elegantly organize your investment."
                                                : "Begin by defining your total wedding investment, then we can curate the perfect distribution across all categories."
                                            }
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            if (currentBudget <= 0) {
                                                toast.error("Please set your wedding budget first");
                                                setIsEditBudgetOpen(true);
                                                return;
                                            }
                                            createDefaultCategoriesMutation.mutate(weddingData?.id);
                                        }}
                                        disabled={createDefaultCategoriesMutation.isPending || !weddingData?.id}
                                        className="bg-sage-600 hover:bg-sage-700 text-white rounded-2xl px-10 h-14 font-bold uppercase tracking-widest shadow-xl shadow-sage-600/20"
                                    >
                                        {createDefaultCategoriesMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Plus className="h-4 w-4 mr-2" />
                                        )}
                                        {currentBudget > 0 ? "Curate Registry" : "Set Investment First"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Add Custom Category Button */}
                    {categorySpending.length > 0 && (
                        <div className="flex justify-end mb-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddCategoryOpen(true)}
                                className="rounded-xl border-sage-100 text-sage-700 hover:bg-sage-50 text-[10px] font-bold uppercase tracking-widest h-9 px-6"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Custom Allocation
                            </Button>
                        </div>
                    )}

                    <div className="grid gap-6">
                        {categorySpending.map((category: any) => {
                            const budgetCategory = BUDGET_CATEGORIES.find((c: any) => c.id === getSlug(category.category_name));

                            const categoryTasks = category.tasks || [];
                            const completedCategoryTasks = categoryTasks.filter((task: any) => task.is_completed);
                            const progressPercentage = categoryTasks.length > 0
                                ? (completedCategoryTasks.length / categoryTasks.length) * 100
                                : 0;

                            const calculatedSpentAmount = completedCategoryTasks.reduce(
                                (sum: number, task: any) => sum + (task.amount || 0),
                                0
                            );

                            const spentAmount = calculatedSpentAmount;
                            const spentPercentage = category.allocated_amount > 0
                                ? (spentAmount / category.allocated_amount) * 100
                                : 0;
                            const variance = spentAmount - category.allocated_amount;

                            const totalTaskAmount = categoryTasks.reduce((sum: number, task: any) => sum + (task.amount || 0), 0);
                            const remainingCategoryBudget = category.allocated_amount - totalTaskAmount;

                            return (
                                <Card key={category.id} className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.02)] rounded-[2.5rem] overflow-hidden bg-white hover:shadow-xl hover:shadow-sage-500/5 transition-all duration-500 group">
                                    <CardContent className="p-8">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                            <div className="flex items-center space-x-5">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100/50 group-hover:scale-105 transition-transform ${budgetCategory?.color ? budgetCategory.color.replace('bg-', 'bg-opacity-10 text-') : 'bg-slate-50 text-slate-400'}`}>
                                                    <LayoutGrid className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-serif italic text-slate-800 tracking-tight">{category.category_name}</h3>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                                                        {budgetCategory?.description || "Bespoke Category"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold tracking-tighter text-slate-800">
                                                    RWF {category.allocated_amount.toLocaleString()}
                                                </div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-sage-600/60 mt-1">
                                                    {((category.allocated_amount / currentBudget) * 100).toFixed(1)}% of Investment
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                                            {[
                                                { label: "Spent", value: spentAmount, color: "text-rose-600" },
                                                { label: "Grace", value: Math.abs(variance), color: variance > 0 ? 'text-rose-600' : 'text-sage-700' },
                                                { label: "Tasks", value: `${completedCategoryTasks.length}/${categoryTasks.length}`, isRaw: true, color: "text-slate-800" },
                                                { label: "Share", value: `${((category.allocated_amount / currentBudget) * 100).toFixed(1)}%`, isRaw: true, color: "text-slate-800" },
                                            ].map((stat, idx) => (
                                                <div key={idx} className="text-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100/30 transition-colors hover:bg-white hover:shadow-sm">
                                                    <div className={`text-md font-bold tracking-tighter mb-1 ${stat.color}`}>
                                                        {stat.isRaw ? stat.value : `RWF ${stat.value.toLocaleString()}`}
                                                    </div>
                                                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8 mb-10">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between px-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Registry Progress</span>
                                                    <span className="text-xs font-serif italic text-sage-700">{spentPercentage.toFixed(1)}%</span>
                                                </div>
                                                <div className="relative h-2 bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                                                    <Progress value={spentPercentage} className="h-full transition-all duration-1000 [&>div]:bg-sage-600" />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between px-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Deliverables</span>
                                                    <span className="text-xs font-serif italic text-slate-700">{progressPercentage.toFixed(1)}%</span>
                                                </div>
                                                <div className="relative h-2 bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                                                    <Progress value={progressPercentage} className="h-full transition-all duration-1000 [&>div]:bg-slate-800" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tasks List */}
                                        {categoryTasks.length > 0 && (
                                            <div className="mt-8 pt-8 border-t border-slate-50">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center">
                                                        <FileText className="h-3 w-3 mr-2" />
                                                        Allocated Deliverables
                                                    </h4>
                                                    <Badge variant="outline" className="text-[9px] font-bold text-sage-700 border-sage-100 bg-sage-50/30">
                                                        RWF {remainingCategoryBudget.toLocaleString()} Available
                                                    </Badge>
                                                </div>
                                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                                    {categoryTasks.map((task: any) => (
                                                        <div
                                                            key={task.id}
                                                            className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl text-sm hover:bg-white hover:shadow-xl hover:shadow-sage-500/5 transition-all duration-300 border border-transparent hover:border-sage-50 group"
                                                        >
                                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${task.is_completed ? 'bg-sage-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]' : 'bg-slate-200 group-hover:bg-slate-300'}`} />
                                                                <span className={`truncate text-xs font-semibold text-slate-700 transition-colors ${task.is_completed ? 'line-through text-slate-400' : 'group-hover:text-slate-900'}`}>
                                                                    {task.title}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {task.is_completed && <CheckCircle className="h-3 w-3 text-sage-600" />}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="manage" className="space-y-8">
                    <Card className="border-none shadow-[0_15px_40px_rgba(0,0,0,0.02)] rounded-[2.5rem] overflow-hidden bg-white">
                        <CardHeader className="pt-10 px-10">
                            <CardTitle className="flex items-center text-2xl font-serif italic text-slate-800">
                                <div className="p-2 bg-sage-50 rounded-xl mr-4">
                                    <Edit2 className="h-5 w-5 text-sage-600" />
                                </div>
                                Investment Allocations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-10 pb-12">
                            {categorySpending.length > 0 ? (
                                <div className="space-y-10">
                                    <div className="bg-slate-50/50 p-8 rounded-3xl border border-dashed border-slate-200">
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-3xl">
                                            Curate your spending by refining the allocations for each category. Your total investment is elegantly distributed to ensure harmony in your planning. Changes are preserved in real-time.
                                        </p>
                                    </div>
                                    <div className="grid gap-6">
                                        {categorySpending.map((category: any) => {
                                            const budgetCategory = BUDGET_CATEGORIES.find((c: any) => c.id === getSlug(category.category_name));
                                            const percentage = currentBudget > 0 ? (category.allocated_amount / currentBudget) * 100 : 0;

                                            return (
                                                <div key={category.id} className="p-8 bg-white rounded-3xl border border-slate-100 transition-all hover:shadow-xl hover:shadow-sage-500/5 group">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                                                        <div className="flex items-center space-x-5">
                                                            <div className={`w-3 h-3 rounded-full ${budgetCategory?.color || 'bg-slate-200'}`} />
                                                            <div>
                                                                <h4 className="text-lg font-bold text-slate-800">{category.category_name}</h4>
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                                                                    {budgetCategory?.description || "Bespoke Category"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-serif italic text-sage-700">
                                                                {percentage.toFixed(1)}% Allocation
                                                            </div>
                                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                                                                Yielded: RWF {category.spent_amount.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-3">
                                                            <Label htmlFor={`budget-${category.id}`} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">
                                                                Allocated Investment (RWF)
                                                            </Label>
                                                            <div className="relative">
                                                                <Input
                                                                    id={`budget-${category.id}`}
                                                                    type="number"
                                                                    value={category.allocated_amount}
                                                                    onChange={() => { }} // Integration logic
                                                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-sage-500/10 transition-all font-bold text-slate-700 text-lg px-6"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <Label htmlFor={`percentage-${category.id}`} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">
                                                                Allocation Share (%)
                                                            </Label>
                                                            <div className="relative">
                                                                <Input
                                                                    id={`percentage-${category.id}`}
                                                                    type="number"
                                                                    value={percentage.toFixed(1)}
                                                                    onChange={() => { }} // Integration logic
                                                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-sage-500/10 transition-all font-bold text-slate-700 text-lg px-6"
                                                                />
                                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">%</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                                        <p className="text-[11px] font-medium text-slate-400 flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-2 opacity-50" />
                                                            Variance Analysis:
                                                            <span className={`ml-2 font-bold ${category.spent_amount > category.allocated_amount ? 'text-rose-600' : 'text-sage-700'}`}>
                                                                RWF {Math.abs(category.spent_amount - category.allocated_amount).toLocaleString()} {category.spent_amount > category.allocated_amount ? 'Surplus' : 'Grace'}
                                                            </span>
                                                        </p>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-[10px] font-bold uppercase tracking-widest text-sage-600 hover:text-sage-700 hover:bg-sage-50 rounded-xl px-4 h-9 transition-colors"
                                                        >
                                                            Restore Default
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-12 p-10 bg-slate-800 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                            <div className="space-y-2">
                                                <h4 className="text-2xl font-serif italic">Cumulative Portfolio Value</h4>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 max-w-sm leading-relaxed">
                                                    The total of all bespoke allocations curated for your wedding vision.
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-4xl font-bold tracking-tighter text-sage-400">
                                                    RWF {categorySpending.reduce((sum: number, cat: any) => sum + cat.allocated_amount, 0).toLocaleString()}
                                                </div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">
                                                    of RWF {currentBudget.toLocaleString()} Total Strategy
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-32 bg-slate-50/30 rounded-[3rem] border border-dashed border-slate-200">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                                        <Edit2 className="h-10 w-10 text-slate-200" />
                                    </div>
                                    <p className="text-slate-800 font-serif italic text-xl">Your registry awaits curation</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3">Create budget categories to manage your investment distribution</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="border-none shadow-[0_15px_40px_rgba(0,0,0,0.02)] rounded-[2.5rem] overflow-hidden bg-white">
                            <CardHeader className="pt-10 px-10 pb-2">
                                <CardTitle className="text-xl font-serif italic text-slate-800">Investment Distribution</CardTitle>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Allocation by Category Portfolio</p>
                            </CardHeader>
                            <CardContent className="p-10">
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categorySpending}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={85}
                                                outerRadius={125}
                                                paddingAngle={8}
                                                dataKey="allocated_amount"
                                                nameKey="category_name"
                                                stroke="none"
                                            >
                                                {categorySpending.map((entry: any, index: number) => {
                                                    const COLORS = ['#668c65', '#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];
                                                    return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                                                })}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '20px',
                                                    border: 'none',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                                    padding: '15px'
                                                }}
                                                itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-[0_15px_40px_rgba(0,0,0,0.02)] rounded-[2.5rem] overflow-hidden bg-white">
                            <CardHeader className="pt-10 px-10 pb-2">
                                <CardTitle className="text-xl font-serif italic text-slate-800">Strategic Performance</CardTitle>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Investment vs Outcome by Category</p>
                            </CardHeader>
                            <CardContent className="p-10">
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={categorySpending} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="category_name"
                                                type="category"
                                                axisLine={false}
                                                tickLine={false}
                                                width={100}
                                                tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b', textTransform: 'uppercase' }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                                            />
                                            <Bar dataKey="allocated_amount" name="Investment" fill="#e2e8f0" radius={[0, 10, 10, 0]} barSize={20} />
                                            <Bar dataKey="spent_amount" name="Yield" fill="#668c65" radius={[0, 10, 10, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-none shadow-[0_15px_40px_rgba(0,0,0,0.02)] rounded-[2.5rem] overflow-hidden bg-white">
                        <CardHeader className="pt-10 px-10">
                            <CardTitle className="text-xl font-serif italic text-slate-800">Category Insights</CardTitle>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Detailed performance metrics across your portfolio</p>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-50">
                                            <th className="pb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Category Portfolio</th>
                                            <th className="pb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-right">Investment</th>
                                            <th className="pb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-right">Yield</th>
                                            <th className="pb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-right">Efficiency</th>
                                            <th className="pb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-right">Variance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {categorySpending.map((category: any) => (
                                            <tr key={category.id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="py-6 pr-4">
                                                    <div className="font-bold text-slate-800">{category.category_name}</div>
                                                    <div className="text-[9px] font-medium text-slate-400 mt-1">Artisanal Classification</div>
                                                </td>
                                                <td className="py-6 text-right font-bold text-slate-700">RWF {category.allocated_amount.toLocaleString()}</td>
                                                <td className="py-6 text-right font-bold text-slate-700">RWF {category.spent_amount.toLocaleString()}</td>
                                                <td className="py-6 text-right">
                                                    <Badge className={`rounded-full border-none text-[9px] font-bold uppercase tracking-widest px-3 py-1 ${category.spent_amount > category.allocated_amount ? 'bg-rose-50 text-rose-600' : 'bg-sage-50 text-sage-700'}`}>
                                                        {((category.spent_amount / (category.allocated_amount || 1)) * 100).toFixed(0)}%
                                                    </Badge>
                                                </td>
                                                <td className={`py-6 text-right font-bold ${category.spent_amount > category.allocated_amount ? 'text-rose-600' : 'text-sage-700'}`}>
                                                    {category.spent_amount > category.allocated_amount ? '+' : '-'}RWF {Math.abs(category.spent_amount - category.allocated_amount).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="projections" className="space-y-8">
                    <Card className="border-none shadow-[0_15px_40px_rgba(0,0,0,0.02)] rounded-[2.5rem] overflow-hidden bg-white">
                        <CardHeader className="pt-10 px-10">
                            <CardTitle className="text-2xl font-serif italic text-slate-800">Wedding Strategy Projections</CardTitle>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Anticipated milestones and financial trajectory</p>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="grid md:grid-cols-3 gap-8 mb-12">
                                {[
                                    { label: "Total Finalized", value: currentSpent, subtitle: "Cumulative Yield", color: "text-sage-700", icon: CheckCircle },
                                    { label: "Pending Obligations", value: currentBudget - currentSpent, subtitle: "Bespoke Commitments", color: "text-slate-800", icon: Target },
                                    { label: "Estimated Surplus", value: Math.max(0, currentBudget - currentSpent), subtitle: "Portfolio Buffer", color: "text-sage-600", icon: TrendingUp },
                                ].map((stat, idx) => (
                                    <div key={idx} className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 transition-hover hover:bg-white hover:shadow-xl hover:shadow-sage-500/5 group">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100/50 group-hover:scale-110 transition-transform">
                                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                            </div>
                                            <TrendingUp className="h-4 w-4 text-slate-200" />
                                        </div>
                                        <div className={`text-2xl font-bold tracking-tighter ${stat.color}`}>RWF {stat.value.toLocaleString()}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">{stat.label}</div>
                                        <div className="text-[9px] font-medium text-slate-300 mt-1 italic">{stat.subtitle}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-2">Portfolio Milestones</h4>
                                {categorySpending.slice(0, 5).map((category: any, idx: number) => (
                                    <div key={idx} className="flex items-center space-x-6 p-6 bg-white rounded-3xl border border-slate-50 hover:border-sage-100 transition-colors group">
                                        <div className="w-12 h-12 flex-shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center font-serif italic text-slate-400 group-hover:text-sage-600 transition-colors">
                                            0{idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-4">
                                                <h5 className="font-bold text-slate-800 tracking-tight">{category.category_name} Milestone</h5>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-sage-600">On Trajectory</span>
                                            </div>
                                            <div className="relative h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                                <Progress value={(idx + 1) * 20} className="h-full [&>div]:bg-slate-800" />
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-sm font-bold text-slate-800">RWF {category.allocated_amount.toLocaleString()}</div>
                                            <div className="text-[9px] font-medium text-slate-300 uppercase tracking-widest mt-1">Projected</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Budget Dialog */}
            <Dialog open={isEditBudgetOpen} onOpenChange={setIsEditBudgetOpen}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-[2rem]">
                    <DialogHeader className="p-8 bg-slate-800 text-white">
                        <DialogTitle className="text-2xl font-serif italic text-white flex items-center">
                            <div className="p-2 bg-white/10 rounded-xl mr-3">
                                <DollarSign className="h-5 w-5 text-sage-400" />
                            </div>
                            Investment Strategy
                        </DialogTitle>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">
                            Refine your total wedding portfolio value
                        </p>
                    </DialogHeader>
                    <div className="p-8 space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="budget" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Total Portfolio Value (RWF)</Label>
                            <div className="relative">
                                <Input
                                    id="budget"
                                    type="number"
                                    placeholder="e.g., 5000000"
                                    value={newTotalBudget}
                                    onChange={(e) => setNewTotalBudget(e.target.value)}
                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-sage-500/10 transition-all font-bold text-slate-700 text-lg px-6"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                                {currentBudget > 0
                                    ? "Updating your portfolio will automatically recalibrate category allocations."
                                    : "Define your total investment to begin distributing across bespoke categories."
                                }
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="p-8 pt-0 flex gap-3">
                        <Button variant="ghost" onClick={() => setIsEditBudgetOpen(false)} className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest text-xs">
                            Cancel
                        </Button>
                        <Button onClick={handleSaveBudget} disabled={updateBudgetMutation.isPending} className="flex-1 rounded-xl h-12 bg-sage-600 hover:bg-sage-700 text-white shadow-lg shadow-sage-600/20 font-bold uppercase tracking-widest text-xs">
                            {updateBudgetMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Commit Strategy
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Custom Category Dialog */}
            <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-[2rem]">
                    <DialogHeader className="p-8 bg-slate-800 text-white">
                        <DialogTitle className="text-2xl font-serif italic text-white flex items-center">
                            <div className="p-2 bg-white/10 rounded-xl mr-3">
                                <Plus className="h-5 w-5 text-sage-400" />
                            </div>
                            Bespoke Category
                        </DialogTitle>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">
                            Curate a unique allocation for your vision
                        </p>
                    </DialogHeader>

                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <Label htmlFor="category-name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Category Name</Label>
                                <Input
                                    id="category-name"
                                    placeholder="e.g., Honeymoon Registry"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-sage-500/10 transition-all font-bold text-slate-700 text-lg px-6"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="category-description" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Description (Optional)</Label>
                                <Input
                                    id="category-description"
                                    placeholder="e.g., Exclusive experiences and stay"
                                    value={newCategory.description}
                                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-sage-500/10 transition-all font-bold text-slate-700 text-sm px-6"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="allocated-amount" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Initial Allocation (RWF)</Label>
                                <div className="relative">
                                    <Input
                                        id="allocated-amount"
                                        type="number"
                                        placeholder="0"
                                        value={newCategory.allocatedAmount}
                                        onChange={(e) => setNewCategory({ ...newCategory, allocatedAmount: e.target.value })}
                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-sage-500/10 transition-all font-bold text-slate-700 text-lg px-6"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-sage-50/50 p-6 rounded-2xl border border-sage-100/50 flex gap-4 items-start">
                            <AlertCircle className="h-5 w-5 text-sage-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-sage-800 leading-relaxed font-medium">
                                Once created, this bespoke category will be integrated into your Registry and you can link tasks to it in the Planning tab.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-0 flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setIsAddCategoryOpen(false);
                                setNewCategory({ name: "", description: "", allocatedAmount: "" });
                            }}
                            className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest text-xs"
                        >
                            Discard
                        </Button>
                        <Button
                            onClick={handleAddCustomCategory}
                            disabled={createCustomCategoryMutation.isPending}
                            className="flex-1 rounded-xl h-12 bg-sage-600 hover:bg-sage-700 text-white shadow-lg shadow-sage-600/20 font-bold uppercase tracking-widest text-xs"
                        >
                            {createCustomCategoryMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                            Create Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
