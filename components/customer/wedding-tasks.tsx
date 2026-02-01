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
import { apiClient, API_ENDPOINTS, WeddingTask } from "@/lib/api";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";



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
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState<string>("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [priority, setPriority] = useState("");
    const [amount, setAmount] = useState("");
    const [activeTab, setActiveTab] = useState("all");

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

    const { data: tasks, isLoading, error } = useQuery({
        queryKey: ["wedding-tasks"],
        queryFn: async () => {
            const response = await apiClient.get<WeddingTask[]>(API_ENDPOINTS.WEDDING.TASKS);
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
        setAssignedTo("");
        setStartDate("");
        setEndDate("");
        setPriority("");
        setAmount("");
    };

    const handleCreate = () => {
        if (!title.trim()) return;
        createMutation.mutate({ 
            title, 
            description: description || null,
            assigned_to: assignedTo || null,
            start_date: startDate || null,
            end_date: endDate || null,
            priority: priority || null,
            amount: amount ? parseFloat(amount) : null
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
    if (!weddingResponse) {
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
                    <h2 className="text-2xl font-bold">Wedding Checklist</h2>
                    <p className="text-muted-foreground">
                        {weddingResponse?.couple_name ? 
                            `Planning for ${weddingResponse.couple_name}` : 
                            "Manage your path to the big day"
                        }
                    </p>
                    {weddingResponse?.wedding_date && (
                        <p className="text-sm text-primary font-medium mt-1">
                            Wedding Date: {new Date(weddingResponse.wedding_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    )}
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Planning Progress</CardTitle>
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-2">
                        <div
                            className="bg-primary h-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {totalBudget > 0 && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <div className="text-sm">
                                <span className="text-muted-foreground">Total Budget: </span>
                                <span className="font-medium">RWF {totalBudget.toLocaleString()}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Completed: </span>
                                <span className="font-medium">RWF {completedBudget.toLocaleString()}</span>
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
                                            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group border-b last:border-0"
                                        >
                                            <div className="flex items-center space-x-3 flex-1">
                                                <Checkbox
                                                className="border-2 border-gray-950"
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
                                <Label htmlFor="start-date">Start Date</Label>
                                <Input
                                    id="start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end-date">End Date</Label>
                                <Input
                                    id="end-date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
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
