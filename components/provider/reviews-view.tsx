"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MessageSquare, Sparkles, Heart, Pin, Share2, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { toast } from "sonner"

export function ProviderReviewsView() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeFilter, setActiveFilter] = useState<"all" | "testimonials">("all")

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["provider-reviews", user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      // Get reviews received by this provider (client_to_provider)
      const response = await apiClient.reviews.getByUser(
        user.id,
        "client_to_provider"
      )
      const data = response.data as any
      return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    },
    enabled: !!user?.id,
  })

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({
      reviewId,
      isFeatured,
    }: {
      reviewId: string
      isFeatured: boolean
    }) => {
      return apiClient.reviews.toggleFeatured(reviewId, isFeatured)
    },
    onSuccess: (_, { isFeatured }) => {
      queryClient.invalidateQueries({ queryKey: ["provider-reviews"] })
      toast.success(
        isFeatured
          ? "Review pinned as testimonial — now live on your service page!"
          : "Testimonial unpinned."
      )
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update testimonial")
    },
  })

  const filteredReviews =
    activeFilter === "all"
      ? reviews
      : (reviews || []).filter((r: any) => r.is_testimonial_allowed)

  const avgRating =
    reviews && reviews.length > 0
      ? (
          reviews.reduce(
            (acc: number, r: any) =>
              acc + (r.overall_rating ?? r.rating ?? 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "—"

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-[#668c65]/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#668c65]">
              Reputation Suite
            </span>
          </div>
          <h1 className="font-serif italic text-5xl md:text-6xl text-slate-900 tracking-tight leading-none">
            Your Spotlight.
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-md">
            Manage customer feedback and curate the testimonials that define
            your brand. Pin reviews to showcase them on your service page.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#668c65] p-6 rounded-[2rem] text-white shadow-2xl shadow-[#668c65]/20">
          <div className="space-y-1">
            <p className="text-3xl font-black leading-none">{avgRating}</p>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-70">
              Average Rating
            </p>
          </div>
          <div className="h-8 w-[1px] bg-white/20 mx-2" />
          <div className="space-y-1">
            <p className="text-3xl font-black leading-none">
              {reviews?.length || 0}
            </p>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-70">
              Total Narratives
            </p>
          </div>
          <div className="h-8 w-[1px] bg-white/20 mx-2" />
          <div className="space-y-1">
            <p className="text-3xl font-black leading-none">
              {(reviews || []).filter((r: any) => r.is_featured).length}
            </p>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-70">
              Live Testimonials
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100">
          <Button
            variant="ghost"
            onClick={() => setActiveFilter("all")}
            className={cn(
              "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeFilter === "all"
                ? "bg-white shadow-sm text-[#668c65]"
                : "text-slate-500"
            )}
          >
            All Reviews ({reviews?.length || 0})
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveFilter("testimonials")}
            className={cn(
              "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeFilter === "testimonials"
                ? "bg-white shadow-sm text-[#668c65]"
                : "text-slate-500"
            )}
          >
            Eligible Testimonials (
            {(reviews || []).filter((r: any) => r.is_testimonial_allowed).length}
            )
          </Button>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <Share2 className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Pinned reviews appear on your service page
          </span>
        </div>
      </div>

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-[2.5rem]" />
          ))}
        </div>
      ) : filteredReviews && filteredReviews.length > 0 ? (
        <div className="grid gap-8">
          {filteredReviews.map((review: any) => {
            const rating = review.overall_rating ?? review.rating ?? 0
            const ratingDisplay =
              typeof rating === "number" ? rating.toFixed(1) : "—"

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className={cn(
                    "border-none shadow-sm rounded-[3rem] bg-white transition-all overflow-hidden group",
                    review.is_featured
                      ? "ring-2 ring-[#668c65] ring-offset-4 ring-offset-[#f9fafc]"
                      : ""
                  )}
                >
                  <CardContent className="p-8 md:p-10 flex flex-col lg:flex-row gap-8 md:gap-10">
                    {/* Left: reviewer info + ratings */}
                    <div className="lg:w-64 space-y-6 flex-shrink-0">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-xl font-black text-slate-300 border border-slate-100">
                          {(review.reviewer_name || review.author || "C")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {review.reviewer_name || review.author || "Anonymous"}
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Verified Customer
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-3.5 h-3.5",
                                star <= rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              )}
                            />
                          ))}
                          <span className="ml-2 text-xs font-bold text-slate-900">
                            {ratingDisplay}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#668c65]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Verified Experience</span>
                        </div>
                      </div>

                      {/* Sub-ratings */}
                      <div className="pt-4 border-t border-slate-50 space-y-2">
                        {review.communication_rating && (
                          <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Communication</span>
                            <span className="text-slate-900">
                              {review.communication_rating}/5
                            </span>
                          </div>
                        )}
                        {review.quality_rating && (
                          <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Execution</span>
                            <span className="text-slate-900">
                              {review.quality_rating}/5
                            </span>
                          </div>
                        )}
                        {review.value_rating && (
                          <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Value</span>
                            <span className="text-slate-900">
                              {review.value_rating}/5
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: review text + actions */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <MessageSquare className="w-8 h-8 text-[#668c65]/20" />
                          <div className="flex gap-2 flex-wrap justify-end">
                            {review.is_testimonial_allowed ? (
                              <Button
                                variant={review.is_featured ? "default" : "outline"}
                                className={cn(
                                  "h-10 rounded-full text-[9px] font-black uppercase tracking-widest transition-all gap-2",
                                  review.is_featured
                                    ? "bg-[#668c65] hover:bg-slate-900 text-white"
                                    : "border-slate-200 hover:border-[#668c65] text-slate-500 hover:text-[#668c65]"
                                )}
                                disabled={toggleFeaturedMutation.isPending}
                                onClick={() =>
                                  toggleFeaturedMutation.mutate({
                                    reviewId: review.id,
                                    isFeatured: !review.is_featured,
                                  })
                                }
                              >
                                {review.is_featured ? (
                                  <Pin className="w-3 h-3 fill-white" />
                                ) : (
                                  <Sparkles className="w-3 h-3" />
                                )}
                                {review.is_featured
                                  ? "Pinned as Testimonial"
                                  : "Pin to Service Page"}
                              </Button>
                            ) : (
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-3 py-2">
                                No testimonial consent
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xl md:text-2xl text-slate-800 font-serif italic leading-relaxed group-hover:text-slate-900 transition-colors">
                          "
                          {review.review_text ||
                            review.comment ||
                            "No written review provided."}
                          "
                        </p>
                      </div>

                      <div className="pt-8 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                              Date
                            </p>
                            <p className="text-[11px] font-bold text-slate-900">
                              {new Date(
                                review.created_at || Date.now()
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        {review.is_featured && (
                          <Badge className="bg-slate-900 text-white border-none rounded-full px-4 py-1.5 font-black text-[8px] uppercase tracking-[0.2em] shadow-xl">
                            Live on Service Page
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="py-32 text-center space-y-6 bg-white rounded-[4rem] border border-dashed border-slate-200">
          <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="font-serif italic text-3xl text-slate-900">
            Awaiting your first narrative.
          </h3>
          <p className="text-slate-400 font-medium max-w-sm mx-auto">
            {activeFilter === "testimonials"
              ? "No reviews with testimonial consent yet. Customers can enable this when writing a review."
              : "Encourage your customers to share their experience after a completed booking."}
          </p>
        </div>
      )}
    </div>
  )
}
