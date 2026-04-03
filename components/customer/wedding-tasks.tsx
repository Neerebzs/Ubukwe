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
import { apiClient, API_ENDPOINTS, WeddingTask, BudgetCategory, Wedding } from "@/lib/api";
import { toast } from "sonner";
import { AlertTriangle, Zap, Filter, SortAsc, Clock, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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
    Eye,
    Sparkles,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    X,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Clock3
} from "lucide-react";
import { aiAssistantAPI } from "@/lib/api/ai-assistant";



const ASSIGNMENT_OPTIONS = [
    { value: "groom", label: "Groom", icon: User },
    { value: "bride", label: "Bride", icon: User },
    { value: "other", label: "Both/Other", icon: Users }
];

const STATUS_OPTIONS = [
    { value: "pending", label: "Pending", color: "bg-slate-100 text-slate-800" },
    { value: "in_progress", label: "In Progress", color: "bg-sage-100 text-sage-800" },
    { value: "completed", label: "Completed", color: "bg-emerald-100 text-emerald-800" }
];

const PRIORITY_OPTIONS = [
    { value: "low", label: "Low Priority", color: "bg-slate-100 text-slate-700" },
    { value: "medium", label: "Medium Priority", color: "bg-amber-100 text-amber-800" },
    { value: "high", label: "High Priority", color: "bg-rose-100 text-rose-800" }
];

// ─── AI Suggestions Panel ────────────────────────────────────────────────────

const SUGGESTION_ICONS: Record<string, React.ReactNode> = {
    timeline_risk: <Clock3 className="h-4 w-4" />,
    task_priority: <TrendingUp className="h-4 w-4" />,
    budget_alert: <DollarSign className="h-4 w-4" />,
    vendor_booking: <ShoppingBag className="h-4 w-4" />,
};

const PRIORITY_COLORS: Record<string, string> = {
    urgent: "bg-rose-50 border-rose-200 text-rose-700",
    high:   "bg-amber-50 border-amber-200 text-amber-700",
    medium: "bg-blue-50 border-blue-200 text-blue-700",
    low:    "bg-slate-50 border-slate-200 text-slate-600",
};

