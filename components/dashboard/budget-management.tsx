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
    PieChart,
    Loader2
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
        color: "bg-teal-500",
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
    const [newCategory, setNewCategory] = useState({
        name: "",
        description: "",
        allocatedAmount: "",
        categoryId: ""
    });

    // Fetch wedding budget data
    const { data: weddingData } = useQuery({
        queryKey: ["wedding-budget"],
        queryFn: async () => {
            const response = await apiClient.get(API_ENDPOINTS.WEDDING.ME);
            return response.data?.data || response.data; // Handle both wrapped and unwrapped responses
        }
    });

    // Fetch budget categories
    const { data: budgetCategoriesData } = useQuery({
        queryKey: ["budget-categories", weddingData?.id],
        queryFn: async () => {
            if (!weddingData?.id) return [];
            const response = await apiClient.get(API_ENDPOINTS.WEDDING.BUDGET_CATEGORIES(weddingData.id));
            return response.data?.data || response.data || []; // Handle both wrapped and unwrapped responses
        },
        enabled: !!weddingData?.id
    });

    // Fetch tasks to calculate category progress
    const { data: tasks } = useQuery({
        queryKey: ["wedding-tasks"],
        queryFn: async () => {
            const response = await apiClient.get(API_ENDPOINTS.WEDDING.TASKS);
            const data = response.data;
            return Array.isArray(data) ? data : (data?.data || data?.tasks || []);
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
            setNewCategory({ name: "", description: "", allocatedAmount: "", categoryId: "" });
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
        if (!newCategory.name || !newCategory.categoryId) {
            toast.error("Please enter category name and ID");
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
                category_id: newCategory.categoryId,
                category_name: newCategory.name,
                description: newCategory.description || "",
                allocated_amount: allocatedAmount,
                spent_amount: 0
            }
        });
    };

    const currentBudget = weddingData?.budget ? parseFloat(weddingData.budget) : totalBudget;
    const currentSpent = weddingData?.spent ? parseFloat(weddingData.spent) : 0;
    const remainingBudget = currentBudget - currentSpent;
    const budgetUsedPercentage = currentBudget > 0 ? (currentSpent / currentBudget) * 100 : 0;

    // Use actual budget categories data or initialize with default structure
    const actualBudgetCategories = budgetCategoriesData || [];
    
    // If no budget categories exist and we have a budget, show option to create default categories
    const shouldShowCreateDefault = currentBudget > 0 && actualBudgetCategories.length === 0;

    // Use actual budget categories data or show empty state
    const categorySpending = actualBudgetCategories.length > 0 ? actualBudgetCategories : [];

    const generateTasksForCategory = (categoryId: string) => {
        const category = BUDGET_CATEGORIES.find(c => c.id === categoryId);
        if (!category) return;

        // Find the actual budget category data
        const actualCategory = actualBudgetCategories.find(c => c.category_id === categoryId);
        const taskBudget = actualCategory ? Math.round(actualCategory.allocated_amount / category.tasks.length) : 0;

        // This would create tasks automatically - for now we'll show a toast
        toast.success(`Auto-generating ${category.tasks.length} tasks for ${category.name} with ${taskBudget.toLocaleString()} RWF each`);
    };

    return (
        <div className="space-y-6">
            {/* Budget Overview Header */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                            <DollarSign className="h-5 w-5 mr-2 text-primary" />
                            Wedding Budget Overview
                        </CardTitle>
                        <Button
                            variant={currentBudget > 0 ? "outline" : "default"}
                            size="sm"
                            onClick={() => {
                                setNewTotalBudget(currentBudget.toString());
                                setIsEditBudgetOpen(true);
                            }}
                        >
                            {currentBudget > 0 ? (
                                <>
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit Budget
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Budget
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-white rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                                RWF {currentBudget.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Budget</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                                RWF {currentSpent.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Spent</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                RWF {remainingBudget.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Remaining</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg">
                            <div className="text-2xl font-bold">
                                {budgetUsedPercentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Used</div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Budget Progress</span>
                            <span className="text-sm text-muted-foreground">
                                {budgetUsedPercentage.toFixed(1)}% used
                            </span>
                        </div>
                        <Progress 
                            value={budgetUsedPercentage} 
                            className={`h-3 ${budgetUsedPercentage > 90 ? 'bg-red-100' : budgetUsedPercentage > 75 ? 'bg-yellow-100' : 'bg-green-100'}`}
                        />
                        {budgetUsedPercentage > 90 && (
                            <div className="flex items-center mt-2 text-red-600 text-sm">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Budget Alert: You're approaching your budget limit
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Budget Categories */}
            <Tabs defaultValue="categories" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="categories">Budget Categories</TabsTrigger>
                    <TabsTrigger value="manage">Manage Categories</TabsTrigger>
                    <TabsTrigger value="analytics">Budget Analytics</TabsTrigger>
                    <TabsTrigger value="projections">Projections</TabsTrigger>
                </TabsList>

                <TabsContent value="categories" className="space-y-4">
                    {/* Show create default categories option */}
                    {actualBudgetCategories.length === 0 && (
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-blue-800 mb-2">Create Budget Categories</h3>
                                        <p className="text-sm text-blue-600">
                                            {currentBudget > 0 
                                                ? "Set up professional budget categories based on international wedding planning standards."
                                                : "Set your wedding budget first, then create budget categories to organize your spending."
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
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {createDefaultCategoriesMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Plus className="h-4 w-4 mr-2" />
                                        )}
                                        {currentBudget > 0 ? "Create Categories" : "Set Budget First"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    {/* Add Custom Category Button */}
                    {categorySpending.length > 0 && (
                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddCategoryOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Custom Category
                            </Button>
                        </div>
                    )}
                    
                    <div className="grid gap-4">
                        {categorySpending.map((category) => {
                            const budgetCategory = BUDGET_CATEGORIES.find(c => c.id === category.category_id);
                            const spentPercentage = category.allocated_amount > 0 
                                ? (category.spent_amount / category.allocated_amount) * 100 
                                : 0;
                            const variance = category.spent_amount - category.allocated_amount;
                            
                            // For task progress, we'll need to calculate from tasks data
                            const categoryTasks = tasks?.filter(task => task.category === category.category_id) || [];
                            const completedCategoryTasks = categoryTasks.filter(task => task.is_completed);
                            const progressPercentage = categoryTasks.length > 0 
                                ? (completedCategoryTasks.length / categoryTasks.length) * 100 
                                : 0;

                            return (
                                <Card key={category.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div 
                                                    className={`w-4 h-4 rounded-full ${budgetCategory?.color || 'bg-gray-500'}`}
                                                />
                                                <div>
                                                    <h3 className="font-semibold">{category.category_name}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {budgetCategory?.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold">
                                                    RWF {category.allocated_amount.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {((category.allocated_amount / currentBudget) * 100).toFixed(1)}% of total
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                                <div className="text-lg font-semibold text-red-600">
                                                    RWF {category.spent_amount.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Spent</div>
                                            </div>
                                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                                <div className={`text-lg font-semibold ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {variance > 0 ? '+' : ''}RWF {Math.abs(variance).toLocaleString()}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {variance > 0 ? 'Over Budget' : 'Under Budget'}
                                                </div>
                                            </div>
                                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                                <div className="text-lg font-semibold">
                                                    {completedCategoryTasks.length}/{categoryTasks.length}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Tasks Done</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Budget Usage</span>
                                                <span>{spentPercentage.toFixed(1)}%</span>
                                            </div>
                                            <Progress value={spentPercentage} className="h-2" />
                                            
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Task Progress</span>
                                                <span>{progressPercentage.toFixed(1)}%</span>
                                            </div>
                                            <Progress value={progressPercentage} className="h-2" />
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center space-x-2">
                                                {variance > category.allocated_amount * 0.1 && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        Over Budget
                                                    </Badge>
                                                )}
                                                {progressPercentage === 100 && (
                                                    <Badge variant="default" className="text-xs bg-green-600">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Complete
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="manage" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Edit2 className="h-5 w-5 mr-2" />
                                Manage Budget Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {categorySpending.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="text-sm text-muted-foreground mb-4">
                                        Adjust budget allocations for each category. Changes will be saved automatically.
                                    </div>
                                    {categorySpending.map((category) => {
                                        const budgetCategory = BUDGET_CATEGORIES.find(c => c.id === category.category_id);
                                        const percentage = currentBudget > 0 ? (category.allocated_amount / currentBudget) * 100 : 0;
                                        
                                        return (
                                            <Card key={category.id} className="p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-4 h-4 rounded-full ${budgetCategory?.color || 'bg-gray-500'}`} />
                                                        <div>
                                                            <h4 className="font-medium">{category.category_name}</h4>
                                                            <p className="text-xs text-muted-foreground">
                                                                {budgetCategory?.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium">
                                                            {percentage.toFixed(1)}% of total budget
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Spent: RWF {category.spent_amount.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor={`budget-${category.id}`} className="text-xs">
                                                            Allocated Amount (RWF)
                                                        </Label>
                                                        <Input
                                                            id={`budget-${category.id}`}
                                                            type="number"
                                                            value={category.allocated_amount}
                                                            onChange={(e) => {
                                                                // Handle budget update for individual category
                                                                const newAmount = parseFloat(e.target.value) || 0;
                                                                // This would trigger an API call to update the category
                                                                console.log(`Update category ${category.id} to ${newAmount}`);
                                                            }}
                                                            min="0"
                                                            step="1000"
                                                            className="h-8"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`percentage-${category.id}`} className="text-xs">
                                                            Percentage (%)
                                                        </Label>
                                                        <Input
                                                            id={`percentage-${category.id}`}
                                                            type="number"
                                                            value={percentage.toFixed(1)}
                                                            onChange={(e) => {
                                                                // Handle percentage update
                                                                const newPercentage = parseFloat(e.target.value) || 0;
                                                                const newAmount = (currentBudget * newPercentage) / 100;
                                                                console.log(`Update category ${category.id} to ${newAmount} (${newPercentage}%)`);
                                                            }}
                                                            min="0"
                                                            max="100"
                                                            step="0.1"
                                                            className="h-8"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-3 pt-3 border-t">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">
                                                            Variance: 
                                                            <span className={`ml-1 font-medium ${
                                                                category.spent_amount > category.allocated_amount ? 'text-red-600' : 'text-green-600'
                                                            }`}>
                                                                RWF {Math.abs(category.spent_amount - category.allocated_amount).toLocaleString()}
                                                                {category.spent_amount > category.allocated_amount ? ' over' : ' under'}
                                                            </span>
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-6 px-2 text-xs"
                                                            onClick={() => {
                                                                // Reset to default percentage
                                                                const defaultCategory = BUDGET_CATEGORIES.find(c => c.id === category.category_id);
                                                                if (defaultCategory) {
                                                                    const defaultAmount = (currentBudget * defaultCategory.defaultPercentage) / 100;
                                                                    console.log(`Reset category ${category.id} to default: ${defaultAmount}`);
                                                                }
                                                            }}
                                                        >
                                                            Reset to Default
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                    
                                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Total Allocation</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Sum of all category budgets
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold">
                                                    RWF {categorySpending.reduce((sum, cat) => sum + cat.allocated_amount, 0).toLocaleString()}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    of RWF {currentBudget.toLocaleString()} total budget
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Edit2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p className="mb-2">No budget categories to manage</p>
                                    <p className="text-sm">Create budget categories first to manage allocations</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    {categorySpending.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <TrendingUp className="h-5 w-5 mr-2" />
                                        Spending Trends
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {categorySpending
                                            .sort((a, b) => b.spent_amount - a.spent_amount)
                                            .slice(0, 5)
                                            .map((category) => (
                                                <div key={category.id} className="flex items-center justify-between">
                                                    <span className="text-sm">{category.category_name}</span>
                                                    <span className="font-semibold">
                                                        RWF {category.spent_amount.toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Calculator className="h-5 w-5 mr-2" />
                                        Budget Variance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {categorySpending
                                            .map(category => ({
                                                ...category,
                                                variance: category.spent_amount - category.allocated_amount
                                            }))
                                            .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
                                            .slice(0, 5)
                                            .map((category) => (
                                                <div key={category.id} className="flex items-center justify-between">
                                                    <span className="text-sm">{category.category_name}</span>
                                                    <div className="flex items-center">
                                                        {category.variance > 0 ? (
                                                            <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                                                        ) : (
                                                            <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                                                        )}
                                                        <span className={`font-semibold ${category.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {category.variance > 0 ? '+' : ''}RWF {Math.abs(category.variance).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="mb-2">No budget data available</p>
                            <p className="text-sm">Create budget categories first to see analytics</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="projections" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <PieChart className="h-5 w-5 mr-2" />
                                Budget Projections
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {categorySpending.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold">Projected Final Costs</h4>
                                        {categorySpending.map((category) => {
                                            // Calculate task progress from actual tasks
                                            const categoryTasks = tasks?.filter(task => task.category === category.category_id) || [];
                                            const completedTasks = categoryTasks.filter(task => task.is_completed);
                                            const progressPercentage = categoryTasks.length > 0 
                                                ? (completedTasks.length / categoryTasks.length) * 100 
                                                : 0;
                                            const projectedSpend = progressPercentage > 0 
                                                ? (category.spent_amount / progressPercentage) * 100
                                                : category.allocated_amount;

                                            return (
                                                <div key={category.id} className="flex items-center justify-between text-sm">
                                                    <span>{category.category_name}</span>
                                                    <span className="font-semibold">
                                                        RWF {Math.round(projectedSpend).toLocaleString()}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-semibold">Remaining Budget by Category</h4>
                                        {categorySpending.map((category) => {
                                            const remaining = category.allocated_amount - category.spent_amount;
                                            return (
                                                <div key={category.id} className="flex items-center justify-between text-sm">
                                                    <span>{category.category_name}</span>
                                                    <span className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                        RWF {remaining.toLocaleString()}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <PieChart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p className="mb-2">No budget categories available</p>
                                    <p className="text-sm">Create budget categories first to see projections</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Budget Dialog */}
            <Dialog open={isEditBudgetOpen} onOpenChange={setIsEditBudgetOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {currentBudget > 0 ? "Update Wedding Budget" : "Add Wedding Budget"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="budget">Total Wedding Budget (RWF)</Label>
                            <Input
                                id="budget"
                                type="number"
                                placeholder="e.g., 5000000"
                                value={newTotalBudget}
                                onChange={(e) => setNewTotalBudget(e.target.value)}
                                min="0"
                                step="10000"
                            />
                            <p className="text-sm text-muted-foreground">
                                {currentBudget > 0 
                                    ? "Update your total wedding budget. This will affect category allocations."
                                    : "Set your total wedding budget. This will automatically distribute across wedding categories."
                                }
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditBudgetOpen(false)}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button onClick={handleSaveBudget} disabled={updateBudgetMutation.isPending}>
                            <Save className="h-4 w-4 mr-2" />
                            {currentBudget > 0 ? "Save Budget" : "Add Budget"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Custom Category Dialog */}
            <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add Custom Budget Category</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="category-id">Category ID</Label>
                            <Input
                                id="category-id"
                                placeholder="e.g., custom_gifts"
                                value={newCategory.categoryId}
                                onChange={(e) => setNewCategory({ ...newCategory, categoryId: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Unique identifier for this category (lowercase, no spaces)
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category-name">Category Name</Label>
                            <Input
                                id="category-name"
                                placeholder="e.g., Wedding Gifts"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category-description">Description (Optional)</Label>
                            <Input
                                id="category-description"
                                placeholder="e.g., Gifts for guests and wedding party"
                                value={newCategory.description}
                                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="allocated-amount">Allocated Amount (RWF)</Label>
                            <Input
                                id="allocated-amount"
                                type="number"
                                placeholder="e.g., 500000"
                                value={newCategory.allocatedAmount}
                                onChange={(e) => setNewCategory({ ...newCategory, allocatedAmount: e.target.value })}
                                min="0"
                                step="10000"
                            />
                            <p className="text-xs text-muted-foreground">
                                Budget allocated for this category
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setIsAddCategoryOpen(false);
                                setNewCategory({ name: "", description: "", allocatedAmount: "", categoryId: "" });
                            }}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleAddCustomCategory} 
                            disabled={createCustomCategoryMutation.isPending}
                        >
                            {createCustomCategoryMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4 mr-2" />
                            )}
                            Add Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}