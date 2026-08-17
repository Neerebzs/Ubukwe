"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  Mail,
  Quote,
  Clock,
  CheckCircle,
  Loader2,
  User,
  RefreshCw,
  Star,
  Globe,
  GlobeLock,
  XCircle,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Testimonial {
  id: string
  author_name: string
  author_email: string
  message: string
  author_role: string | null
  wedding_date: string | null
  rating: number | null
  status: "pending" | "published" | "rejected"
  published_at: string | null
  created_at: string
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  published: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-slate-100 text-slate-600 border-slate-200",
}

function formatWeddingDate(value: string | null) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
        />
      ))}
    </div>
  )
}

export function AdminTestimonials() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Testimonial | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")

  const { data: testimonials = [], isLoading, refetch } = useQuery<Testimonial[]>({
    queryKey: ["admin-testimonials", statusFilter],
    queryFn: async () => {
      const params = statusFilter !== "all" ? { status: statusFilter } : {}
      const res = await axiosInstance.get(`/api/v1/admin/testimonials`, { params })
      const data = res.data as any
      return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    },
    refetchInterval: 30_000,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] })
    queryClient.invalidateQueries({ queryKey: ["published-testimonials"] })
  }

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.post(`/api/v1/admin/testimonials/${id}/publish`)
    },
    onSuccess: () => {
      toast.success("Testimonial published on the homepage")
      setSelected(null)
      invalidate()
    },
    onError: (error: any) => toast.error(error?.response?.data?.detail || "Failed to publish"),
  })

  const unpublishMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.post(`/api/v1/admin/testimonials/${id}/unpublish`)
    },
    onSuccess: () => {
      toast.success("Removed from homepage")
      setSelected(null)
      invalidate()
    },
    onError: () => toast.error("Failed to unpublish"),
  })

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.post(`/api/v1/admin/testimonials/${id}/reject`)
    },
    onSuccess: () => {
      toast.success("Testimonial rejected")
      setSelected(null)
      invalidate()
    },
    onError: () => toast.error("Failed to reject"),
  })

  const pendingCount = testimonials.filter((t) => t.status === "pending").length
  const publishedCount = testimonials.filter((t) => t.status === "published").length
  const actionPending = publishMutation.isPending || unpublishMutation.isPending || rejectMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Testimonials</h2>
          <p className="text-slate-500 text-sm mt-1">
            {pendingCount > 0 ? (
              <span className="text-amber-600 font-medium">
                {pendingCount} awaiting review
              </span>
            ) : (
              "Review submissions and publish stories to the homepage"
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-10 rounded-xl border-slate-200">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Pending", value: pendingCount, color: "text-amber-600" },
          { label: "On Homepage", value: publishedCount, color: "text-green-600" },
          { label: "Rejected", value: testimonials.filter((t) => t.status === "rejected").length, color: "text-slate-500" },
          { label: "Total", value: testimonials.length, color: "text-slate-700" },
        ].map((stat) => (
          <Card key={stat.label} className="border-slate-100 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl w-full" />
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Quote className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No testimonials yet</p>
          <p className="text-slate-400 text-sm mt-1">Stories submitted from the homepage widget will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((item) => (
            <Card
              key={item.id}
              className="border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelected(item)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-[10px] font-bold uppercase tracking-wider border ${statusColors[item.status]}`}>
                        {item.status === "published" ? "On homepage" : item.status}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-mono">#{item.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 truncate">{item.author_name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-0.5 italic">“{item.message}”</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Mail className="h-3 w-3" />
                        {item.author_email}
                      </span>
                      {item.rating ? <StarRow rating={item.rating} /> : null}
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {item.status === "published" && (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selected?.author_name}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{selected.author_name}</span>
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{selected.author_email}</span>
                <Badge className={`text-[10px] border ${statusColors[selected.status]}`}>
                  {selected.status === "published" ? "On homepage" : selected.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                {selected.author_role && <span>{selected.author_role}</span>}
                {formatWeddingDate(selected.wedding_date) && (
                  <span>Wedding {formatWeddingDate(selected.wedding_date)}</span>
                )}
                {selected.rating ? <StarRow rating={selected.rating} /> : null}
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Testimony</p>
                <p className="text-slate-700 text-sm leading-relaxed italic">“{selected.message}”</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setSelected(null)} className="rounded-xl">
              Close
            </Button>
            {selected?.status !== "rejected" && (
              <Button
                variant="outline"
                onClick={() => selected && rejectMutation.mutate(selected.id)}
                disabled={actionPending}
                className="rounded-xl text-slate-600"
              >
                {rejectMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Reject
              </Button>
            )}
            {selected?.status === "published" ? (
              <Button
                onClick={() => selected && unpublishMutation.mutate(selected.id)}
                disabled={actionPending}
                className="rounded-xl bg-slate-900 hover:bg-slate-800"
              >
                {unpublishMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
                ) : (
                  <><GlobeLock className="mr-2 h-4 w-4" />Remove from homepage</>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => selected && publishMutation.mutate(selected.id)}
                disabled={actionPending}
                className="rounded-xl bg-[#608d64] hover:bg-[#527a56] text-white"
              >
                {publishMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing...</>
                ) : (
                  <><Globe className="mr-2 h-4 w-4" />Publish to homepage</>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
