"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import {
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Palette,
    Tag,
    Database,
    Users,
    Music,
    Utensils,
    MapPin,
    Mic,
    Sparkles,
    Search,
    Layers
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { StatCard } from "./stat-card"
import { Skeleton } from "@/components/ui/skeleton"

// Types
interface Category {
    id: string
    name: string
    slug: string
    description?: string
    icon?: string
    color?: string
    is_active: boolean
    display_order: number
    created_at?: string
    updated_at?: string
}

interface CategoryFormData {
    name: string
    description: string
    icon: string
    color: string
    is_active: boolean
    display_order: number
}

// API functions for categories
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const categoryAPI = {
    getAll: async (): Promise<Category[]> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/categories`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) throw new Error('Failed to fetch categories')
        const data = await response.json()
        return data.data
    },

    create: async (data: Omit<CategoryFormData, 'display_order'>): Promise<Category> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/categories`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        if (!response.ok) throw new Error('Failed to create category')
        const result = await response.json()
        return result.data
    },

    update: async (id: string, data: Partial<CategoryFormData>): Promise<Category> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        if (!response.ok) throw new Error('Failed to update category')
        const result = await response.json()
        return result.data
    },

    delete: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/categories/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) throw new Error('Failed to delete category')
    },

    toggle: async (id: string): Promise<Category> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/categories/${id}/toggle`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) throw new Error('Failed to toggle category status')
        const result = await response.json()
        return result.data
    },

    seedDefaults: async (): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/categories/seed`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) throw new Error('Failed to seed default categories')
    }
}

