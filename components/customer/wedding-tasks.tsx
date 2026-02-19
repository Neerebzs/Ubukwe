"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    Calendar
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS, WeddingTask, BudgetCategory } from "@/lib/api";
import { toast } from "sonner";
import { AlertTriangle, Zap, Filter, SortAsc, Clock } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Layout,
    FileText,
    LayoutGrid,
    Wallet,
    Flag,
    Package,
    ArrowRightCircle,
    Pencil,
    Eye
} from "lucide-react";



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

export function WeddingTasks() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [budgetCategoryId, setBudgetCategoryId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState<string>("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [priority, setPriority] = useState("");
    const [amount, setAmount] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [selectedTask, setSelectedTask] = useState<WeddingTask | null>(null);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");

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
            // Ensure we always return an array
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
        enabled: !!weddingResponse // Only fetch tasks if wedding is set up
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

    // Fetch single task details for "View" mode
    const { data: taskDetail, isLoading: isTaskDetailLoading } = useQuery<WeddingTask>({
        queryKey: ["wedding-task-detail", selectedTaskId],
        queryFn: async () => {
            if (!selectedTaskId) return null;
            const response = await apiClient.get<any>(`${API_ENDPOINTS.WEDDING.TASKS}/${selectedTaskId}`);
            return response.data?.data || response.data;
        },
        enabled: !!selectedTaskId && modalMode === "view"
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

    const resetForm = () => {
        setIsAddDialogOpen(false);
        setTitle("");
        setDescription("");
        setBudgetCategoryId("");
        setAssignedTo("");
        setStartDate("");
        setEndDate("");
        setPriority("");
        setAmount("");
        setSelectedTask(null);
        setSelectedTaskId(null);
        setModalMode("add");
    };

    const today = new Date().toISOString().split('T')[0];
    const weddingEve = (weddingResponse as any)?.wedding_date
        ? (() => {
            const d = new Date((weddingResponse as any).wedding_date);
            d.setDate(d.getDate() - 1);
            return d.toISOString().split('T')[0];
        })()
        : undefined;

    const handleCreate = () => {
        if (!title.trim()) {
            toast.error("Task title is required.");
            return;
        }

        // Budget category validation - MUST be selected
        if (!budgetCategoryId || budgetCategoryId.trim() === "") {
            toast.error("Please select a budget category before creating the task.");
            return;
        }

        // Date validation
        if (startDate && startDate < today) {
            toast.warning("Start date cannot be in the past.");
            return;
        }
        if (endDate && endDate < today) {
            toast.warning("End date cannot be in the past.");
            return;
        }
        if (weddingEve) {
            if (startDate && startDate > weddingEve) {
                toast.warning(`Start date must be before the wedding day (by ${new Date(weddingEve).toLocaleDateString()}).`);
                return;
            }
            if (endDate && endDate > weddingEve) {
                toast.warning(`End date must be before the wedding day (by ${new Date(weddingEve).toLocaleDateString()}).`);
                return;
            }
        }

        // Budget validation
        if (amount && budgetCategoryId) {
            const selectedCategory = budgetCategories?.find(cat => cat.id === budgetCategoryId);
            const taskAmount = parseFloat(amount);

            if (selectedCategory && taskAmount > selectedCategory.allocated_amount) {
                toast.warning(`Budget Warning: This task amount (RWF ${taskAmount.toLocaleString()}) exceeds the allocated budget for ${selectedCategory.category_name} (RWF ${selectedCategory.allocated_amount.toLocaleString()}).`);
                console.warn(`[BUDGET_VIOLATION] Task "${title}" amount ${taskAmount} exceeds category "${selectedCategory.category_name}" allocation of ${selectedCategory.allocated_amount}`);
                return; // Block creation
            }
        }

        const payload = {
            title,
            description: description || null,
            budget_category_id: budgetCategoryId, // Always included since it's validated above
            assigned_to: assignedTo || null,
            start_date: startDate || null,
            end_date: endDate || null,
            priority: priority || null,
            amount: amount ? parseFloat(amount) : null
        };

        if (modalMode === "edit" && selectedTask) {
            updateMutation.mutate({
                id: selectedTask.id,
                data: payload
            });
        } else {
            createMutation.mutate(payload);
        }
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

    const getCategoryBadge = (categoryId?: string) => {
        if (!categoryId) return null;
        const category = budgetCategories?.find(c => c.id === categoryId);
        if (!category) return null;

        return (
            <Badge variant="outline" className="text-xs border-primary/20 bg-primary/5 text-primary">
                {category.category_name}
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

    const filterTasks = (tasks: WeddingTask[]) => {
        if (activeTab === "all") return tasks;
        if (activeTab === "completed") return tasks.filter(t => t.is_completed);
        if (activeTab === "pending") return tasks.filter(t => !t.is_completed);
        if (activeTab === "high") return tasks.filter(t => t.priority === "high");
        if (activeTab === "medium") return tasks.filter(t => t.priority === "medium");
        if (activeTab === "low") return tasks.filter(t => t.priority === "low");
        return tasks.filter(t => t.assigned_to === activeTab);
    };

    if (isWeddingLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading wedding details...</span>
            </div>
        );
    }

    // Show wedding setup prompt if no wedding is configured
    if (!weddingResponse || Object.keys(weddingResponse).length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <CheckCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Set Up Your Wedding First</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Before you can start planning your wedding tasks, please set up your wedding details including the bride and groom names and wedding date.
                    </p>
                    <Button
                        onClick={() => {
                            // Navigate to overview tab to set up wedding
                            router.push('/customer/dashboard?tab=overview');
                        }}
                        className="mb-2"
                    >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Set Up Wedding Details
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        You'll be redirected to the dashboard where you can add your wedding information.
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading your checklist...</span>
            </div>
        );
    }

    if (error) {
        const errorMessage = (error as any)?.message || "";
        const isWeddingNotFound = errorMessage.includes("Wedding details not found") || errorMessage.includes("404");

        if (isWeddingNotFound) {
            return (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <CheckCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Set Up Your Wedding First</h3>
                        <p className="text-muted-foreground mb-6 max-w-md">
                            Before you can start planning your wedding tasks, please set up your wedding details including the bride and groom names and wedding date.
                        </p>
                        <Button
                            onClick={() => {
                                router.push('/customer/dashboard?tab=overview');
                            }}
                            className="mb-2"
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Set Up Wedding Details
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            You'll be redirected to the dashboard where you can add your wedding information.
                        </p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Unable to Load Tasks</h3>
                    <p className="text-muted-foreground mb-4">There was an error loading your wedding tasks.</p>
                    <Button
                        variant="outline"
                        onClick={() => queryClient.invalidateQueries({ queryKey: ["wedding-tasks"] })}
                    >
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const tasksArray = tasks || [];
    const completedCount = tasksArray.filter(t => t.is_completed).length;
    const totalCount = tasksArray.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const filteredTasks = filterTasks(tasksArray);

    // Calculate budget totals
    const totalBudget = tasksArray.reduce((sum, task) => sum + (task.amount || 0), 0);
    const completedBudget = tasksArray.filter(t => t.is_completed).reduce((sum, task) => sum + (task.amount || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Wedding Checklist</h2>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {(weddingResponse as any)?.couple_name ?
                            `Planning for ${(weddingResponse as any).couple_name}` :
                            "Manage your path to the big day"
                        }
                    </p>
                    {(weddingResponse as any)?.wedding_date && (
                        <div className="flex items-center gap-4 mt-2">
                            <p className="text-sm text-primary font-semibold flex items-center gap-1.5 p-1 px-2 bg-primary/10 rounded-md">
                                <Calendar className="h-4 w-4" />
                                {new Date((weddingResponse as any).wedding_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                            {(() => {
                                const diff = new Date((weddingResponse as any).wedding_date).getTime() - new Date().getTime();
                                const daysRem = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                if (daysRem < 0) return null;
                                return (
                                    <div className="flex items-center gap-1 text-sm font-bold text-orange-600 animate-bounce cursor-default">
                                        <Clock className="h-4 w-4" />
                                        {daysRem} Days To Go!
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Task
                </Button>
            </div>

            <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-transparent to-primary/5 hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-3 px-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Zap className="h-4 w-4 text-primary animate-pulse" />
                                Planning Progress
                            </CardTitle>
                            <p className="text-xs text-muted-foreground italic">Your journey to the big day</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-bold text-primary">{progress}%</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Complete</span>
                        </div>
                    </div>
                    <div className="w-full bg-secondary/50 h-3 rounded-full overflow-hidden mt-4 group">
                        <div
                            className="bg-primary h-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%]"></div>
                        </div>
                    </div>
                    {totalBudget > 0 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary/10">
                            <div className="text-sm group flex items-center gap-2">
                                <span className="text-muted-foreground font-medium">Total Budget: </span>
                                <span className="font-bold text-primary group-hover:scale-105 transition-transform duration-200 inline-block">RWF {totalBudget.toLocaleString()}</span>
                            </div>
                            <div className="text-sm group flex items-center gap-2">
                                <span className="text-muted-foreground font-medium">Value Realized: </span>
                                <span className="font-bold text-green-600 group-hover:scale-105 transition-transform duration-200 inline-block">RWF {completedBudget.toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </CardHeader>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <TabsList className="grid grid-cols-3">
                            <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
                            <TabsTrigger value="pending">Pending ({tasksArray.filter(t => !t.is_completed).length})</TabsTrigger>
                            <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
                        </TabsList>
                        <TabsList className="grid grid-cols-3">
                            <TabsTrigger value="groom">Groom ({tasksArray.filter(t => t.assigned_to === 'groom').length})</TabsTrigger>
                            <TabsTrigger value="bride">Bride ({tasksArray.filter(t => t.assigned_to === 'bride').length})</TabsTrigger>
                            <TabsTrigger value="other">Both/Other ({tasksArray.filter(t => t.assigned_to === 'other').length})</TabsTrigger>
                        </TabsList>
                        <TabsList className="grid grid-cols-3">
                            <TabsTrigger value="high">High Priority ({tasksArray.filter(t => t.priority === 'high').length})</TabsTrigger>
                            <TabsTrigger value="medium">Medium Priority ({tasksArray.filter(t => t.priority === 'medium').length})</TabsTrigger>
                            <TabsTrigger value="low">Low Priority ({tasksArray.filter(t => t.priority === 'low').length})</TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <TabsContent value={activeTab} className="mt-6">
                    <Card>
                        <CardContent className="p-0">
                            <div className="space-y-1">
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center justify-between p-4 hover:bg-primary/5 transition-all duration-200 group border-b last:border-0 hover:pl-6"
                                        >
                                            <div className="flex items-center space-x-3 flex-1">
                                                <Checkbox
                                                    className="border-2 border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-transform group-hover:scale-110"
                                                    checked={task.is_completed}
                                                    onCheckedChange={() => handleToggle(task)}
                                                />
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-sm font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                                            {task.title}
                                                        </span>
                                                        {getStatusBadge(task.status)}
                                                        {getPriorityBadge(task.priority)}
                                                        {getCategoryBadge(task.budget_category_id)}
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
                                                            </div>
                                                        )}
                                                        {task.amount && (
                                                            <div className="flex items-center text-xs text-muted-foreground">
                                                                <span className="font-medium">RWF {task.amount.toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => {
                                                        setSelectedTaskId(task.id);
                                                        setModalMode("view");
                                                        setIsAddDialogOpen(true);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {!task.is_completed && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            setSelectedTask(task);
                                                            setModalMode("edit");
                                                            // Prefill form for editing
                                                            setTitle(task.title);
                                                            setDescription(task.description || "");
                                                            setBudgetCategoryId(task.budget_category_id || "");
                                                            setAssignedTo(task.assigned_to || "");
                                                            setStartDate(task.start_date || "");
                                                            setEndDate(task.end_date || "");
                                                            setPriority(task.priority || "");
                                                            setAmount(task.amount?.toString() || "");
                                                            setIsAddDialogOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}
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
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        <p>No tasks in this category yet.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                if (!open) resetForm();
                setIsAddDialogOpen(open);
            }}>
                <DialogContent className="w-full max-w-[85vw] lg:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-6 pb-4  border-b">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            {modalMode === "view" ? (
                                <Eye className="h-6 w-6 text-primary p-1 bg-primary/10 rounded-full" />
                            ) : modalMode === "edit" ? (
                                <Pencil className="h-6 w-6 text-primary p-1 bg-primary/10 rounded-full" />
                            ) : (
                                <Plus className="h-6 w-6 text-primary p-1 bg-primary/10 rounded-full" />
                            )}
                            {modalMode === "view" ? "Task Details" : modalMode === "edit" ? "Edit Task" : "Add New Task"}
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {modalMode === "view" ? "Intelligence summary and logistics for this task" : "Break down your wedding planning into actionable steps"}
                        </p>
                    </DialogHeader>

                    <div className="p-0 overflow-y-auto max-h-[70vh]">
                        {modalMode === "view" ? (
                            <div className="animate-in fade-in duration-500">
                                {isTaskDetailLoading && !selectedTaskId ? (
                                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                        <p className="text-muted-foreground animate-pulse font-medium">Loading task intelligence...</p>
                                    </div>
                                ) : (
                                    (() => {
                                        const displayTask = taskDetail || tasks?.find(t => t.id === selectedTaskId) || selectedTask;
                                        if (!displayTask) return (
                                            <div className="py-20 text-center text-muted-foreground">Task not found</div>
                                        );

                                        return (
                                            <div className="flex flex-col md:flex-row">
                                                {/* Left Column: Task Context */}
                                                <div className="flex-1 p-8 space-y-8 border-r border-dotted">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            {getPriorityBadge(displayTask.priority)}
                                                            {getStatusBadge(displayTask.status)}
                                                        </div>
                                                        <h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
                                                            {displayTask.title}
                                                        </h1>
                                                        <div className="h-1 w-20 bg-primary/20 rounded-full" />
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2">
                                                            <FileText className="h-3 w-3" />
                                                            Description & Scope
                                                        </h4>
                                                        <p className="text-base text-muted-foreground leading-relaxed bg-primary/[0.02] p-6 rounded-2xl border border-primary/5 italic">
                                                            {displayTask.description || "Detailed scope has not been defined for this task yet. Please update the task to include specific requirements or notes."}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-6 pt-4">
                                                        <div className="p-5 rounded-2xl bg-secondary/30 border border-primary/5 space-y-3">
                                                            <div className="flex items-center gap-2 text-primary">
                                                                <Wallet className="h-4 w-4" />
                                                                <span className="text-[10px] font-bold uppercase tracking-wider">Budget Allocation</span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-2xl font-bold text-foreground">
                                                                    {displayTask.amount ? `RWF ${displayTask.amount.toLocaleString()}` : "Unallocated"}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    {budgetCategories?.find(c => c.id === displayTask.budget_category_id)?.category_name || "General Planning"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                                                            <div className="flex items-center gap-2 text-primary">
                                                                <Users className="h-4 w-4" />
                                                                <span className="text-[10px] font-bold uppercase tracking-wider">Ownership</span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-2xl font-bold text-foreground capitalize">
                                                                    {displayTask.assigned_to || "Shared"}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">Primary Coordinator</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Sidebar: Timeline & Logistics */}
                                                <div className="w-full md:w-[400px] bg-muted/30 p-8 space-y-8">
                                                    <div className="space-y-6">
                                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Logistics & Timeline</h4>

                                                        <div className="space-y-6">
                                                            <div className="flex gap-4">
                                                                <div className="h-10 w-10 shrink-0 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-primary/10">
                                                                    <Calendar className="h-5 w-5" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] text-muted-foreground font-semibold uppercase">Planning Phase</p>
                                                                    <p className="text-sm font-bold text-foreground">
                                                                        {displayTask.start_date ? formatDate(displayTask.start_date) : "Immediate"}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-4">
                                                                <div className="h-10 w-10 shrink-0 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-primary/10">
                                                                    <ArrowRightCircle className="h-5 w-5" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] text-muted-foreground font-semibold uppercase">Deadline</p>
                                                                    <p className="text-sm font-bold text-foreground">
                                                                        {displayTask.end_date ? formatDate(displayTask.end_date) : "Ongoing"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pt-8 border-t border-primary/5 space-y-4">
                                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Task Progress</h4>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-end mb-1">
                                                                <span className="text-xs font-semibold text-muted-foreground">Current State</span>
                                                                <span className="text-xs font-bold text-primary capitalize">{displayTask.status.replace('_', ' ')}</span>
                                                            </div>
                                                            <div className="h-2 w-full bg-white rounded-full overflow-hidden border">
                                                                <div
                                                                    className={`h-full transition-all duration-1000 ${displayTask.status === 'completed' ? 'bg-green-500' :
                                                                        displayTask.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                                                                        }`}
                                                                    style={{ width: displayTask.status === 'completed' ? '100%' : displayTask.status === 'in_progress' ? '50%' : '10%' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pt-8 space-y-3">
                                                        <Button
                                                            variant="outline"
                                                            className="w-full justify-start gap-2 h-11 rounded-xl bg-white border-primary/10 hover:bg-primary/5 hover:text-primary transition-all"
                                                            onClick={resetForm}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            Mark as Acknowledged
                                                        </Button>
                                                        {!displayTask.is_completed && (
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start gap-2 h-11 rounded-xl hover:text- hover:bg-primary/5 text-primary transition-all"
                                                                onClick={() => {
                                                                    setSelectedTask(displayTask);
                                                                    setModalMode("edit");
                                                                    setTitle(displayTask.title);
                                                                    setDescription(displayTask.description || "");
                                                                    setBudgetCategoryId(displayTask.budget_category_id || "");
                                                                    setAssignedTo(displayTask.assigned_to || "");
                                                                    setStartDate(displayTask.start_date || "");
                                                                    setEndDate(displayTask.end_date || "");
                                                                    setPriority(displayTask.priority || "");
                                                                    setAmount(displayTask.amount?.toString() || "");
                                                                }}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                Edit Task Intelligence
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()
                                )}
                            </div>
                        ) : (
                            <div className="p-8 space-y-8 animate-in slide-in-from-right duration-300">
                                {/* Primary Info Segment */}
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title" className="flex items-center gap-2 font-semibold">
                                            <Layout className="h-4 w-4 text-primary" />
                                            Task Title <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g., Book the venue"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="h-12 text-base transition-all focus:ring-2 focus:ring-primary/20 border-primary/10"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description" className="flex items-center gap-2 font-semibold">
                                            <FileText className="h-4 w-4 text-primary" />
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Additional details about this task..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            className="resize-none transition-all focus:ring-2 focus:ring-primary/20 border-primary/10"
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

                                {/* Budget & Category Segment */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                    <div className="grid gap-2">
                                        <Label htmlFor="category" className="flex items-center gap-2 font-semibold text-primary">
                                            <LayoutGrid className="h-4 w-4" />
                                            Budget Category <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={budgetCategoryId}
                                            onValueChange={setBudgetCategoryId}
                                        >
                                            <SelectTrigger className="bg-white border-primary/20">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {budgetCategories?.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{cat.category_name}</span>
                                                            <span className="text-[10px] text-muted-foreground italic">
                                                                Allocated: RWF {cat.allocated_amount.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="amount" className="flex items-center gap-2 font-semibold text-primary">
                                            <Wallet className="h-4 w-4" />
                                            Budget Amount
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground border-r pr-2 h-4 flex items-center">RWF</span>
                                            <Input
                                                id="amount"
                                                type="number"
                                                placeholder="0"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="pl-14 h-10 bg-white border-primary/20 transition-all focus:ring-2 focus:ring-primary/20"
                                                min="0"
                                                step="1000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Logistic Segment */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border p-4 rounded-xl border-dashed">
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="assigned" className="flex items-center gap-2 font-semibold">
                                                <Users className="h-4 w-4 text-primary" />
                                                Assign To
                                            </Label>
                                            <Select
                                                value={assignedTo}
                                                onValueChange={setAssignedTo}
                                            >
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Select assignment" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ASSIGNMENT_OPTIONS.map((option) => {
                                                        const Icon = option.icon;
                                                        return (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                <div className="flex items-center">
                                                                    <Icon className="h-4 w-4 mr-2 text-primary/60" />
                                                                    {option.label}
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="priority" className="flex items-center gap-2 font-semibold">
                                                <Flag className="h-4 w-4 text-primary" />
                                                Priority Level
                                            </Label>
                                            <Select
                                                value={priority}
                                                onValueChange={setPriority}
                                            >
                                                <SelectTrigger className="h-10">
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

                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="start-date" className="flex items-center gap-2 font-semibold text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                Start Date
                                            </Label>
                                            <Input
                                                id="start-date"
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                min={today}
                                                max={weddingEve}
                                                className="h-10 text-xs transition-all focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="end-date" className="flex items-center gap-2 font-semibold text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                Target End Date
                                            </Label>
                                            <Input
                                                id="end-date"
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                min={today}
                                                max={weddingEve}
                                                className="h-10 text-xs transition-all focus:ring-2 focus:ring-primary/20 border-primary/20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-6 bg-muted/30 border-t gap-3 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={resetForm}
                            className="hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
                        >
                            {modalMode === "view" ? "Close" : "Discard"}
                        </Button>
                        {modalMode !== "view" && (
                            <Button
                                onClick={handleCreate}
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-8 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {createMutation.isPending || updateMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : modalMode === "edit" ? (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                ) : (
                                    <Plus className="h-4 w-4 mr-2" />
                                )}
                                {modalMode === "edit" ? "Save Changes" : "Create Wedding Task"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
