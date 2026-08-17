"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function PageCanvas({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("pt-5 sm:pt-6", className)}>
      {children}
    </div>
  )
}

export function SectionHead({
  title,
  hint,
  actions,
}: {
  title: string
  hint?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between mb-4">
      <div className="min-w-0">
        <h2 className="font-serif text-xl font-medium tracking-tight text-[#0d182b] dark:text-white leading-snug">{title}</h2>
        {hint && <p className="text-sm text-[#6b7368] dark:text-slate-400 mt-1 leading-relaxed max-w-2xl">{hint}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:justify-end shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}

export function DataTable({
  children,
  minWidth = "640px",
  maxHeight,
  className,
}: {
  children: React.ReactNode
  minWidth?: string
  maxHeight?: string
  className?: string
}) {
  return (
    <div
      className={cn("overflow-x-auto overscroll-x-contain", maxHeight && "overflow-y-auto", className)}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full text-sm" style={{ minWidth }}>
        {children}
      </table>
    </div>
  )
}

export function Th({
  children,
  className,
  align = "left",
}: {
  children?: React.ReactNode
  className?: string
  align?: "left" | "right"
}) {
  return (
    <th
      className={cn(
        "px-3 py-3 text-[11px] uppercase tracking-[0.14em] text-[#8a9184] font-medium whitespace-nowrap leading-none",
        align === "right" ? "text-right" : "text-left",
        className
      )}
    >
      {children}
    </th>
  )
}

export function Td({
  children,
  className,
  align = "left",
  colSpan,
}: {
  children?: React.ReactNode
  className?: string
  align?: "left" | "right"
  colSpan?: number
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        "px-3 py-3 align-middle",
        align === "right" ? "text-right" : "text-left",
        className
      )}
    >
      {children}
    </td>
  )
}

export function THead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <thead className={cn("sticky top-0 z-10 bg-[#fcfbf9] dark:bg-background", className)}>
      <tr className="border-b border-[#e6e1d6] dark:border-border">{children}</tr>
    </thead>
  )
}

export function TablePager({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number
  pageSize: number
  total: number
  onPage: (page: number) => void
}) {
  const pages = Math.max(1, Math.ceil((total || 0) / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  if (!total) return null
  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[#6b7368] tabular-nums leading-none">
        {from}–{to} of {total}
      </p>
      {pages > 1 && (
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            className="h-8 px-3 text-sm text-[#0d182b] dark:text-slate-300"
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={page >= pages}
            onClick={() => onPage(page + 1)}
            className="h-8 px-3 text-sm text-[#0d182b] dark:text-slate-300"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export function TBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y divide-[#eeeae1] dark:divide-border [&_tr]:transition-colors [&_tr:hover]:bg-[#f4f1ea] dark:[&_tr:hover]:bg-slate-900/40">
      {children}
    </tbody>
  )
}

export function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-0 py-10 text-center text-sm text-[#6b7368] leading-relaxed">
        {text}
      </td>
    </tr>
  )
}

export function QuietStatus({ status }: { status?: string }) {
  const value = (status || "—").replace(/_/g, " ")
  return <span className="text-xs capitalize text-[#6b7368] leading-none">{value}</span>
}
