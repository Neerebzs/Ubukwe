"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, CheckCircle, ArrowRight, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewDialog } from "@/components/reviews/review-dialog"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { toast } from "sonner"

export function CustomerReviewsView() {
  const [selectedBooking, setSelectedBooking] = useState<{
    id: string
    serviceName: string
    providerName: string
  } | null>(null)
  const queryClient = useQueryClient()

  // Fetch completed bookings
  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["customer-bookings-for-review"],
    queryFn: async () => {
      const response = await apiClient.bookings.getAll({ role: "customer" })
      const data = response.data as any
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      return list.filter((b: any) => b.status === "completed")
    },
  })

  // Fetch reviews written by the current user via /reviews/me
  const { data: myReviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ["customer-my-reviews"],
    queryFn: async () => {
      const response = await apiClient.reviews.getMyReviews()
      const data = response.data as any
      return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    },
  })

  const reviewedBookingIds = new Set((myReviews || []).map((r: any) => r.booking_id))

  const pendingReviews = (bookings || []).filter(
    (b: any) => !reviewedBookingIds.has(b.id)
  )

  const publishedReviews = myReviews || []

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-[#668c65]/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#668c65]">
              Testimonial Hub
            </span>
          </div>
          <h1 className="font-serif italic text-5xl md:text-6xl text-slate-900 tracking-tight leading-none">
            Your Voices.
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-md">
            Your feedback shapes the Ubukwe community. Celebrate excellence and
            help others discover the perfect artisans.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white shadow-sm flex items-center gap-4">
            <div className="px-6 py-3 text-center border-r border-slate-100">
              <p className="text-2xl font-black text-slate-900 leading-none">
                {publishedReviews.length}
              </p>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">
                Reviews Given
              </p>
            </div>
            <div className="px-6 py-3 text-center">
              <p className="text-2xl font-black text-[#668c65] leading-none">
                {pendingReviews.length}
              </p>
              <p className="text-[8px] font-black uppercase tracking-widest text-[#668c65]/60 mt-1">
                Awaiting Flow
              </p>
            </div>
          </div>
          <Button
            className="rounded-[1.5rem] bg-[#668c65] hover:bg-slate-900 text-white px-8 h-14 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all gap-3"
            onClick={() => {
              if (pendingReviews.length > 0) {
                const b = pendingReviews[0]
                setSelectedBooking({
                  id: b.id,
                  serviceName: b.service_name || "Wedding Service",
                  providerName: b.provider_name || "Verified Artisan",
                })
              } else {
                toast.info("No completed bookings awaiting review.")
              }
            }}
          >
            <Star className="w-4 h-4" />
            Write a Review
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-2xl mb-12 border border-slate-100 h-14">
          <TabsTrigger
            value="pending"
            className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-[#668c65] font-bold text-[10px] uppercase tracking-widest h-full transition-all"
          >
            Awaiting Review ({pendingReviews.length})
          </TabsTrigger>
          <TabsTrigger
            value="published"
            className="rounded-xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-[#668c65] font-bold text-[10px] uppercase tracking-widest h-full transition-all"
          >
            My Narratives ({publishedReviews.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Reviews Tab */}
        <TabsContent value="pending" className="mt-0">
          {isLoadingBookings ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-48 rounded-[2rem]" />
              ))}
            </div>
          ) : pendingReviews.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {pendingReviews.map((booking: any) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <Card className="border-none shadow-[0_16px_32px_-8px_rgba(0,0,0,0.06)] rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl transition-all duration-500">
                    <CardContent className="p-8 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <Badge className="bg-[#668c65]/10 text-[#668c65] border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                            {booking.service_type || "Artisan Service"}
                          </Badge>
                          <h3 className="text-xl font-bold text-slate-900 mt-2">
                            {booking.service_name || "Wedding Service"}
                          </h3>
                          <p className="text-sm text-slate-500">
                            Provided by{" "}
                            <span className="font-bold text-slate-800">
                              {booking.provider_name || "Verified Artisan"}
                            </span>
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-[#668c65] group-hover:text-white transition-colors">
                          <Clock className="w-5 h-5 opacity-40 group-hover:opacity-100" />
                        </div>
                      </div>

                      <div className="h-[1px] w-full bg-slate-50" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <CheckCircle className="w-4 h-4 text-[#668c65]" />
                          <span>Service Completed</span>
                        </div>
                        <Button
                          onClick={() =>
                            setSelectedBooking({
                              id: booking.id,
                              serviceName:
                                booking.service_name || "Wedding Service",
                              providerName:
                                booking.provider_name || "Verified Artisan",
                            })
                          }
                          className="rounded-full bg-slate-900 hover:bg-[#668c65] text-white px-6 h-10 text-[9px] font-black uppercase tracking-widest transition-all gap-2"
                        >
                          Write Review
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center space-y-4 rounded-[3rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="font-serif italic text-2xl text-slate-900">
                All Flowing Smoothly.
              </h3>
              <p className="text-slate-400 font-medium max-w-xs mx-auto">
                You've reviewed all your completed bookings. Your voice is being
                heard!
              </p>
            </div>
          )}
        </TabsContent>

        {/* Published Reviews Tab */}
        <TabsContent value="published" className="mt-0">
          {isLoadingReviews ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-40 rounded-[2rem]" />
              ))}
            </div>
          ) : publishedReviews.length > 0 ? (
            <div className="space-y-8">
              {publishedReviews.map((review: any) => {
                const rating = review.overall_rating ?? review.rating ?? 0
                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white/50 backdrop-blur-sm border border-white hover:bg-white transition-all">
                      <CardContent className="p-8 flex flex-col md:flex-row gap-8">
                        <div className="md:w-64 space-y-4">
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "w-3 h-3",
                                  star <= rating
                                    ? "fill-[#668c65] text-[#668c65]"
                                    : "text-slate-200"
                                )}
                              />
                            ))}
                            <span className="ml-1 text-xs font-bold text-slate-700">
                              {rating}/5
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 line-clamp-1">
                            {review.service_name || "Reviewed Service"}
                          </h4>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                            By {review.provider_name || "Artisan"}
                          </p>
                          {review.is_testimonial_allowed && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#668c65]/5 text-[#668c65] text-[8px] font-black uppercase tracking-widest border border-[#668c65]/10">
                              <Sparkles className="w-3 h-3" />
                              Spotlight Eligible
                            </div>
                          )}
                          {review.is_featured && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest">
                              <Star className="w-3 h-3 fill-white" />
                              Live Testimonial
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-4">
                          <p className="text-slate-600 leading-relaxed font-serif italic text-lg line-clamp-4">
                            "
                            {review.review_text ||
                              review.comment ||
                              "No written review."}
                            "
                          </p>
                          <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                Published On
                              </span>
                              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mt-1">
                                {new Date(
                                  review.created_at || Date.now()
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            {review.communication_rating && (
                              <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                  Communication
                                </span>
                                <span className="text-[10px] font-bold text-[#668c65] uppercase tracking-widest mt-1">
                                  {review.communication_rating}/5
                                </span>
                              </div>
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
            <div className="py-24 text-center space-y-4">
              <h3 className="font-serif italic text-xl text-slate-400">
                No narratives shared yet.
              </h3>
              <p className="text-slate-400 text-sm">
                Complete a booking and share your experience.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      {selectedBooking && (
        <ReviewDialog
          isOpen={true}
          onClose={() => setSelectedBooking(null)}
          bookingId={selectedBooking.id}
          serviceName={selectedBooking.serviceName}
          providerName={selectedBooking.providerName}
          onSuccess={() => {
            setSelectedBooking(null)
            queryClient.invalidateQueries({
              queryKey: ["customer-bookings-for-review"],
            })
            queryClient.invalidateQueries({ queryKey: ["customer-my-reviews"] })
          }}
        />
      )}
    </div>
  )
}