const iconOptions = [
    { value: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { value: "music", label: "Music", icon: <Music className="h-4 w-4" /> },
    { value: "utensils", label: "Utensils", icon: <Utensils className="h-4 w-4" /> },
    { value: "map-pin", label: "Map Pin", icon: <MapPin className="h-4 w-4" /> },
    { value: "mic", label: "Microphone", icon: <Mic className="h-4 w-4" /> },
    { value: "palette", label: "Palette", icon: <Palette className="h-4 w-4" /> },
    { value: "sparkles", label: "Sparkles", icon: <Sparkles className="h-4 w-4" /> },
    { value: "tag", label: "Tag", icon: <Tag className="h-4 w-4" /> },
]

const colorOptions = [
    "#608d64", "#0d182b", "#8B5CF6", "#06B6D4", "#10B981", "#6366F1", "#F59E0B", "#EF4444",
    "#EC4899", "#8B5A2B"
]

export function CategoriesManagement() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [formData, setFormData] = useState<CategoryFormData>({
        name: "",
        description: "",
        icon: "tag",
        color: "#608d64",
        is_active: true,
        display_order: 0
    })

    const queryClient = useQueryClient()

    // Queries
    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: categoryAPI.getAll
    })

    // Mutations
    const createMutation = useMutation({
        mutationFn: categoryAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
            setIsCreateDialogOpen(false)
            resetForm()
            toast.success("Artisanal classification established")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create category")
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<CategoryFormData> }) =>
            categoryAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
            setIsEditDialogOpen(false)
            setEditingCategory(null)
            resetForm()
            toast.success("Classification refined successfully")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update category")
        }
    })

    const deleteMutation = useMutation({
        mutationFn: categoryAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
            toast.success("Classification removed from records")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete category")
        }
    })

    const toggleMutation = useMutation({
        mutationFn: categoryAPI.toggle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
            toast.success("Classification visibility adjusted")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update category status")
        }
    })

    const seedMutation = useMutation({
        mutationFn: categoryAPI.seedDefaults,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
            toast.success("Standard taxonomies seeded")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to seed default categories")
        }
    })

    // Handlers
    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            icon: "tag",
            color: "#608d64",
            is_active: true,
            display_order: 0
        })
    }

    const handleCreate = () => {
        createMutation.mutate(formData)
    }

    const handleEdit = (category: Category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            description: category.description || "",
            icon: category.icon || "tag",
            color: category.color || "#608d64",
            is_active: category.is_active,
            display_order: category.display_order
        })
        setIsEditDialogOpen(true)
    }

    const handleUpdate = () => {
        if (!editingCategory) return
        updateMutation.mutate({ id: editingCategory.id, data: formData })
    }

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id)
    }

    const handleToggle = (id: string) => {
        toggleMutation.mutate(id)
    }

    const handleSeedDefaults = () => {
        seedMutation.mutate()
    }

    const getIconComponent = (iconName: string) => {
        const iconOption = iconOptions.find(opt => opt.value === iconName)
        return iconOption?.icon || <Tag className="h-4 w-4" />
    }

    const stats = {
        total: categories.length,
        active: categories.filter(c => c.is_active).length,
        inactive: categories.filter(c => !c.is_active).length
    }

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-10">
            {/* Editorial Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
                <div className="space-y-1">
                    <h1 className="text-4xl font-serif italic text-slate-900 tracking-tight">Artisanal Taxonomy</h1>
                    <div className="flex items-center gap-2">
                        <div className="h-[1px] w-8 bg-[#608d64]/60" />
                        <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">Defining the Directory Structure</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-600 group-focus-within:text-[#608d64] transition-colors" />
                        </div>
                        <Input
                            placeholder="Search classifications..."
                            className="pl-12 pr-4 h-14 w-full md:w-[280px] bg-white border-slate-100 rounded-2xl focus-visible:ring-1 focus-visible:ring-[#608d64] focus-visible:border-[#608d64] shadow-none transition-all duration-300 placeholder:text-slate-500 placeholder:font-light"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleSeedDefaults}
                        disabled={seedMutation.isPending}
                        className="h-14 px-5 rounded-2xl border-slate-100 text-slate-600 hover:border-[#608d64] hover:text-[#608d64] transition-all"
                    >
                        <Database className="w-4 h-4" />
                    </Button>
                    <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="h-14 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-all duration-300 flex items-center gap-2 border-none"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-[11px] font-black uppercase tracking-widest">New Class</span>
                    </Button>
                </div>
            </div>

            {/* Taxonomy Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <StatCard label="Total Categories" value={stats.total} />
                <StatCard label="Active Classes" value={stats.active} color="text-[#608d64]" />
                <StatCard label="Archived Classes" value={stats.inactive} color="text-amber-600" />
            </div>

            {/* Categories Canvas */}
            <Card className="border-slate-100 bg-white shadow-none rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-50">
                                <TableHead className="h-16 px-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">Classification</TableHead>
                                <TableHead className="h-16 px-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">Manifesto</TableHead>
                                <TableHead className="h-16 px-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">Visibility</TableHead>
                                <TableHead className="h-16 px-8 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={4} className="p-8">
                                        <div className="space-y-6 animate-in fade-in duration-700">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Skeleton key={i} className="h-20 rounded-2xl w-full" />
                                            ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <Layers className="w-12 h-12 text-slate-100" />
                                            <h3 className="text-xl font-serif italic text-slate-600">No definitions found</h3>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCategories.map((category) => (
                                    <TableRow key={category.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                                        <TableCell className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-12 h-12 rounded-[1rem] flex items-center justify-center text-white shadow-lg"
                                                    style={{ backgroundColor: category.color || '#608d64' }}
                                                >
                                                    {getIconComponent(category.icon || 'tag')}
                                                </div>
                                                <div>
                                                    <div className="text-lg font-serif italic text-slate-900 leading-tight group-hover:text-[#608d64] transition-colors">{category.name}</div>
                                                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">/{category.slug}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-8 py-6">
                                            <div className="max-w-[300px] text-sm text-slate-600 font-light italic truncate">
                                                {category.description || "No narrative established"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-8 py-6">
                                            <Badge className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none ${category.is_active ? 'bg-[#608d64]/10 text-[#608d64]' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {category.is_active ? "Live" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggle(category.id)}
                                                    className="h-9 w-9 p-0 rounded-xl border-slate-100 text-slate-600 hover:border-[#608d64] hover:text-[#608d64] transition-all"
                                                >
                                                    {category.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(category)}
                                                    className="h-9 w-9 p-0 rounded-xl border-slate-100 text-slate-600 hover:border-[#608d64] hover:text-[#608d64] transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-9 w-9 p-0 rounded-xl border-rose-50 text-rose-300 hover:bg-rose-50 hover:text-rose-500 transition-all border-none"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8 bg-white text-slate-900">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-2xl font-serif italic">Erase Classification?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-slate-500 font-light">
                                                                This will remove "{category.name}" from the taxonomy records permanently.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter className="pt-4">
                                                            <AlertDialogCancel className="rounded-2xl border-slate-100 text-[10px] font-black uppercase tracking-widest h-12 text-slate-700">Retreat</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(category.id)}
                                                                className="rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest h-12 shadow-lg shadow-rose-600/20 border-none"
                                                            >
                                                                Confirm Erasure
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Sanctuary Modals (Create & Edit) */}
            <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
                if (!open) {
                    setIsCreateDialogOpen(false)
                    setIsEditDialogOpen(false)
                    setEditingCategory(null)
                    resetForm()
                }
            }}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl bg-white">
                    <div className="p-10 space-y-8 text-slate-900">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-serif italic text-slate-900 leading-tight">
                                {isEditDialogOpen ? "Refine Class" : "Define Class"}
                            </h2>
                            <p className="text-[10px] font-black text-[#608d64] uppercase tracking-widest">
                                {isEditDialogOpen ? "Adjusting the taxonomy definition" : "Adding a new classification to the archives"}
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Class Designation</Label>
                                <Input
                                    placeholder="e.g., Traditional Troupe"
                                    className="h-14 rounded-2xl border-slate-100 focus-visible:ring-1 focus-visible:ring-[#608d64] focus-visible:border-[#608d64] px-5"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Class Manifesto</Label>
                                <Textarea
                                    placeholder="Define the scope of this classification..."
                                    className="min-h-[120px] rounded-2xl border-slate-100 focus-visible:ring-1 focus-visible:ring-[#608d64] focus-visible:border-[#608d64] resize-none p-5"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Aesthetic Icon</Label>
                                    <select
                                        value={formData.icon}
                                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                                        className="w-full h-14 rounded-2xl border border-slate-100 bg-white px-5 text-sm ring-offset-background focus:ring-1 focus:ring-[#608d64] focus:outline-none"
                                    >
                                        {iconOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Botanical Hue</Label>
                                    <div className="flex gap-2 flex-wrap pt-1">
                                        {colorOptions.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${formData.color === color ? 'border-slate-900 scale-110' : 'border-transparent'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setFormData(prev => ({ ...prev, color }))}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all">
                                <div className="space-y-0.5">
                                    <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">Live Status</Label>
                                    <p className="text-[10px] text-slate-600 font-light italic">Visible to the public eye</p>
                                </div>
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                                    className="data-[state=checked]:bg-[#608d64]"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => { setIsCreateDialogOpen(false); setIsEditDialogOpen(false); }}
                                className="flex-1 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest border-slate-100 text-slate-700 hover:bg-slate-50 transition-all font-sans"
                            >
                                Abandon
                            </Button>
                            <Button
                                onClick={isEditDialogOpen ? handleUpdate : handleCreate}
                                disabled={createMutation.isPending || updateMutation.isPending || !formData.name}
                                className="flex-1 h-12 rounded-2xl bg-[#608d64] hover:bg-[#4a6e4d] text-white font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-[#608d64]/20 border-none transition-all font-sans"
                            >
                                {isEditDialogOpen ? "Commit Changes" : "Record Class"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
