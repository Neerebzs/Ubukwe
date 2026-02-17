"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Plus,
    Trash2,
    CheckCircle,
    Loader2,
    AlertCircle,
    User,
    Users,
    Calendar,
    DollarSign,
    Zap,
    Filter,
    SortAsc,
    Clock,
    Target
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS, WeddingTask, BudgetCategory } from "@/lib/api";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BUDGET_CATEGORIES } from "./budget-management";

const ASSIGNMENT_OPTIONS = [
    { value: "groom", label: "Groom", icon: User },
    { value: "bride", label: "Bride", icon: User },
    { value: "other", label: "Both/Other", icon: Users }
];

const STATUS_OPTIONS = [
    { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-800" },
    { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-800" },
    { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" }
];

const PRIORITY_OPTIONS = [
    { value: "low", label: "Low Priority", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "Medium Priority", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "High Priority", color: "bg-red-100 text-red-800" }
];

const SORT_OPTIONS = [
    { value: "due_date", label: "Due Date" },
    { value: "priority", label: "Priority" },
    { value: "amount", label: "Budget Impact" },
    { value: "category", label: "Category" },
    { value: "status", label: "Status" }
];

interface ProfessionalWeddingTasksProps {
    weddingDate?: string;
    totalBudget?: number;
}

export function ProfessionalWeddingTasks({ weddingDate, totalBudget = 0 }: ProfessionalWeddingTasksProps) {
    const queryClient = useQueryClient();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isAutoGenerateOpen, setIsAutoGenerateOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [budgetCategoryId, setBudgetCategoryId] = useState("");
    const [assignedTo, setAssignedTo] = useState<string>("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [priority, setPriority] = useState("");
    const [amount, setAmount] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [sortBy, setSortBy] = useState("due_date");
    const [filterCategory, setFilterCategory] = useState("all");

    // Check if wedding is set up first
    const { data: weddingResponse, isLoading: isWeddingLoading } = useQuery({
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

    const { data: tasks, isLoading, error } = useQuery<WeddingTask[]>({
        queryKey: ["wedding-tasks"],
        queryFn: async () => {
            const response = await apiClient.get<any>(API_ENDPOINTS.WEDDING.TASKS);
            const data = response.data;
            if (Array.isArray(data)) {
                return data;
            } else if (data && Array.isArray(data.data)) {
                return data.data;
            } else if (data && typeof data === 'object' && data.tasks && Array.isArray(data.tasks)) {
                return data.tasks;
            }
            return [];
        },
        enabled: !!weddingResponse
    });

    // Fetch budget categories for dynamic selection
    const { data: budgetCategories } = useQuery<BudgetCategory[]>({
        queryKey: ["budget-categories", (weddingResponse as any)?.id],
        queryFn: async () => {
            if (!(weddingResponse as any)?.id) return [];
            const response = await apiClient.get<any>(API_ENDPOINTS.WEDDING.BUDGET_CATEGORIES((weddingResponse as any).id));
            return (response.data?.data || response.data || []) as BudgetCategory[];
        },
        enabled: !!(weddingResponse as any)?.id
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => apiClient.post(API_ENDPOINTS.WEDDING.TASKS, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wedding-tasks"] });
            toast.success("Task added successfully");
            resetForm();
        },
        onError: (err: any) => toast.error(err.message || "Failed to add task")
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) =>
            apiClient.put(`${API_ENDPOINTS.WEDDING.TASKS}/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wedding-tasks"] });
            toast.success("Task updated successfully");
        },
        onError: (err: any) => toast.error(err.message || "Failed to update task")
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`${API_ENDPOINTS.WEDDING.TASKS}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wedding-tasks"] });
            toast.success("Task removed");
        },
        onError: (err: any) => toast.error(err.message || "Failed to delete task")
    });

    const autoGenerateMutation = useMutation({
        mutationFn: async (categoryId: string) => {
            const category = BUDGET_CATEGORIES.find(c => c.id === categoryId);
            if (!category) throw new Error("Category not found");

            const categoryBudget = Math.round((totalBudget * category.defaultPercentage) / 100);
            const taskBudget = Math.round(categoryBudget / category.tasks.length);

            // Calculate timeline based on wedding date
            const weddingDateObj = weddingDate ? new Date(weddingDate) : new Date();
            const today = new Date();
            const daysUntilWedding = Math.ceil((weddingDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            const tasksToCreate = category.tasks.map((taskTitle, index) => {
                // Distribute tasks across timeline with venue/catering earlier, details later
                const urgencyFactor = category.id === 'venue' ? 0.8 :
                    category.id === 'catering' ? 0.7 :
                        category.id === 'photography' ? 0.6 :
                            category.id === 'attire' ? 0.4 :
                                0.3;

                const daysFromNow = Math.round(daysUntilWedding * urgencyFactor * (index + 1) / category.tasks.length);
                const dueDate = new Date();
                dueDate.setDate(today.getDate() + daysFromNow);

                return {
                    title: taskTitle,
                    description: `Auto-generated task for ${category.name} category`,
                    category: categoryId,
                    priority: index < 2 ? 'high' : index < category.tasks.length - 2 ? 'medium' : 'low',
                    amount: taskBudget,
                    end_date: dueDate.toISOString().split('T')[0],
                    status: 'pending',
                    is_completed: false
                };
            });

            // Create all tasks
            const promises = tasksToCreate.map(task =>
                apiClient.post(API_ENDPOINTS.WEDDING.TASKS, task)
            );

            return Promise.all(promises);
        },
        onSuccess: (_, categoryId) => {
            queryClient.invalidateQueries({ queryKey: ["wedding-tasks"] });
            const category = BUDGET_CATEGORIES.find(c => c.id === categoryId);
            toast.success(`Generated ${category?.tasks.length} tasks for ${category?.name}`);
            setIsAutoGenerateOpen(false);
        },
        onError: (err: any) => toast.error(err.message || "Failed to generate tasks")
    });

    const resetForm = () => {
        setIsAddDialogOpen(false);
        setTitle("");
        setDescription("");
        setCategory("");
        setBudgetCategoryId("");
        setAssignedTo("");
        setStartDate("");
        setEndDate("");
        setPriority("");
        setAmount("");
    };

    const handleCreate = () => {
        if (!title.trim()) return;

        const taskAmount = amount ? parseFloat(amount) : null;

        // Budget validation
        if (budgetCategoryId && taskAmount !== null) {
            const selectedCategory = (budgetCategories as BudgetCategory[])?.find(c => c.id === budgetCategoryId);
            if (selectedCategory && taskAmount > selectedCategory.allocated_amount) {
                const warningMessage = `Warning: Task amount (RWF ${taskAmount.toLocaleString()}) exceeds allocated budget for ${selectedCategory.category_name} (RWF ${selectedCategory.allocated_amount.toLocaleString()})`;
                toast.warning(warningMessage);
                console.warn(`[BUDGET_VIOLATION] ${warningMessage}`, {
                    taskTitle: title,
                    category: selectedCategory.category_name,
                    allocated: selectedCategory.allocated_amount,
                    requested: taskAmount
                });
                // We show the warning but allow creation as per common wedding planning flexibility, 
                // but usually the user wants it blocked or clearly warned.
                // Given the prompt "make sure that user can't enter amount which excide", I will block it.
                return;
            }
        }

        createMutation.mutate({
            title,
            description: description || null,
            category: category || null,
            budget_category_id: budgetCategoryId || null,
            assigned_to: assignedTo || null,
            start_date: startDate || null,
            end_date: endDate || null,
            priority: priority || null,
            amount: taskAmount
        });
    };

    const handleToggle = (task: WeddingTask) => {
        const newStatus = task.is_completed ? "pending" : "completed";
        updateMutation.mutate({
            id: task.id,
            data: {
                is_completed: !task.is_completed,
                status: newStatus
            }
        });
    };

    const handleStatusChange = (task: WeddingTask, newStatus: string) => {
        updateMutation.mutate({
            id: task.id,
            data: {
                status: newStatus,
                is_completed: newStatus === "completed"
            }
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
        return (
            <Badge className={`${statusConfig.color} border-0`}>
                {statusConfig.label}
            </Badge>
        );
    };

    const getAssignmentIcon = (assignedTo?: string) => {
        const assignment = ASSIGNMENT_OPTIONS.find(a => a.value === assignedTo);
        if (!assignment) return null;
        const Icon = assignment.icon;
        return (
            <div className="flex items-center text-xs text-muted-foreground">
                <Icon className="h-3 w-3 mr-1" />
                {assignment.label}
            </div>
        );
    };

    const getPriorityBadge = (priority?: string) => {
        if (!priority) return null;
        const priorityConfig = PRIORITY_OPTIONS.find(p => p.value === priority);
        if (!priorityConfig) return null;
        return (
            <Badge className={`${priorityConfig.color} border-0 text-xs`}>
                {priorityConfig.label}
            </Badge>
        );
    };

    const getCategoryBadge = (categoryId?: string, budgetCatId?: string) => {
        if (!categoryId && !budgetCatId) return null;

        // Try to find in dynamic categories first
        if (budgetCatId || categoryId) {
            const dynamicCat = (budgetCategories as BudgetCategory[])?.find(c => c.id === budgetCatId || c.category_id === categoryId);
            if (dynamicCat) {
                // Find color mapping from hardcoded defaults if available, otherwise gray
                const defaultCat = BUDGET_CATEGORIES.find(c => c.id === dynamicCat.category_id);
                const colorClass = defaultCat?.color || "bg-gray-500";
                return (
                    <Badge variant="outline" className={`text-xs ${colorClass} text-white border-0`}>
                        {dynamicCat.category_name}
                    </Badge>
                );
            }
        }

        // Fallback to hardcoded defaults
        const category = BUDGET_CATEGORIES.find(c => c.id === categoryId);
        if (!category) return null;
        return (
            <Badge variant="outline" className={`text-xs ${category.color} text-white border-0`}>
                {category.name}
            </Badge>
        );
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getDaysUntilDue = (dateString?: string) => {
        if (!dateString) return null;
        const dueDate = new Date(dateString);
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const sortTasks = (tasks: WeddingTask[]) => {
        return [...tasks].sort((a, b) => {
            switch (sortBy) {
                case "due_date":
                    if (!a.end_date && !b.end_date) return 0;
                    if (!a.end_date) return 1;
                    if (!b.end_date) return -1;
                    return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
                case "priority":
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
                        (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
                case "amount":
                    return (b.amount || 0) - (a.amount || 0);
                case "category":
                    return (a.category || "").localeCompare(b.category || "");
                case "status":
                    return (a.status || "").localeCompare(b.status || "");
                default:
                    return 0;
            }
        });
    };

    const filterTasks = (tasks: WeddingTask[]) => {
        let filtered = tasks;

        // Filter by tab
        if (activeTab === "completed") filtered = filtered.filter(t => t.is_completed);
        else if (activeTab === "pending") filtered = filtered.filter(t => !t.is_completed);
        else if (activeTab === "overdue") {
            filtered = filtered.filter(t => {
                if (!t.end_date || t.is_completed) return false;
                const days = getDaysUntilDue(t.end_date);
                return days !== null && days < 0;
            });
        }
        else if (activeTab === "urgent") {
            filtered = filtered.filter(t => {
                if (!t.end_date || t.is_completed) return false;
                const days = getDaysUntilDue(t.end_date);
                return days !== null && days <= 7 && days >= 0;
            });
        }
        else if (["groom", "bride", "other"].includes(activeTab)) {
            filtered = filtered.filter(t => t.assigned_to === activeTab);
        }
        else if (["high", "medium", "low"].includes(activeTab)) {
            filtered = filtered.filter(t => t.priority === activeTab);
        }

        // Filter by category
        if (filterCategory !== "all") {
            filtered = filtered.filter(t => t.category === filterCategory || t.budget_category_id === filterCategory);
        }

        return sortTasks(filtered);
    };

    if (isWeddingLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading wedding details...</span>
            </div>
        );
    }

    if (!weddingResponse) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <CheckCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Set Up Your Wedding First</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Before you can start planning your wedding tasks, please set up your wedding details.
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading your tasks...</span>
            </div>
        );
    }

    const tasksArray = (tasks || []) as WeddingTask[];
    const completedCount = tasksArray.filter((t: WeddingTask) => t.is_completed).length;
    const totalCount = tasksArray.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Calculate budget metrics
    const weddingBudget = Number((weddingResponse as any)?.budget || 0);
    const weddingSpent = Number((weddingResponse as any)?.spent || 0);
    const budgetUsedPercentage = weddingBudget > 0 ? (weddingSpent / weddingBudget) * 100 : 0;

    const totalBudgetFromTasks = tasksArray.reduce((sum: number, task: WeddingTask) => sum + (task.amount || 0), 0);
    const completedBudget = tasksArray.filter((t: WeddingTask) => t.is_completed).reduce((sum: number, task: WeddingTask) => sum + (task.amount || 0), 0);

    const overdueTasks = tasksArray.filter((t: WeddingTask) => {
        if (!t.end_date || t.is_completed) return false;
        const days = getDaysUntilDue(t.end_date);
        return days !== null && days < 0;
    }).length;

    const urgentTasks = tasksArray.filter((t: WeddingTask) => {
        if (!t.end_date || t.is_completed) return false;
        const days = getDaysUntilDue(t.end_date);
        return days !== null && days <= 7 && days >= 0;
    }).length;

    const filteredTasks = filterTasks(tasksArray);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Professional Wedding Planning</h2>
                    <p className="text-muted-foreground">
                        Budget-driven task management for {(weddingResponse as any)?.couple_name || "your wedding"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsAutoGenerateOpen(true)}
                        disabled={totalBudget === 0}
                    >
                        <Zap className="h-4 w-4 mr-2" />
                        Auto-Generate Tasks
                    </Button>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Task
                    </Button>
                </div>
            </div>

            {/* Enhanced Progress Card */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Planning Progress & Budget Impact</CardTitle>
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                    </div>
                    <div className="w-full bg-secondary h-3 rounded-full overflow-hidden mt-2">
                        <div
                            className="bg-primary h-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-lg font-bold text-primary">{totalCount}</div>
                            <div className="text-xs text-muted-foreground">Total Tasks</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-lg font-bold text-green-600">{completedCount}</div>
                            <div className="text-xs text-muted-foreground">Completed</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-lg font-bold text-red-600">{overdueTasks}</div>
                            <div className="text-xs text-muted-foreground">Overdue</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-lg font-bold text-yellow-600">{urgentTasks}</div>
                            <div className="text-xs text-muted-foreground">Due Soon</div>
                        </div>
                    </div>
                    {totalBudgetFromTasks > 0 && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <div className="text-sm">
                                <span className="text-muted-foreground">Task Budget: </span>
                                <span className="font-medium">RWF {totalBudgetFromTasks.toLocaleString()}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Completed Value: </span>
                                <span className="font-medium">RWF {completedBudget.toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </CardHeader>
            </Card>

            {/* Enhanced Filters and Sorting */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {budgetCategories && (budgetCategories as BudgetCategory[]).length > 0 ? (
                                (budgetCategories as BudgetCategory[]).map(cat => (
                                    <SelectItem key={cat.id} value={cat.category_id}>
                                        {cat.category_name}
                                    </SelectItem>
                                ))
                            ) : (
                                BUDGET_CATEGORIES.map(category => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <SortAsc className="h-4 w-4" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <TabsList className="grid grid-cols-4">
                            <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
                            <TabsTrigger value="pending">Pending ({tasksArray.filter(t => !t.is_completed).length})</TabsTrigger>
                            <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
                            <TabsTrigger value="overdue">Overdue ({overdueTasks})</TabsTrigger>
                        </TabsList>
                        <TabsList className="grid grid-cols-3">
                            <TabsTrigger value="urgent">
                                <Clock className="h-4 w-4 mr-1" />
                                Urgent ({urgentTasks})
                            </TabsTrigger>
                            <TabsTrigger value="high">High Priority ({tasksArray.filter(t => t.priority === 'high').length})</TabsTrigger>
                            <TabsTrigger value="medium">Medium Priority ({tasksArray.filter(t => t.priority === 'medium').length})</TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <TabsContent value={activeTab} className="mt-6">
                    <Card>
                        <CardContent className="p-0">
                            <div className="space-y-1">
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.map((task) => {
                                        const daysUntilDue = getDaysUntilDue(task.end_date);
                                        const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
                                        const isUrgent = daysUntilDue !== null && daysUntilDue <= 7 && daysUntilDue >= 0;

                                        return (
                                            <div
                                                key={task.id}
                                                className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group border-b last:border-0 ${isOverdue ? 'bg-red-50 border-l-4 border-l-red-500' :
                                                    isUrgent ? 'bg-yellow-50 border-l-4 border-l-yellow-500' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3 flex-1">
                                                    <Checkbox
                                                        className="border-2 border-gray-950"
                                                        checked={task.is_completed}
                                                        onCheckedChange={() => handleToggle(task)}
                                                    />
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <span className={`text-sm font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                                                {task.title}
                                                            </span>
                                                            {getStatusBadge(task.status)}
                                                            {getPriorityBadge(task.priority)}
                                                            {getCategoryBadge(task.category, task.budget_category_id)}
                                                            {isOverdue && (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                                    Overdue
                                                                </Badge>
                                                            )}
                                                            {isUrgent && (
                                                                <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                    Due Soon
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {task.description && (
                                                            <p className="text-xs text-muted-foreground mb-1">{task.description}</p>
                                                        )}
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            {getAssignmentIcon(task.assigned_to)}
                                                            {(task.start_date || task.end_date) && (
                                                                <div className="flex items-center text-xs text-muted-foreground">
                                                                    <Calendar className="h-3 w-3 mr-1" />
                                                                    {task.start_date && formatDate(task.start_date)}
                                                                    {task.start_date && task.end_date && " - "}
                                                                    {task.end_date && formatDate(task.end_date)}
                                                                    {daysUntilDue !== null && (
                                                                        <span className={`ml-2 ${isOverdue ? 'text-red-600' : isUrgent ? 'text-yellow-600' : ''}`}>
                                                                            ({daysUntilDue > 0 ? `${daysUntilDue} days left` :
                                                                                daysUntilDue === 0 ? 'Due today' :
                                                                                    `${Math.abs(daysUntilDue)} days overdue`})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {task.amount && (
                                                                <div className="flex items-center text-xs text-muted-foreground">
                                                                    <DollarSign className="h-3 w-3 mr-1" />
                                                                    <span className="font-medium">RWF {task.amount.toLocaleString()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        value={task.status}
                                                        onValueChange={(value) => handleStatusChange(task, value)}
                                                    >
                                                        <SelectTrigger className="w-32 h-8 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {STATUS_OPTIONS.map((status) => (
                                                                <SelectItem key={status.value} value={status.value}>
                                                                    {status.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => deleteMutation.mutate(task.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        <p>No tasks in this category yet.</p>
                                        <p className="text-xs mt-2">Use "Auto-Generate Tasks" to create budget-based tasks automatically.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Auto-Generate Tasks Dialog */}
            <Dialog open={isAutoGenerateOpen} onOpenChange={setIsAutoGenerateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Auto-Generate Wedding Tasks</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            Select a budget category to automatically generate professional wedding planning tasks with timeline and budget allocation.
                        </p>
                        <div className="grid gap-3">
                            {budgetCategories && (budgetCategories as BudgetCategory[]).length > 0 ? (
                                (budgetCategories as BudgetCategory[]).map(category => {
                                    // Find icon/color from defaults
                                    const defaultCat = BUDGET_CATEGORIES.find(c => c.id === category.category_id);
                                    const colorClass = defaultCat?.color || "bg-gray-500";
                                    const tasksCount = defaultCat?.tasks.length || 0;
                                    const existingTasks = tasksArray.filter(task => task.budget_category_id === category.id || task.category === category.category_id).length;

                                    return (
                                        <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-4 h-4 rounded-full ${colorClass}`} />
                                                <div>
                                                    <div className="font-medium">{category.category_name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {tasksCount} tasks • RWF {category.allocated_amount.toLocaleString()} budget
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {existingTasks > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {existingTasks} existing
                                                    </Badge>
                                                )}
                                                <Button
                                                    size="sm"
                                                    onClick={() => autoGenerateMutation.mutate(category.category_id)}
                                                    disabled={autoGenerateMutation.isPending}
                                                >
                                                    {autoGenerateMutation.isPending ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Zap className="h-4 w-4 mr-2" />
                                                            Generate
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                BUDGET_CATEGORIES.map(category => {
                                    const categoryBudget = Math.round((totalBudget * category.defaultPercentage) / 100);
                                    const existingTasks = tasksArray.filter(task => task.category === category.id).length;

                                    return (
                                        <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-4 h-4 rounded-full ${category.color}`} />
                                                <div>
                                                    <div className="font-medium">{category.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {category.tasks.length} tasks • RWF {categoryBudget.toLocaleString()} budget
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {existingTasks > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {existingTasks} existing
                                                    </Badge>
                                                )}
                                                <Button
                                                    size="sm"
                                                    onClick={() => autoGenerateMutation.mutate(category.id)}
                                                    disabled={autoGenerateMutation.isPending}
                                                >
                                                    {autoGenerateMutation.isPending ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Zap className="h-4 w-4 mr-2" />
                                                            Generate
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Custom Task Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Task Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Book the venue"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Budget Category</Label>
                            <Select
                                value={budgetCategoryId}
                                onValueChange={(val) => {
                                    setBudgetCategoryId(val);
                                    const cat = (budgetCategories as BudgetCategory[])?.find(c => c.id === val);
                                    if (cat) setCategory(cat.category_id);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {budgetCategories && (budgetCategories as BudgetCategory[]).length > 0 ? (
                                        (budgetCategories as BudgetCategory[]).map(cat => {
                                            const defaultCat = BUDGET_CATEGORIES.find(c => c.id === cat.category_id);
                                            const colorClass = defaultCat?.color || "bg-gray-500";
                                            return (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    <div className="flex items-center">
                                                        <div className={`w-3 h-3 rounded-full mr-2 ${colorClass}`} />
                                                        {cat.category_name} (RWF {cat.allocated_amount.toLocaleString()})
                                                    </div>
                                                </SelectItem>
                                            );
                                        })
                                    ) : (
                                        BUDGET_CATEGORIES.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                <div className="flex items-center">
                                                    <div className={`w-3 h-3 rounded-full mr-2 ${cat.color}`} />
                                                    {cat.name}
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Additional details about this task..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="assigned">Assign To</Label>
                                <Select value={assignedTo} onValueChange={setAssignedTo}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select assignment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ASSIGNMENT_OPTIONS.map((option) => {
                                            const Icon = option.icon;
                                            return (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center">
                                                        <Icon className="h-4 w-4 mr-2" />
                                                        {option.label}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRIORITY_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                <div className="flex items-center">
                                                    <div className={`w-2 h-2 rounded-full mr-2 ${option.color.split(' ')[0]}`}></div>
                                                    {option.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Budget Amount (RWF)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="e.g., 50000"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="0"
                                    step="100"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end-date">Due Date</Label>
                                <Input
                                    id="end-date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="start-date">Start Date (Optional)</Label>
                            <Input
                                id="start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={createMutation.isPending}>
                            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Create Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}