function AISuggestionsPanel({ weddingId }: { weddingId: string }) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(true);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ["ai-suggestions", weddingId],
        queryFn: () => aiAssistantAPI.getActiveSuggestions(weddingId, 5),
        staleTime: 1000 * 60 * 5,
        enabled: !!weddingId,
    });

    const generateMutation = useMutation({
        mutationFn: () => aiAssistantAPI.generateSuggestions(weddingId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ai-suggestions", weddingId] });
            toast.success("AI suggestions refreshed");
        },
        onError: () => toast.error("Failed to generate suggestions"),
    });

    const respondMutation = useMutation({
        mutationFn: ({ id, response }: { id: string; response: string }) =>
            aiAssistantAPI.respondToSuggestion(id, response as any),
        onSuccess: (_, { id }) => {
            setDismissed((prev) => new Set([...prev, id]));
            queryClient.invalidateQueries({ queryKey: ["ai-suggestions", weddingId] });
        },
    });

    const suggestions = (data?.data ?? []).filter((s: any) => !dismissed.has(s.id));

    return (
        <Card className="border-none shadow-md rounded-2xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-slate-800 text-sm">AI Planning Suggestions</p>
                        <p className="text-xs text-slate-400">
                            {suggestions.length > 0
                                ? `${suggestions.length} active suggestion${suggestions.length !== 1 ? "s" : ""}`
                                : "No active suggestions"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => { e.stopPropagation(); generateMutation.mutate(); }}
                        disabled={generateMutation.isPending || isFetching}
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${generateMutation.isPending || isFetching ? "animate-spin" : ""}`} />
                    </Button>
                    {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
            </button>

            {open && (
                <CardContent className="p-4 space-y-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Loading suggestions...</span>
                        </div>
                    ) : suggestions.length === 0 ? (
                        <div className="text-center py-8 space-y-2">
                            <CheckCircle className="h-8 w-8 text-emerald-300 mx-auto" />
                            <p className="text-sm text-slate-500">All caught up! No active suggestions.</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full text-xs"
                                onClick={() => generateMutation.mutate()}
                                disabled={generateMutation.isPending}
                            >
                                <Sparkles className="h-3 w-3 mr-1.5" />
                                Generate New
                            </Button>
                        </div>
                    ) : (
                        suggestions.map((s: any) => (
                            <div
                                key={s.id}
                                className={`p-4 rounded-xl border space-y-2 ${PRIORITY_COLORS[s.priority] ?? PRIORITY_COLORS.low}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {SUGGESTION_ICONS[s.suggestion_type]}
                                        <p className="font-semibold text-sm truncate">{s.title}</p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                            {s.priority}
                                        </span>
                                        <button
                                            onClick={() => respondMutation.mutate({ id: s.id, response: "dismissed" })}
                                            className="opacity-50 hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs leading-relaxed opacity-80">{s.message}</p>
                                {s.suggested_actions?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {s.suggested_actions.slice(0, 2).map((action: any) => (
                                            <button
                                                key={action.action}
                                                onClick={() => respondMutation.mutate({ id: s.id, response: "accepted" })}
                                                className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/60 hover:bg-white/90 border border-current/20 transition-all"
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </CardContent>
            )}
        </Card>
    );
}

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
    const { data: weddingResponse, isLoading: isWeddingLoading } = useQuery<Wedding | null>({
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
        queryKey: ["budget-categories", weddingResponse?.id],
        queryFn: async () => {
            if (!weddingResponse?.id) return [];
            const response = await apiClient.get<any>(API_ENDPOINTS.WEDDING.BUDGET_CATEGORIES(weddingResponse.id));
            return (response.data?.data || response.data || []) as BudgetCategory[];
        },
        enabled: !!weddingResponse?.id
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
    const weddingEve = weddingResponse?.wedding_date
        ? (() => {
            const d = new Date(weddingResponse.wedding_date);
            d.setDate(d.getDate() - 1);
            return d.toISOString().split('T')[0];
        })()
        : undefined;

    const handleCreate = () => {
        if (!title.trim()) {
            toast.error("Task title is required.");
            return;
        }

        if (!budgetCategoryId || budgetCategoryId.trim() === "") {
            toast.error("Please select a budget category before creating the task.");
            return;
        }

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

        if (amount && budgetCategoryId) {
            const selectedCategory = budgetCategories?.find(cat => cat.id === budgetCategoryId);
            const taskAmount = parseFloat(amount);

            if (selectedCategory && taskAmount > selectedCategory.allocated_amount) {
                toast.warning(`Budget Warning: This task amount exceeds the allocated budget.`);
                return;
            }
        }

        const payload = {
            title,
            description: description || null,
            budget_category_id: budgetCategoryId,
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
            <Badge className={`${statusConfig.color} border-0 rounded-full px-3 text-[10px] font-bold uppercase tracking-wider`}>
                {statusConfig.label}
            </Badge>
        );
    };

    const getAssignmentIcon = (assignedTo?: string) => {
        const assignment = ASSIGNMENT_OPTIONS.find(a => a.value === assignedTo);
        if (!assignment) return null;
        const Icon = assignment.icon;
        return (
            <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
            <Badge className={`${priorityConfig.color} border-0 text-[10px] font-bold uppercase tracking-wider rounded-full px-3`}>
                {priorityConfig.label}
            </Badge>
        );
    };

    const getCategoryBadge = (categoryId?: string) => {
        if (!categoryId) return null;
        const category = budgetCategories?.find(c => c.id === categoryId);
        if (!category) return null;

        return (
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-sage-100 bg-sage-50 text-sage-700 rounded-full px-3">
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
                <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
                <span className="ml-2 font-serif italic text-slate-600">Curating your experience...</span>
            </div>
        );
    }

    if (!weddingResponse || Object.keys(weddingResponse).length === 0) {
        return (
            <Card className="border-none shadow-xl shadow-sage-500/5 bg-gradient-to-br from-sage-50/50 via-white to-transparent rounded-[2.5rem] overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <CheckCircle className="h-16 w-16 text-sage-200 mb-6" />
                    <h3 className="text-2xl font-serif italic text-slate-800 mb-2">Set Up Your Celebration</h3>
                    <p className="text-slate-500 mb-8 max-w-md">
                        Before you can start planning your magical day, please tell us a bit about your celebration.
                    </p>
                    <Button
                        onClick={() => router.push('/customer/dashboard?tab=overview')}
                        className="rounded-full px-8 text-white shadow-lg shadow-sage-200"
                    >
                        <Heart className="h-4 w-4 mr-2" />
                        Set Up Wedding Details
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
                <span className="ml-2 font-serif italic text-slate-600">Loading your checklist...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-none shadow-xl shadow-sage-500/5 bg-sage-50/50 rounded-[2.5rem] overflow-hidden">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-rose-300 mb-4" />
                    <h3 className="text-xl font-serif italic text-slate-800 mb-2">Something went wrong</h3>
                    <p className="text-slate-500 mb-6 font-medium">We couldn't load your planning checklist.</p>
                    <Button
                        variant="outline"
                        className="rounded-full px-6 border-sage-200 text-sage-700 hover:bg-sage-50"
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

    const totalBudget = tasksArray.reduce((sum, task) => sum + (Number(task.amount) || 0), 0);
    const completedBudget = tasksArray.filter(t => t.is_completed).reduce((sum, task) => sum + (Number(task.amount) || 0), 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-serif italic text-slate-800">Wedding Checklist</h2>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                        <p className="text-slate-500 flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-sage-600" />
                            {weddingResponse?.couple_name ?
                                `Planning for ${weddingResponse.couple_name}` :
                                "Manage your path to the big day"
                            }
                        </p>
                        {weddingResponse?.wedding_date && (
                            <div className="flex items-center gap-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-sage-700 bg-sage-50 px-3 py-1 rounded-full border border-sage-100">
                                    {new Date(weddingResponse.wedding_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                {(() => {
                                    const diff = new Date(weddingResponse.wedding_date).getTime() - new Date().getTime();
                                    const daysRem = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                    if (daysRem < 0) return null;
                                    return (
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                            <Clock className="h-3 w-3" />
                                            {daysRem} Days To Go
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>
                <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="rounded-full px-6 text-white shadow-lg shadow-sage-100 self-start md:self-auto"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Task
                </Button>
            </div>

            <Card className="border-none shadow-xl shadow-sage-500/5 bg-gradient-to-br from-sage-50/50 via-white to-transparent rounded-[2.5rem] overflow-hidden">
                <CardHeader className="pt-8 px-8 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-serif italic text-slate-800 flex items-center gap-2">
                                <Zap className="h-5 w-5 text-sage-600" />
                                Planning Progress
                            </CardTitle>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-bold text-sage-700">{progress}%</span>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Complete</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-8 pb-10">
                    <Progress value={progress} className="h-3 bg-sage-50 [&>div]:bg-sage-600 rounded-full" />

                    {totalBudget > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-sage-100/50">
                            <div className="flex items-center gap-4 p-4 bg-white/60 rounded-3xl border border-sage-100/50 shadow-sm transition-all hover:shadow-md">
                                <div className="h-10 w-10 rounded-2xl bg-sage-50 flex items-center justify-center text-sage-600">
                                    <Wallet className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Budget</p>
                                    <p className="text-lg font-bold text-slate-800">RWF {totalBudget.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white/60 rounded-3xl border border-sage-100/50 shadow-sm transition-all hover:shadow-md">
                                <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Value Realized</p>
                                    <p className="text-lg font-bold text-emerald-700">RWF {completedBudget.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* AI Suggestions Panel */}
            {weddingResponse?.id && (
                <AISuggestionsPanel weddingId={weddingResponse.id} />
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/50 rounded-full w-fit">
                        <TabsList className="bg-transparent h-9 gap-1">
                            <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-sage-700 data-[state=active]:shadow-sm px-6 text-xs font-bold uppercase tracking-wider">All ({totalCount})</TabsTrigger>
                            <TabsTrigger value="pending" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-sage-700 data-[state=active]:shadow-sm px-6 text-xs font-bold uppercase tracking-wider">Pending ({tasksArray.filter(t => !t.is_completed).length})</TabsTrigger>
                            <TabsTrigger value="completed" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-sage-700 data-[state=active]:shadow-sm px-6 text-xs font-bold uppercase tracking-wider">Completed ({completedCount})</TabsTrigger>
                        </TabsList>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/50 rounded-full w-fit">
                            <TabsList className="bg-transparent h-9 gap-1">
                                <TabsTrigger value="groom" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-sage-700 data-[state=active]:shadow-sm px-4 text-xs font-bold uppercase tracking-wider">Groom</TabsTrigger>
                                <TabsTrigger value="bride" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-sage-700 data-[state=active]:shadow-sm px-4 text-xs font-bold uppercase tracking-wider">Bride</TabsTrigger>
                                <TabsTrigger value="other" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-sage-700 data-[state=active]:shadow-sm px-4 text-xs font-bold uppercase tracking-wider">Both</TabsTrigger>
                            </TabsList>
                        </div>
                        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/50 rounded-full w-fit">
                            <TabsList className="bg-transparent h-9 gap-1">
                                <TabsTrigger value="high" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-sage-700 data-[state=active]:shadow-sm px-4 text-xs font-bold uppercase tracking-wider">High</TabsTrigger>
                                <TabsTrigger value="medium" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-sage-700 data-[state=active]:shadow-sm px-4 text-xs font-bold uppercase tracking-wider">Med</TabsTrigger>
                                <TabsTrigger value="low" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-sage-700 data-[state=active]:shadow-sm px-4 text-xs font-bold uppercase tracking-wider">Low</TabsTrigger>
                            </TabsList>
                        </div>
                    </div>
                </div>

                <TabsContent value={activeTab} className="mt-8">
                    <div className="space-y-4">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white rounded-[1.5rem] border border-sage-100/30 shadow-sm hover:shadow-md hover:border-sage-200/50 transition-all duration-300 group gap-4 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-sage-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-start sm:items-center space-x-4 flex-1">
                                        <Checkbox
                                            className="mt-1 sm:mt-0 h-5 w-5 rounded-md border-2 border-slate-300 text-sage-600 focus:ring-sage-600 data-[state=checked]:bg-sage-600 data-[state=checked]:border-sage-600 transition-colors"
                                            checked={task.is_completed}
                                            onCheckedChange={() => handleToggle(task)}
                                        />
                                        <div className="flex flex-col min-w-0 flex-1 gap-1.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`text-base font-semibold ${task.is_completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                                    {task.title}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    {getStatusBadge(task.status)}
                                                    {getPriorityBadge(task.priority)}
                                                    {getCategoryBadge(task.budget_category_id)}
                                                </div>
                                            </div>
                                            {task.description && (
                                                <p className="text-sm text-slate-500 leading-relaxed font-serif italic">{task.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-1 flex-wrap">
                                                {getAssignmentIcon(task.assigned_to)}
                                                {(task.start_date || task.end_date) && (
                                                    <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                        <Calendar className="h-3 w-3 mr-1.5" />
                                                        {task.start_date && formatDate(task.start_date)}
                                                        {task.start_date && task.end_date && " - "}
                                                        {task.end_date && formatDate(task.end_date)}
                                                    </div>
                                                )}
                                                {task.amount && (
                                                    <div className="flex items-center text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                                                        <span>RWF {task.amount.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-end sm:self-auto ml-10 sm:ml-0 bg-slate-50 p-1.5 rounded-full border border-slate-200/50">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-sage-700 hover:bg-sage-50 rounded-full"
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
                                                className="h-8 w-8 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                                                onClick={() => {
                                                    setSelectedTask(task);
                                                    setModalMode("edit");
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
                                        <div className="h-4 w-[1px] bg-slate-200 mx-1" />
                                        <Select
                                            value={task.status}
                                            onValueChange={(value) => handleStatusChange(task, value)}
                                        >
                                            <SelectTrigger className="w-[110px] h-8 text-[10px] font-bold uppercase tracking-wider bg-white border-slate-200 rounded-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                {STATUS_OPTIONS.map((status) => (
                                                    <SelectItem key={status.value} value={status.value} className="text-xs font-semibold">
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-full ml-1"
                                            onClick={() => deleteMutation.mutate(task.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 bg-white/50 rounded-[2.5rem] border border-dashed border-sage-200">
                                <div className="h-16 w-16 bg-sage-50 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="h-8 w-8 text-sage-300" />
                                </div>
                                <h4 className="text-lg font-serif italic text-slate-700 mb-1">No tasks found</h4>
                                <p className="text-sm text-slate-500">You're all caught up in this category.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs >

            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                if (!open) resetForm();
                setIsAddDialogOpen(open);
            }}>
                <DialogContent className="w-full max-w-[85vw] lg:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem]">
                    <DialogHeader className="p-8 pb-6 border-b border-sage-100/50 bg-sage-50/50">
                        <DialogTitle className="text-2xl font-serif italic text-slate-800 flex items-center gap-3">
                            {modalMode === "view" ? (
                                <div className="p-2 bg-sage-100 text-sage-700 rounded-full">
                                    <Eye className="h-5 w-5" />
                                </div>
                            ) : modalMode === "edit" ? (
                                <div className="p-2 bg-blue-100 text-blue-700 rounded-full">
                                    <Pencil className="h-5 w-5" />
                                </div>
                            ) : (
                                <div className="p-2 bg-sage-600 text-white rounded-full">
                                    <Plus className="h-5 w-5" />
                                </div>
                            )}
                            {modalMode === "view" ? "Task Details" : modalMode === "edit" ? "Edit Task" : "Add New Task"}
                        </DialogTitle>
                        <p className="text-sm text-slate-500 mt-2 font-medium">
                            {modalMode === "view" ? "Intelligence summary and logistics for this task" : "Break down your wedding planning into actionable steps"}
                        </p>
                    </DialogHeader>

                    <div className="p-0 overflow-y-auto max-h-[70vh] bg-white">
                        {modalMode === "view" ? (
                            <div className="animate-in fade-in duration-500">
                                {isTaskDetailLoading && !selectedTaskId ? (
                                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                        <Loader2 className="h-10 w-10 animate-spin text-sage-600" />
                                        <p className="text-slate-500 animate-pulse font-serif italic">Loading task intelligence...</p>
                                    </div>
                                ) : (
                                    (() => {
                                        const displayTask = taskDetail || tasks?.find(t => t.id === selectedTaskId) || selectedTask;
                                        if (!displayTask) return (
                                            <div className="py-20 text-center text-slate-400 font-serif italic">Task not found</div>
                                        );

                                        return (
                                            <div className="flex flex-col md:flex-row">
                                                {/* Left Column: Task Context */}
                                                <div className="flex-1 p-8 space-y-8 border-r border-sage-100/50">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            {getPriorityBadge(displayTask?.priority)}
                                                            {getStatusBadge(displayTask?.status)}
                                                        </div>
                                                        <h1 className="text-3xl font-serif italic text-slate-800 leading-tight">
                                                            {displayTask?.title}
                                                        </h1>
                                                        <div className="h-1 w-20 bg-sage-200 rounded-full" />
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage-600 flex items-center gap-2">
                                                            <FileText className="h-3 w-3" />
                                                            Description & Scope
                                                        </h4>
                                                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                            {displayTask?.description || "Detailed scope has not been defined for this task yet. Please update the task to include specific requirements or notes."}
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-6 pt-4">
                                                        <div className="p-5 rounded-2xl bg-sage-50 border border-sage-100 space-y-3">
                                                            <div className="flex items-center gap-2 text-sage-700">
                                                                <Wallet className="h-4 w-4" />
                                                                <span className="text-[10px] font-bold uppercase tracking-wider">Budget Allocation</span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-xl font-bold text-slate-800">
                                                                    {displayTask?.amount ? `RWF ${displayTask?.amount.toLocaleString()}` : "Unallocated"}
                                                                </p>
                                                                <p className="text-xs text-slate-500 truncate">
                                                                    {budgetCategories?.find(c => c.id === displayTask?.budget_category_id)?.category_name || "General Planning"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                                                            <div className="flex items-center gap-2 text-slate-600">
                                                                <Users className="h-4 w-4" />
                                                                <span className="text-[10px] font-bold uppercase tracking-wider">Ownership</span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-xl font-bold text-slate-800 capitalize">
                                                                    {displayTask?.assigned_to || "Shared"}
                                                                </p>
                                                                <p className="text-xs text-slate-500">Primary Coordinator</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Sidebar: Timeline & Logistics */}
                                                <div className="w-full md:w-[320px] bg-slate-50 p-8 space-y-8">
                                                    <div className="space-y-6">
                                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Logistics & Timeline</h4>

                                                        <div className="space-y-6">
                                                            <div className="flex gap-4">
                                                                <div className="h-10 w-10 shrink-0 rounded-2xl bg-white flex items-center justify-center text-sage-600 shadow-sm border border-sage-100/50">
                                                                    <Calendar className="h-5 w-5" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Planning Phase</p>
                                                                    <p className="text-sm font-semibold text-slate-800">
                                                                        {displayTask?.start_date ? formatDate(displayTask?.start_date) : "Immediate"}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-4">
                                                                <div className="h-10 w-10 shrink-0 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-sm border border-rose-100/50">
                                                                    <ArrowRightCircle className="h-5 w-5" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Deadline</p>
                                                                    <p className="text-sm font-semibold text-slate-800">
                                                                        {displayTask?.end_date ? formatDate(displayTask?.end_date) : "Ongoing"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pt-8 border-t border-slate-200/60 space-y-4">
                                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Task Progress</h4>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-end mb-1">
                                                                <span className="text-xs font-semibold text-slate-500">Current State</span>
                                                                <span className="text-xs font-bold text-sage-700 capitalize">{displayTask?.status?.replace('_', ' ')}</span>
                                                            </div>
                                                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all duration-1000 ${displayTask?.status === 'completed' ? 'bg-emerald-500' :
                                                                        displayTask?.status === 'in_progress' ? 'bg-sage-500' : 'bg-slate-400'
                                                                        }`}
                                                                    style={{ width: displayTask?.status === 'completed' ? '100%' : displayTask?.status === 'in_progress' ? '50%' : '10%' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pt-8 space-y-3">
                                                        <Button
                                                            variant="outline"
                                                            className="w-full justify-start gap-2 h-11 rounded-full bg-white border-sage-200 text-sage-700 hover:bg-sage-50 hover:text-sage-800 transition-all font-semibold"
                                                            onClick={resetForm}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            Mark as Acknowledged
                                                        </Button>
                                                        {!displayTask?.is_completed && (
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start gap-2 h-11 rounded-full hover:bg-slate-100 text-slate-600 transition-all font-semibold"
                                                                onClick={() => {
                                                                    setSelectedTask(displayTask);
                                                                    setModalMode("edit");
                                                                    setTitle(displayTask?.title || "");
                                                                    setDescription(displayTask?.description || "");
                                                                    setBudgetCategoryId(displayTask?.budget_category_id || "");
                                                                    setAssignedTo(displayTask?.assigned_to || "");
                                                                    setStartDate(displayTask?.start_date || "");
                                                                    setEndDate(displayTask?.end_date || "");
                                                                    setPriority(displayTask?.priority || "");
                                                                    setAmount(displayTask?.amount?.toString() || "");
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
                                        <Label htmlFor="title" className="flex items-center gap-2 font-bold text-slate-700">
                                            <Layout className="h-4 w-4 text-sage-600" />
                                            Task Title <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g., Book the venue"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="h-12 text-base rounded-2xl transition-all focus:ring-2 focus:ring-sage-200 border-slate-200"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description" className="flex items-center gap-2 font-bold text-slate-700">
                                            <FileText className="h-4 w-4 text-sage-600" />
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Additional details about this task..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            className="resize-none rounded-2xl transition-all focus:ring-2 focus:ring-sage-200 border-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100" />

                                {/* Budget & Category Segment */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-sage-50/50 rounded-[2rem] border border-sage-100">
                                    <div className="grid gap-2">
                                        <Label htmlFor="category" className="flex items-center gap-2 font-bold text-sage-800">
                                            <LayoutGrid className="h-4 w-4" />
                                            Budget Category <span className="text-rose-500">*</span>
                                        </Label>
                                        <Select
                                            value={budgetCategoryId}
                                            onValueChange={setBudgetCategoryId}
                                        >
                                            <SelectTrigger className="bg-white border-sage-200/60 rounded-xl h-12">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                {budgetCategories?.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold">{cat.category_name}</span>
                                                            <span className="text-[10px] text-slate-500 italic">
                                                                Allocated: RWF {cat.allocated_amount.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="amount" className="flex items-center gap-2 font-bold text-sage-800">
                                            <Wallet className="h-4 w-4" />
                                            Budget Amount
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">RWF</span>
                                            <Input
                                                id="amount"
                                                type="number"
                                                placeholder="0"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="pl-14 h-12 rounded-xl bg-white border-sage-200/60 transition-all focus:ring-2 focus:ring-sage-200"
                                                min="0"
                                                step="1000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Logistic Segment */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-slate-200/60 p-6 rounded-[2rem] bg-slate-50/50">
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="assigned" className="flex items-center gap-2 font-bold text-slate-700">
                                                <Users className="h-4 w-4 text-indigo-500" />
                                                Assign To
                                            </Label>
                                            <Select
                                                value={assignedTo}
                                                onValueChange={setAssignedTo}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200">
                                                    <SelectValue placeholder="Select assignment" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl">
                                                    {ASSIGNMENT_OPTIONS.map((option) => {
                                                        const Icon = option.icon;
                                                        return (
                                                            <SelectItem key={option.value} value={option.value} className="font-medium">
                                                                <div className="flex items-center">
                                                                    <Icon className="h-4 w-4 mr-2 text-slate-400" />
                                                                    {option.label}
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="priority" className="flex items-center gap-2 font-bold text-slate-700">
                                                <Flag className="h-4 w-4 text-amber-500" />
                                                Priority Level
                                            </Label>
                                            <Select
                                                value={priority}
                                                onValueChange={setPriority}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200">
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl">
                                                    {PRIORITY_OPTIONS.map((option) => (
                                                        <SelectItem key={option.value} value={option.value} className="font-medium">
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
                                            <Label htmlFor="start-date" className="flex items-center gap-2 font-bold text-slate-700">
                                                <Calendar className="h-4 w-4 text-sage-500" />
                                                Start Date
                                            </Label>
                                            <Input
                                                id="start-date"
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                min={today}
                                                max={weddingEve}
                                                className="h-12 text-sm rounded-xl bg-white border-slate-200 transition-all focus:ring-2 focus:ring-sage-200"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="end-date" className="flex items-center gap-2 font-bold text-slate-700">
                                                <Calendar className="h-4 w-4 text-rose-400" />
                                                Target End Date
                                            </Label>
                                            <Input
                                                id="end-date"
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                min={today}
                                                max={weddingEve}
                                                className="h-12 text-sm rounded-xl bg-white border-slate-200 transition-all focus:ring-2 focus:ring-sage-200"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 gap-3 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={resetForm}
                            className="hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors rounded-full font-semibold px-6"
                        >
                            {modalMode === "view" ? "Close" : "Discard"}
                        </Button>
                        {modalMode !== "view" && (
                            <Button
                                onClick={handleCreate}
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="bg-primary hover:bg-primary/90 text-white shadow-lg px-8 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-full font-semibold"
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
