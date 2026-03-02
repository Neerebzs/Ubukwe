"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronRight } from "lucide-react"
import { ReactNode } from "react"

interface Category {
    value: string
    label: string
    icon: ReactNode
    description?: string
}

interface CategorySidebarProps {
    categories: Category[]
    selectedCategory: string
    onCategoryChange: (category: string) => void
    counts?: Record<string, number>
    className?: string
}

export function CategorySidebar({
    categories,
    selectedCategory,
    onCategoryChange,
    counts = {},
    className
}: CategorySidebarProps) {
    return (
        <aside className={cn("flex flex-col h-full", className)}>
            <div className="flex-1">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
                    Categories
                </h3>
                <div className="space-y-1">
                    {categories.map((category) => {
                        const isActive = selectedCategory === category.value
                        const count = counts[category.value] || 0

                        return (
                            <button
                                key={category.value}
                                onClick={() => onCategoryChange(category.value)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                                        : "hover:bg-primary/5 text-muted-foreground hover:text-primary"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        isActive ? "bg-white/20" : "bg-muted group-hover:bg-primary/10"
                                    )}>
                                        {category.icon}
                                    </div>
                                    <span className="font-medium text-sm">{category.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {category.value !== "all" && count > 0 && (
                                        <Badge
                                            variant={isActive ? "secondary" : "outline"}
                                            className={cn(
                                                "text-[10px] px-1.5 h-5 min-w-[20px] flex items-center justify-center rounded-full",
                                                !isActive && "border-primary/20 text-primary"
                                            )}
                                        >
                                            {count}
                                        </Badge>
                                    )}
                                    <ChevronRight className={cn(
                                        "w-4 h-4 transition-transform duration-200",
                                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40 group-hover:translate-x-0.5"
                                    )} />
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Trust Badge / Filters Placeholder */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Quick Tip
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Filter by category to find specialized vendors for your Rwandan wedding traditions.
                </p>
            </div>
        </aside>
    )
}
