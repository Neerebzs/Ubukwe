"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, Upload, Camera, X } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface ReviewFormProps {
  bookingId: string
  serviceName: string
  providerName: string
  onSubmit?: (review: any) => void
}

export function ReviewForm({ bookingId, serviceName, providerName, onSubmit }: ReviewFormProps) {
  const [ratings, setRatings] = useState({
    overall: 0,
    quality: 0,
    value: 0,
    communication: 0,
    punctuality: 0,
  })

  const [reviewText, setReviewText] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [isVerified, setIsVerified] = useState(true) // Would come from backend - only verified bookings can review

  const updateRating = (category: keyof typeof ratings, value: number) => {
    setRatings({ ...ratings, [category]: value })
  }

  const handlePhotoUpload = (files: FileList | null) => {
    if (!files) return
    setPhotos([...photos, ...Array.from(files)])
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (ratings.overall === 0 || !reviewText.trim()) return
    try {
      const { axiosInstance } = await import("@/lib/api-client")
      await axiosInstance.post("/api/v1/reviews", {
        booking_id: bookingId,
        overall_rating: ratings.overall,
        quality_rating: ratings.quality,
        value_rating: ratings.value,
        communication_rating: ratings.communication,
        punctuality_rating: ratings.punctuality,
        review_text: reviewText,
      })
      onSubmit?.({ bookingId, ratings, reviewText })
      const { toast } = await import("sonner")
      toast.success("Review submitted! Thank you for your feedback.")
    } catch (err: any) {
      const { toast } = await import("sonner")
      toast.error(err.message || "Failed to submit review")
    }
  }

  const averageRating = Object.values(ratings).reduce((sum, val) => sum + val, 0) / Object.keys(ratings).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your experience with {providerName} for {serviceName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div>
          <Label className="text-base font-semibold">Overall Rating *</Label>
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => updateRating("overall", star)}
                className="focus:outline-none"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= ratings.overall
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground hover:text-yellow-400"
                  } transition-colors`}
                />
              </button>
            ))}
            {ratings.overall > 0 && (
              <span className="ml-2 text-sm font-medium">{ratings.overall}/5</span>
            )}
          </div>
        </div>

        {/* Detailed Ratings */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Rate Specific Aspects</Label>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-normal">Service Quality</Label>
              <span className="text-sm font-medium">{ratings.quality}/5</span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => updateRating("quality", star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= ratings.quality
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-normal">Value for Money</Label>
              <span className="text-sm font-medium">{ratings.value}/5</span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => updateRating("value", star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= ratings.value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-normal">Communication</Label>
              <span className="text-sm font-medium">{ratings.communication}/5</span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => updateRating("communication", star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= ratings.communication
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-normal">Punctuality</Label>
              <span className="text-sm font-medium">{ratings.punctuality}/5</span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => updateRating("punctuality", star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= ratings.punctuality
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Review Text */}
        <div>
          <Label htmlFor="reviewText">Your Review *</Label>
          <Textarea
            id="reviewText"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience... What did you like? What could be improved?"
            rows={6}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">{reviewText.length}/500 characters</p>
        </div>

        {/* Photo Upload */}
        <div>
          <Label>Add Photos (Optional)</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Help other customers by sharing photos from your experience
          </p>
          <div className="border-2 border-dashed rounded-lg p-4">
            <input
              type="file"
              id="reviewPhotos"
              accept="image/*"
              multiple
              onChange={(e) => handlePhotoUpload(e.target.files)}
              className="hidden"
            />
            <label htmlFor="reviewPhotos" className="cursor-pointer flex flex-col items-center">
              <Camera className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Upload photos</p>
              <p className="text-xs text-muted-foreground">Up to 5 photos, 5MB each</p>
            </label>
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Review photo ${idx + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Verification Badge */}
        {isVerified && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <p className="text-sm text-green-900">
              <strong>Verified Booking:</strong> This review is from a confirmed booking
            </p>
          </div>
        )}

        {/* Average Rating Summary */}
        {averageRating > 0 && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Rating</span>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSubmit} disabled={ratings.overall === 0 || !reviewText.trim()}>
            Submit Review
          </Button>
          <Button variant="outline">Save as Draft</Button>
        </div>
      </CardContent>
    </Card>
  )
}

