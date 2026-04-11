"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Tag, Upload, X, Calendar, Loader2, Plus, Trash2, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface AddPromotionModalProps {
  isOpen: boolean
  onClose: () => void
  serviceId: string
  servicePackages: Array<{
    id: string
    name: string
    price: number
  }>
  onSuccess: () => void
}

export function AddPromotionModal({ isOpen, onClose, serviceId, servicePackages, onSuccess }: AddPromotionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: "offer" as "offer" | "event",
    mediaType: "image" as "image" | "video" | "reel",
    title: "",
    description: "",
    validFrom: "",
    validTo: "",
    mediaUrl: "",
    thumbnail: "",
    selectedPackageId: "",
    promotionalPrice: ""
  })
  const [uploadingMedia, setUploadingMedia] = useState(false)

  const handleFileUpload = async (file: File, field: "mediaUrl" | "thumbnail") => {
    if (!file) return

    // Validate file type
    const validTypes = formData.mediaType === "image" 
      ? ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      : ["video/mp4", "video/webm", "video/quicktime"]

    if (!validTypes.includes(file.type)) {
      toast.error(`Invalid file type. Please upload a valid ${formData.mediaType} file.`)
      return
    }

    // Validate file size (10MB for images, 50MB for videos)
    const maxSize = formData.mediaType === "image" ? 10 * 1024 * 1024 : 50 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is ${formData.mediaType === "image" ? "10MB" : "50MB"}.`)
      return
    }

    setUploadingMedia(true)
    const formDataUpload = new FormData()
    formDataUpload.append("file", file)

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"
      const response = await fetch(`${API_BASE_URL}/api/v1/provider/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataUpload,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, [field]: data.url }))
      toast.success(`${field === "mediaUrl" ? "Media" : "Thumbnail"} uploaded successfully!`)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload file")
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.mediaUrl) {
      toast.error("Please fill in all required fields")
      return
    }

    if (formData.type === "offer" && (!formData.validFrom || !formData.validTo)) {
      toast.error("Please specify validity dates for the offer")
      return
    }

    // Validate package selection and promotional price for offers
    if (formData.type === "offer") {
      if (!formData.selectedPackageId) {
        toast.error("Please select a package for this offer")
        return
      }
      if (!formData.promotionalPrice) {
        toast.error("Please enter a promotional price")
        return
      }
      if (selectedPackage && Number(formData.promotionalPrice) >= selectedPackage.price) {
        toast.error("Promotional price must be lower than the original price")
        return
      }
    }

    setIsSubmitting(true)

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"
      
      const payload: any = {
        type: formData.mediaType,
        contentType: formData.type,
        url: formData.mediaUrl,
        thumbnail: formData.thumbnail || formData.mediaUrl,
        title: formData.title,
        description: formData.description,
        validFrom: formData.validFrom || undefined,
        validTo: formData.validTo || undefined,
      }

      // Add package information for offers
      if (formData.type === "offer") {
        payload.packageId = formData.selectedPackageId
        payload.promotionalPrice = Number(formData.promotionalPrice)
        payload.originalPrice = selectedPackage?.price
        payload.discountPercentage = discountPercentage
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/provider/services/${serviceId}/promotions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to add promotion")
      }

      toast.success("Promotion added successfully!")
      onSuccess()
      handleClose()
    } catch (error: any) {
      console.error("Add promotion error:", error)
      toast.error(error.message || "Failed to add promotion")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      type: "offer",
      mediaType: "image",
      title: "",
      description: "",
      validFrom: "",
      validTo: "",
      mediaUrl: "",
      thumbnail: "",
      selectedPackageId: "",
      promotionalPrice: ""
    })
    onClose()
  }

  // Get selected package details
  const selectedPackage = servicePackages.find(pkg => pkg.id === formData.selectedPackageId)
  
  // Calculate discount percentage
  const discountPercentage = selectedPackage && formData.promotionalPrice
    ? Math.round(((selectedPackage.price - Number(formData.promotionalPrice)) / selectedPackage.price) * 100)
    : 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif italic text-slate-900">
            Add Promotion
          </DialogTitle>
          <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Create an exclusive offer or event to attract customers
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Promotion Type and Media Type - Same Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Promotion Type */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                Promotion Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: "offer" | "event") =>
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offer">Special Offer</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Media Type */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                Media Type
              </Label>
              <Select
                value={formData.mediaType}
                onValueChange={(value: "image" | "video" | "reel") =>
                  setFormData(prev => ({ ...prev, mediaType: value }))
                }
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="reel">Reel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900">
              Title *
            </Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Summer Wedding Special"
              className="h-12 rounded-xl"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900">
              Description *
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your promotion..."
              className="min-h-[100px] rounded-xl"
              required
            />
          </div>

          {/* Validity Dates (for offers) */}
          {formData.type === "offer" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                    Valid From *
                  </Label>
                  <Input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                    Valid To *
                  </Label>
                  <Input
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, validTo: e.target.value }))}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Package Selection */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                  Select Package *
                </Label>
                <Select
                  value={formData.selectedPackageId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, selectedPackageId: value, promotionalPrice: "" }))}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Choose a package to promote" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicePackages.length === 0 ? (
                      <SelectItem value="none" disabled>No packages available</SelectItem>
                    ) : (
                      servicePackages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} - {pkg.price.toLocaleString()} RWF
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Promotional Price */}
              {selectedPackage && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                    New Price During Promotion *
                  </Label>
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.promotionalPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, promotionalPrice: e.target.value }))}
                        placeholder="Enter new promotional price"
                        className="h-12 rounded-xl pr-16"
                        min="0"
                        max={selectedPackage.price}
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                        RWF
                      </span>
                    </div>
                    
                    {/* Price Comparison Card */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Original Price</p>
                          <p className="text-lg font-serif italic text-slate-500 line-through">
                            {selectedPackage.price.toLocaleString()}
                          </p>
                          <p className="text-[8px] text-slate-400">RWF</p>
                        </div>
                        <div className="relative">
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                            <Badge className="bg-[#668c65] text-white border-none text-xs font-black px-3 py-1">
                              {discountPercentage}% OFF
                            </Badge>
                          </div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 mt-4">New Price</p>
                          <p className="text-2xl font-serif italic text-[#668c65] font-bold">
                            {formData.promotionalPrice ? Number(formData.promotionalPrice).toLocaleString() : "0"}
                          </p>
                          <p className="text-[8px] text-[#668c65] font-bold">RWF</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">You Save</p>
                          <p className="text-lg font-serif italic text-rose-600 font-bold">
                            {formData.promotionalPrice ? (selectedPackage.price - Number(formData.promotionalPrice)).toLocaleString() : "0"}
                          </p>
                          <p className="text-[8px] text-rose-600">RWF</p>
                        </div>
                      </div>
                      {formData.promotionalPrice && Number(formData.promotionalPrice) >= selectedPackage.price && (
                        <div className="mt-3 p-2 bg-rose-50 rounded-lg border border-rose-200">
                          <p className="text-xs text-rose-600 text-center font-medium">
                            ⚠️ Promotional price must be lower than original price
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Validity Dates (for events - without package selection) */}
          {formData.type === "event" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                  Event Date From
                </Label>
                <Input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                  Event Date To
                </Label>
                <Input
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData(prev => ({ ...prev, validTo: e.target.value }))}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          )}

          {/* Media Upload */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900">
              {formData.mediaType === "image" ? "Image" : "Video"} *
            </Label>
            {formData.mediaUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                {formData.mediaType === "image" ? (
                  <img src={formData.mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <video src={formData.mediaUrl} className="w-full h-full object-cover" controls />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full"
                  onClick={() => setFormData(prev => ({ ...prev, mediaUrl: "" }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-[#668c65] transition-colors">
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-500">
                  {uploadingMedia ? "Uploading..." : `Click to upload ${formData.mediaType}`}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept={formData.mediaType === "image" ? "image/*" : "video/*"}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "mediaUrl")}
                  disabled={uploadingMedia}
                />
              </label>
            )}
          </div>

          {/* Thumbnail (for videos) */}
          {formData.mediaType !== "image" && (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                Thumbnail (Optional)
              </Label>
              {formData.thumbnail ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                  <img src={formData.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full"
                    onClick={() => setFormData(prev => ({ ...prev, thumbnail: "" }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-[#668c65] transition-colors">
                  <Upload className="h-6 w-6 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500">
                    {uploadingMedia ? "Uploading..." : "Click to upload thumbnail"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "thumbnail")}
                    disabled={uploadingMedia}
                  />
                </label>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12 rounded-xl"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 rounded-xl bg-[#668c65] hover:bg-[#5a7b59]"
              disabled={isSubmitting || uploadingMedia}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Tag className="h-4 w-4 mr-2" />
                  Add Promotion
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
