"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
    ArrowUp, 
    ArrowDown,
    Palette,
    Tag,
    Settings,
    Database,
    TrendingUp,
    Users,
    Music,
    Utensils,
    MapPin,
    Mic,
    Sparkles
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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
    
    reorder: async (categories: Array<{id: string, display_order: number}>): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/categories/reorder`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ categories })
        })
        if (!response.ok) throw new Error('Failed to reorder categories')
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
    "#8B5CF6", "#06B6D4", "#10B981", "#6366F1", "#F59E0B", "#EF4444",
    "#EC4899", "#8B5A2B", "#6B7280", "#1F2937"
]

export function CategoriesManagement() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [formData, setFormData] = useState<CategoryFormData>({
        name: "",
        description: "",
        icon: "tag",
        color: "#8B5CF6",
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
            toast.success("Category created successfully")
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
            toast.success("Category updated successfully")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update category")
        }
    })

    const deleteMutation = useMutation({
        mutationFn: categoryAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
            toast.success("Category deleted successfully")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete category")
        }
    })

    const toggleMutation = useMutation({
        mutationFn: categoryAPI.toggle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
            toast.success("Category status updated")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update category status")
        }
    })

    const seedMutation = useMutation({
        mutationFn: categoryAPI.seedDefaults,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
            toast.success("Default categories created successfully")
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
            color: "#8B5CF6",
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
            color: category.color || "#8B5CF6",
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Service Categories</h2>
                    <p className="text-muted-foreground">
                        Manage service categories for your platform
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        onClick={handleSeedDefaults}
                        disabled={seedMutation.isPending}
                    >
                        <Database className="h-4 w-4 mr-2" />
                        Seed Defaults
                    </Button>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Category</DialogTitle>
                                <DialogDescription>
                                    Add a new service category to organize your services.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Category Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., Traditional Troupe"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Brief description of this category"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="icon">Icon</Label>
                                        <select
                                            id="icon"
                                            value={formData.icon}
                                            onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                        >
                                            {iconOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="color">Color</Label>
                                        <div className="flex gap-2 flex-wrap">
                                            {colorOptions.map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    className={`w-8 h-8 rounded-full border-2 ${
                                                        formData.color === color ? 'border-gray-900' : 'border-gray-300'
                                                    }`}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                                    />
                                    <Label htmlFor="is_active">Active</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                                    {createMutation.isPending ? "Creating..." : "Create Category"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive Categories</CardTitle>
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Categories Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>
                        Manage your service categories and their display order.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Loading categories...</p>
                            </div>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Categories Found</h3>
                            <p className="text-muted-foreground mb-4">
                                Get started by creating your first category or seeding default categories.
                            </p>
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={handleSeedDefaults}
                                    disabled={seedMutation.isPending}
                                >
                                    <Database className="h-4 w-4 mr-2" />
                                    Seed Defaults
                                </Button>
                                <Button onClick={() => setIsCreateDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Category
                                </Button>
                            </div>
                        </div>
                    ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                                                style={{ backgroundColor: category.color }}
                                            >
                                                {getIconComponent(category.icon || 'tag')}
                                            </div>
                                            <div>
                                                <div className="font-medium">{category.name}</div>
                                                <div className="text-sm text-muted-foreground">{category.slug}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[200px] truncate">
                                            {category.description || "No description"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={category.is_active ? "default" : "secondary"}>
                                            {category.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{category.display_order}</TableCell>
                                    <TableCell>
                                        {category.created_at ? new Date(category.created_at).toLocaleDateString() : "N/A"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleEdit(category)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleToggle(category.id)}>
                                                    {category.is_active ? (
                                                        <>
                                                            <EyeOff className="h-4 w-4 mr-2" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Activate
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{category.name}"? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(category.id)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update the category information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Category Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Traditional Troupe"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Brief description of this category"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-icon">Icon</Label>
                                <select
                                    id="edit-icon"
                                    value={formData.icon}
                                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                >
                                    {iconOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-color">Color</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {colorOptions.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`w-8 h-8 rounded-full border-2 ${
                                                formData.color === color ? 'border-gray-900' : 'border-gray-300'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-order">Display Order</Label>
                            <Input
                                id="edit-order"
                                type="number"
                                value={formData.display_order}
                                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                                min="0"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="edit-is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                            />
                            <Label htmlFor="edit-is_active">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? "Updating..." : "Update Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}