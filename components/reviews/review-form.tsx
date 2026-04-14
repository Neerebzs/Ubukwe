"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, Camera, X, Sparkles, CheckCircle, Info, Heart, ArrowRight, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

interface ReviewFormProps {
  bookingId: string
  serviceName: string
  providerName: string
  onSubmit?: (review: any) => void
}

export function ReviewForm({ bookingId, serviceName, providerName, onSubmit }: ReviewFormProps) {
  const [ratings, setRatings] = useState({
    overall: 0,
    communication: 0,
    professionalism: 0,
    quality: 0,
    punctuality: 0,
    value: 0,
  })

  const [reviewText, setReviewText] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [showPhotos, setShowPhotos] = useState(false)
  const [isTestimonialVisible, setIsTestimonialVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [triedToSubmit, setTriedToSubmit] = useState(false)

  const updateRating = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }))
  }

  const handlePhotoUpload = (files: FileList | null) => {
    if (!files) return
    if (photos.length + files.length > 5) {
      toast.warning("You can only upload up to 5 photos.")
      return
    }
    setPhotos(prev => [...prev, ...Array.from(files)])
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setTriedToSubmit(true)
    
    if (ratings.overall === 0) {
      toast.error("Please give an overall rating before submitting.")
      return
    }
    if (!reviewText.trim()) {
      toast.error("Please write your narrative before submitting.")
      return
    }

    setIsSubmitting(true)
    try {
      await apiClient.reviews.create({
        booking_id: bookingId,
        // Send both rating (required by backend) and overall_rating
        rating: ratings.overall,
        overall_rating: ratings.overall,
        quality_rating: ratings.quality || undefined,
        value_rating: ratings.value || undefined,
        communication_rating: ratings.communication || undefined,
        punctuality_rating: ratings.punctuality || undefined,
        professionalism_rating: ratings.professionalism || undefined,
        review_text: reviewText.trim(),
        comment: reviewText.trim(),
        is_testimonial_allowed: isTestimonialVisible,
      })

      toast.success("Review published!", {
        description: "Thank you for helping our community grow.",
      })

      onSubmit?.({ bookingId, ratings, reviewText, isTestimonialVisible })
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to submit review. Please try again."
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const RatingStars = ({
    category,
    value,
    size = "md",
    label,
  }: {
    category: keyof typeof ratings
    value: number
    size?: "sm" | "md" | "lg"
    label?: string
  }) => {
    const starSize =
      size === "lg" ? "w-8 h-8" : size === "md" ? "w-6 h-6" : "w-4 h-4"

    return (
      <div className="space-y-3">
        {label && (
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {label}
            </span>
            <span className="text-[10px] font-bold text-[#668c65] bg-[#668c65]/10 px-2 py-0.5 rounded-full">
              {value > 0 ? `${value}/5` : "Optional"}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => updateRating(category, star)}
              className="relative group transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                className={cn(
                  starSize,
                  "transition-all duration-300",
                  star <= value
                    ? "fill-[#668c65] text-[#668c65]"
                    : "text-slate-200 group-hover:text-[#668c65]/30"
                )}
              />
            </button>
          ))}
        </div>
      </div>
    )
  }

  const isValid = ratings.overall > 0 && reviewText.trim().length > 0
  const isOverallMissing = triedToSubmit && ratings.overall === 0
  const isTextMissing = triedToSubmit && !reviewText.trim()

  return (
    <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
      <CardHeader className="bg-gradient-to-br from-[#668c65]/5 to-transparent p-5 md:p-10">
        <div className="flex items-center gap-2 md:gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#668c65]/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-[#668c65]" />
          </div>
          <div className="h-[1px] w-8 bg-[#668c65]/30" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#668c65]">
            Feedback Odyssey
          </span>
        </div>
        <CardTitle className="font-serif italic text-3xl md:text-4xl text-slate-900 tracking-tight">
          Your Narrative.
        </CardTitle>
        <CardDescription className="text-slate-500 font-medium text-sm md:text-lg leading-relaxed max-w-md pt-2">
          Reflect on your journey with{" "}
          <span className="text-slate-900 font-bold">{providerName}</span> for{" "}
          <span className="text-slate-900 font-bold">{serviceName}</span>.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-10 space-y-6 md:space-y-10">
        {/* Overall Rating — required */}
        <motion.section 
          animate={isOverallMissing ? { x: [-4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className={cn(
            "space-y-6 p-6 rounded-[2rem] transition-all duration-300",
            isOverallMissing 
              ? "bg-rose-50 border-2 border-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.1)]" 
              : "bg-[#668c65]/5 border border-[#668c65]/10"
          )}
        >
          <div className="flex items-center gap-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#668c65]">
              Overall Reflection
            </Label>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#668c65] bg-[#668c65]/10 px-2 py-0.5 rounded-full">
              Required
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <RatingStars category="overall" value={ratings.overall} size="lg" />
            {ratings.overall > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#668c65] text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#668c65]/20"
              >
                <CheckCircle className="w-3 h-3" />
                {ratings.overall === 5
                  ? "Exquisite Experience"
                  : ratings.overall === 4
                  ? "Beautiful Service"
                  : ratings.overall === 3
                  ? "Good Experience"
                  : "Verified Review"}
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Phase 1: Booking & Planning */}
        <section className="space-y-6 p-5 md:p-8 rounded-[2rem] bg-slate-50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#668c65]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="flex items-center gap-3 relative z-10">
            <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-[#668c65]">
              01
            </span>
            <h3 className="font-serif italic text-xl text-slate-800">
              Booking & Planning{" "}
              <span className="text-slate-400 text-sm font-sans not-italic">(optional)</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 relative z-10">
            <RatingStars
              category="communication"
              value={ratings.communication}
              label="Responsiveness"
            />
            <RatingStars
              category="professionalism"
              value={ratings.professionalism}
              label="Planning Professionalism"
            />
          </div>
        </section>

        {/* Phase 2: Service Delivery */}
        <section className="space-y-6 p-5 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-4 right-4 text-[#668c65]/10 rotate-12">
            <Sparkles className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[10px] font-black text-[#668c65]">
              02
            </span>
            <h3 className="font-serif italic text-xl text-slate-800">
              Service Delivery{" "}
              <span className="text-slate-400 text-sm font-sans not-italic">(optional)</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <RatingStars
              category="quality"
              value={ratings.quality}
              label="Execution Quality"
              size="sm"
            />
            <RatingStars
              category="punctuality"
              value={ratings.punctuality}
              label="Punctuality"
              size="sm"
            />
            <RatingStars
              category="value"
              value={ratings.value}
              label="Investment Value"
              size="sm"
            />
          </div>
        </section>

        {/* Review text — required */}
        <motion.section 
          animate={isTextMissing ? { x: [-4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className={cn(
            "space-y-4 p-6 rounded-[2rem] transition-all duration-300",
            isTextMissing && "bg-rose-50 border-2 border-rose-200"
          )}
        >
          <div className="flex items-center gap-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Your Narrative
            </Label>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full transition-colors",
              isTextMissing ? "bg-rose-500 text-white" : "text-rose-400 bg-rose-50"
            )}>
              Required
            </span>
          </div>
          <div className="relative">
            <Textarea
              value={reviewText}
              onChange={(e) => {
                setReviewText(e.target.value.slice(0, 1000))
                if (triedToSubmit) setTriedToSubmit(false)
              }}
              placeholder="Share the narrative of your experience... What moments stood out?"
              rows={6}
              className={cn(
                "w-full bg-slate-50 border-slate-100 rounded-2xl md:rounded-3xl p-4 md:p-6 focus:ring-[#668c65] focus:border-[#668c65] transition-all resize-none shadow-inner",
                isTextMissing && "border-rose-300"
              )}
            />
            <div className="absolute bottom-4 right-6">
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors",
                  reviewText.length > 900 ? "text-rose-500" : "text-slate-400"
                )}
              >
                {reviewText.length}/1000
              </span>
            </div>
          </div>
        </motion.section>

        {/* Visual Testimony — collapsible optional section */}
        <section className="rounded-[2rem] border border-slate-100 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPhotos(!showPhotos)}
            className="w-full flex items-center justify-between p-5 md:p-6 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Camera className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                Visual Testimony
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                Optional
              </span>
              {photos.length > 0 && (
                <span className="text-[9px] font-black uppercase tracking-widest text-[#668c65] bg-[#668c65]/10 px-2 py-0.5 rounded-full">
                  {photos.length} photo{photos.length > 1 ? "s" : ""} added
                </span>
              )}
            </div>
            {showPhotos ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <AnimatePresence>
            {showPhotos && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-5 md:p-6 grid grid-cols-3 md:grid-cols-6 gap-4">
                  <AnimatePresence>
                    {photos.map((photo, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative aspect-square rounded-2xl overflow-hidden group shadow-md"
                      >
                        <img
                          src={URL.createObjectURL(photo)}
                          alt="Testimony"
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}

                    {photos.length < 5 && (
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#668c65]/30 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all group">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e.target.files)}
                          className="hidden"
                        />
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-[#668c65] transition-all">
                          <Camera className="w-5 h-5 text-slate-400 group-hover:text-white" />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                          Add Image
                        </span>
                      </label>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Testimonial Spotlight */}
        <section className="p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-[#668c65]/5 border border-[#668c65]/10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#668c65]/10 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-[#668c65]" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#668c65]">
                Shine a Spotlight
              </h3>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Consenting allows{" "}
              <span className="text-slate-900 font-bold">{providerName}</span>{" "}
              to showcase your feedback as a featured testimonial on their
              public service page.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#668c65]/70">
              Showcase My Review
            </span>
            <Switch
              checked={isTestimonialVisible}
              onCheckedChange={setIsTestimonialVisible}
              className="data-[state=checked]:bg-[#668c65]"
            />
          </div>
        </section>

        {/* Submit */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 text-[#668c65]">
            <Info className="w-4 h-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              Verified Bookings are protected by Ubukwe Hub
            </p>
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-16 px-12 rounded-full bg-slate-900 hover:bg-[#668c65] text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:shadow-[#668c65]/20 group transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </div>
            ) : (
              <>
                Publish Narrative
                <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
