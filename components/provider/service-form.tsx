"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Save, X, MapPin, Star, Image as ImageIcon, Upload, Check, ChevronRight, ChevronLeft, CheckCircle, PlayCircle, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/api"

interface ServicePackage {
  id: string
  name: string
  price: number
  duration: string
  description: string
  features: string[]
  popular: boolean
}

interface GalleryItem {
  id: string
  type: "image" | "video"
  url: string
  thumbnail?: string
  file?: File
  preview?: string // For local preview
}

export interface ServiceFormData {
  // Basic Info
  name: string
  category: string
  location: string
  description: string
  specialties: string[]
  priceRangeMin: string
  priceRangeMax: string

  // Gallery
  gallery: GalleryItem[]

  // Packages
  packages: ServicePackage[]

  // Contact (for About tab)
  phone: string
  email: string

  // Status
  status: "draft" | "active"
  verified: boolean
}

interface ServiceFormProps {
  initialData?: Partial<ServiceFormData>
  onSave?: (data: ServiceFormData) => void
  onCancel?: () => void
}

export function ServiceForm({ initialData, onSave, onCancel }: ServiceFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5
  const [currentSpecialty, setCurrentSpecialty] = useState("")
  const [currentFeature, setCurrentFeature] = useState<{ packageId: string; feature: string }>({ packageId: "", feature: "" })
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [formData, setFormData] = useState<ServiceFormData>({
    name: initialData?.name || "",
    category: initialData?.category || "Entertainment",
    location: initialData?.location || "Kigali",
    description: initialData?.description || "",
    specialties: initialData?.specialties || [],
    priceRangeMin: initialData?.priceRangeMin || "",
    priceRangeMax: initialData?.priceRangeMax || "",
    gallery: initialData?.gallery || [],
    packages: initialData?.packages || [],
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    status: initialData?.status || "draft",
    verified: initialData?.verified || false,
  })

  const categories = [
    "Entertainment", "Venue", "Food", "Decor", "Photography",
    "Transportation", "Beauty", "Music", "Other"
  ]

  const locations = [
    "Kigali", "Butare", "Gisenyi", "Musanze", "Huye", "Rwamagana", "Other"
  ]

  const addSpecialty = () => {
    if (currentSpecialty.trim() && !formData.specialties.includes(currentSpecialty.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, currentSpecialty.trim()]
      })
      setCurrentSpecialty("")
    }
  }

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter(s => s !== specialty)
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newItems: GalleryItem[] = []

    Array.from(files).forEach((file) => {
      // Validate file type
      if (type === "image" && !file.type.startsWith("image/")) {
        alert(`${file.name} is not a valid image file`)
        return
      }
      if (type === "video" && !file.type.startsWith("video/")) {
        alert(`${file.name} is not a valid video file`)
        return
      }

      // Validate file size (max 10MB for images, 50MB for videos)
      const maxSize = type === "image" ? 10 * 1024 * 1024 : 50 * 1024 * 1024
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum size: ${type === "image" ? "10MB" : "50MB"}`)
        return
      }

      const preview = type === "image" ? URL.createObjectURL(file) : undefined

      const newItem: GalleryItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type,
        url: "", // Will be set after upload to server
        file,
        preview
      }

      newItems.push(newItem)
    })

    setFormData({
      ...formData,
      gallery: [...formData.gallery, ...newItems]
    })

    // Reset input
    e.target.value = ""
  }

  const addGalleryItem = (type: "image" | "video") => {
    // Trigger file input click
    const inputId = type === "image" ? "image-upload-input" : "video-upload-input"
    document.getElementById(inputId)?.click()
  }

  const removeGalleryItem = (id: string) => {
    const item = formData.gallery.find(g => g.id === id)
    // Clean up preview URL to prevent memory leaks
    if (item?.preview) {
      URL.revokeObjectURL(item.preview)
    }
    setFormData({
      ...formData,
      gallery: formData.gallery.filter(item => item.id !== id)
    })
  }

  const handleAddPackage = () => {
    setEditingPackage(null)
    setIsPackageDialogOpen(true)
  }

  const handleEditPackage = (pkg: ServicePackage) => {
    setEditingPackage(pkg)
    setIsPackageDialogOpen(true)
  }

  const handleSavePackage = (pkgData: Omit<ServicePackage, "id">) => {
    if (editingPackage) {
      setFormData({
        ...formData,
        packages: formData.packages.map(p => p.id === editingPackage.id ? { ...pkgData, id: editingPackage.id } : p)
      })
    } else {
      setFormData({
        ...formData,
        packages: [...formData.packages, { ...pkgData, id: Date.now().toString() }]
      })
    }
    setIsPackageDialogOpen(false)
    setEditingPackage(null)
  }

  const removePackage = (id: string) => {
    setFormData({
      ...formData,
      packages: formData.packages.filter(p => p.id !== id)
    })
  }

  const addPackageFeature = (packageId: string, feature: string) => {
    if (!feature.trim()) return
    setFormData({
      ...formData,
      packages: formData.packages.map(p =>
        p.id === packageId
          ? { ...p, features: [...p.features, feature.trim()] }
          : p
      )
    })
    setCurrentFeature({ packageId: "", feature: "" })
  }

  const removePackageFeature = (packageId: string, featureIndex: number) => {
    setFormData({
      ...formData,
      packages: formData.packages.map(p =>
        p.id === packageId
          ? { ...p, features: p.features.filter((_, i) => i !== featureIndex) }
          : p
      )
    })
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Basic Information
        if (!formData.name || !formData.category || !formData.location || !formData.description) {
          alert("Please fill in all required fields: Name, Category, Location, and Description")
          return false
        }
        if (!formData.priceRangeMin || !formData.priceRangeMax) {
          alert("Please set your price range (minimum and maximum)")
          return false
        }
        return true
      case 2: // Packages
        if (formData.packages.length === 0) {
          alert("Please create at least one package for your service")
          return false
        }
        return true
      case 3: // Gallery - Optional, skip validation
      case 4: // Contact - Optional, skip validation
      case 5: // Review - Final step
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const uploadGalleryImages = async (serviceId?: string): Promise<string[]> => {
    /**
     * Upload gallery items to Cloudinary and return URLs
     * Only uploads items that have files (not already uploaded)
     */
    const filesToUpload = formData.gallery.filter(item => item.file && !item.url)
    
    if (filesToUpload.length === 0) {
      // Return already uploaded URLs
      return formData.gallery.map(item => item.url).filter(url => url !== "")
    }

    try {
      const uploadedUrls: string[] = []
      
      // Upload image files
      const imageFiles = filesToUpload.filter(item => item.type === "image").map(item => item.file as File)
      if (imageFiles.length > 0) {
        console.log(`Uploading ${imageFiles.length} images to Cloudinary...`)
        const response = await api.upload.gallery<any>(imageFiles, serviceId || "temp")
        console.log("Gallery upload response:", response)
        
        if (response.data?.uploaded_files) {
          response.data.uploaded_files.forEach((file: any) => {
            if (file.url) {
              uploadedUrls.push(file.url)
            }
          })
        } else if (response.data?.url) {
          // Handle single file response
          uploadedUrls.push(response.data.url)
        }
      }

      // For videos, we'll upload them individually with general endpoint
      const videoFiles = filesToUpload.filter(item => item.type === "video").map(item => item.file as File)
      for (const videoFile of videoFiles) {
        console.log(`Uploading video: ${videoFile.name}`)
        const response = await api.upload.general<any>(videoFile, "ubukwe/videos", "video")
        console.log("Video upload response:", response)
        
        if (response.data?.url) {
          uploadedUrls.push(response.data.url)
        }
      }

      console.log("All uploaded URLs:", uploadedUrls)

      // Update formData with uploaded URLs
      const updatedGallery = formData.gallery.map(item => {
        if (item.file && !item.url && uploadedUrls.length > 0) {
          return { ...item, url: uploadedUrls.shift() || "" }
        }
        return item
      })

      setFormData({
        ...formData,
        gallery: updatedGallery
      })

      return updatedGallery.map(item => item.url).filter(url => url !== "")
    } catch (error: any) {
      console.error("Gallery upload error:", error)
      const errorMessage = error?.response?.data?.detail || error?.message || "Unknown error"
      throw new Error(`Upload failed: ${errorMessage}`)
    }
  }

  const handleSubmit = async (status?: "draft" | "active") => {
    if (!formData.name || !formData.category || !formData.location || !formData.description) {
      alert("Please fill in all required fields (Name, Category, Location, Description)")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Step 1: Upload gallery images if there are any with files
      const galleryUrls = await uploadGalleryImages()
      setUploadProgress(50)

      // Step 2: Create the final data with uploaded gallery URLs
      const finalData = {
        ...formData,
        gallery: formData.gallery.map(item => ({ 
          ...item, 
          url: item.url || "" 
        })),
        status: status || formData.status
      }

      setUploadProgress(75)

      // Step 3: Save the service with gallery URLs
      if (onSave) {
        onSave(finalData)
      } else {
        console.log("Service Data with uploaded gallery:", finalData)
        alert(`Service ${status === "active" ? "published" : "saved as draft"}!`)
      }

      setUploadProgress(100)
    } catch (error: any) {
      console.error("Submit error:", error)
      alert(error.message || "Failed to save service. Please try again.")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const stepLabels = [
    "Basic Information",
    "Packages & Pricing",
    "Gallery",
    "Contact Info",
    "Review & Publish"
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{initialData ? "Edit Service" : "Create New Service"}</h2>
          <p className="text-muted-foreground">Complete all steps to create a service that customers will see</p>
        </div>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Progress Bar */}
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />

            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {stepLabels.map((label, index) => {
                const stepNum = index + 1
                const isCompleted = stepNum < currentStep
                const isCurrent = stepNum === currentStep

                return (
                  <div key={stepNum} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${isCompleted
                          ? "bg-primary border-primary text-primary-foreground"
                          : isCurrent
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground bg-background text-muted-foreground"
                        }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="font-semibold">{stepNum}</span>
                        )}
                      </div>
                      <span className={`text-xs mt-2 text-center ${isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                        }`}>
                        {label}
                      </span>
                    </div>
                    {stepNum < totalSteps && (
                      <ChevronRight className={`w-6 h-6 mx-2 ${isCompleted ? "text-primary" : "text-muted-foreground"
                        }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
              <CardDescription>Basic information customers will see</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Traditional Intore Dancers"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priceMin">Minimum Price (RWF) *</Label>
                  <Input
                    id="priceMin"
                    type="number"
                    value={formData.priceRangeMin}
                    onChange={(e) => setFormData({ ...formData, priceRangeMin: e.target.value })}
                    placeholder="e.g., 120000"
                  />
                </div>

                <div>
                  <Label htmlFor="priceMax">Maximum Price (RWF) *</Label>
                  <Input
                    id="priceMax"
                    type="number"
                    value={formData.priceRangeMax}
                    onChange={(e) => setFormData({ ...formData, priceRangeMax: e.target.value })}
                    placeholder="e.g., 200000"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Will display as: {formData.priceRangeMin && formData.priceRangeMax
                  ? `${Number(formData.priceRangeMin).toLocaleString()} - ${Number(formData.priceRangeMax).toLocaleString()} RWF`
                  : "Price range will appear here"}
              </p>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your service in detail. This will be shown to customers..."
                  rows={6}
                />
              </div>

              <div>
                <Label>Specialties</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={currentSpecialty}
                    onChange={(e) => setCurrentSpecialty(e.target.value)}
                    placeholder="e.g., Intore Dance, Traditional Music"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
                  />
                  <Button type="button" onClick={addSpecialty}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {specialty}
                      <button
                        type="button"
                        onClick={() => removeSpecialty(specialty)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="verified"
                      checked={formData.verified}
                      onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    />
                    <Label htmlFor="verified" className="cursor-pointer">Verified Service</Label>
                  </div>
                  <Select value={formData.status} onValueChange={(v: "draft" | "active") => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Packages & Pricing */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Service Packages</CardTitle>
                  <CardDescription>Create pricing packages for your service</CardDescription>
                </div>
                <Button onClick={handleAddPackage}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Package
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.packages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No packages created yet. Click "Add Package" to create your first pricing package.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.packages.map((pkg) => (
                    <Card key={pkg.id} className={pkg.popular ? "border-primary border-2" : ""}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle>{pkg.name}</CardTitle>
                            {pkg.popular && (
                              <Badge variant="default" className="text-xs">Most Popular</Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditPackage(pkg)}>
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => removePackage(pkg.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">{pkg.description}</p>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-2xl font-bold">{pkg.price.toLocaleString()} RWF</span>
                            <span className="text-sm text-muted-foreground">• {pkg.duration}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Features</Label>
                          <div className="flex gap-2 mt-2 mb-2">
                            <Input
                              value={currentFeature.packageId === pkg.id ? currentFeature.feature : ""}
                              onChange={(e) => setCurrentFeature({ packageId: pkg.id, feature: e.target.value })}
                              placeholder="Add a feature..."
                              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPackageFeature(pkg.id, currentFeature.feature))}
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => addPackageFeature(pkg.id, currentFeature.feature)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <ul className="space-y-1">
                            {pkg.features.map((feature, index) => (
                              <li key={index} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                                <span className="flex items-center gap-2">
                                  <Check className="w-3 h-3 text-primary" />
                                  {feature}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removePackageFeature(pkg.id, index)}
                                  className="text-destructive hover:underline"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Gallery */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gallery</CardTitle>
                  <CardDescription>Upload images and videos to showcase your service</CardDescription>
                </div>
                <div className="flex gap-2">
                  <input
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "image")}
                  />
                  <input
                    id="video-upload-input"
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "video")}
                  />
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => addGalleryItem("image")}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Add Images
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => addGalleryItem("video")}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add Videos
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.gallery.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No gallery items yet</p>
                    <p className="text-sm">Upload images or videos to showcase your service</p>
                    <div className="flex gap-2 justify-center mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addGalleryItem("image")}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Upload Images
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addGalleryItem("video")}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Videos
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {formData.gallery.map((item) => (
                        <div key={item.id} className="relative aspect-video bg-muted rounded-lg overflow-hidden group">
                          {item.type === "image" && item.preview ? (
                            <img
                              src={item.preview}
                              alt={`Gallery item ${item.id}`}
                              className="w-full h-full object-cover"
                            />
                          ) : item.type === "video" ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 relative">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <PlayCircle className="w-12 h-12 text-white opacity-75" />
                              </div>
                              <div className="absolute bottom-2 left-2 right-2">
                                <p className="text-xs text-white truncate bg-black/50 px-2 py-1 rounded">
                                  {item.file?.name || "Video"}
                                </p>
                                <p className="text-xs text-white/80 bg-black/50 px-2 py-1 rounded mt-1">
                                  {item.file ? `${(item.file.size / (1024 * 1024)).toFixed(2)} MB` : ""}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-12 h-12 opacity-50" />
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => removeGalleryItem(item.id)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <Badge className="absolute bottom-2 left-2 text-xs capitalize bg-black/70 text-white border-none">
                            {item.type}
                          </Badge>

                          {item.file && (
                            <div className="absolute top-2 left-2 max-w-[60%]">
                              <p className="text-xs text-white bg-black/70 px-2 py-1 rounded truncate" title={item.file.name}>
                                {item.file.name}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addGalleryItem("image")}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Add More Images
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addGalleryItem("video")}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Add More Videos
                      </Button>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Upload Guidelines:</strong>
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Images: JPG, PNG, GIF (Max 10MB per file)</li>
                  <li>Videos: MP4, MOV, AVI (Max 50MB per file)</li>
                  <li>You can upload multiple files at once</li>
                  <li>First image/video will be used as the main display</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Contact Info */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Contact details shown in the "About" tab of your service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+250 788 123 456"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@example.com"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review & Publish */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Publish</CardTitle>
              <CardDescription>Review all information before publishing your service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info Review */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Service Name</p>
                    <p className="font-medium">{formData.name || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">{formData.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{formData.location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price Range</p>
                    <p className="font-medium">
                      {formData.priceRangeMin && formData.priceRangeMax
                        ? `${Number(formData.priceRangeMin).toLocaleString()} - ${Number(formData.priceRangeMax).toLocaleString()} RWF`
                        : "Not set"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-muted-foreground">Description</p>
                    <p className="font-medium">{formData.description || "Not set"}</p>
                  </div>
                  {formData.specialties.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-muted-foreground mb-2">Specialties</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.specialties.map((spec, idx) => (
                          <Badge key={idx} variant="secondary">{spec}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" checked={formData.verified} readOnly />
                      <Label>Verified Service</Label>
                    </div>
                    <Badge variant={formData.status === "active" ? "default" : "secondary"}>
                      Status: {formData.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Packages Review */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Packages ({formData.packages.length})</h3>
                {formData.packages.length === 0 ? (
                  <p className="text-muted-foreground">No packages created</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {formData.packages.map((pkg) => (
                      <Card key={pkg.id} className={pkg.popular ? "border-primary" : ""}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{pkg.name}</CardTitle>
                            {pkg.popular && <Badge>Most Popular</Badge>}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-muted-foreground">{pkg.description}</p>
                          <p className="text-2xl font-bold">{pkg.price.toLocaleString()} RWF</p>
                          <p className="text-sm text-muted-foreground">Duration: {pkg.duration}</p>
                          <div className="pt-2">
                            <p className="text-xs font-medium mb-1">Features:</p>
                            <ul className="text-xs space-y-1">
                              {pkg.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <Check className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Gallery Review */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Gallery ({formData.gallery.length} items)</h3>
                {formData.gallery.length === 0 ? (
                  <p className="text-muted-foreground">No gallery items added</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {formData.gallery.map((item) => (
                      <div key={item.id} className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Contact Review */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{formData.phone || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{formData.email || "Not set"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </div>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext} disabled={isUploading}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleSubmit("draft")}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isUploading ? "Uploading..." : "Save Draft"}
                </Button>
                <Button 
                  onClick={() => handleSubmit("active")}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  {isUploading ? "Publishing..." : "Publish Service"}
                </Button>
              </div>
            )}
            
            {isUploading && (
              <div className="mt-2 space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">{uploadProgress}% Complete</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Package Dialog */}
      <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPackage ? "Edit Package" : "Create New Package"}</DialogTitle>
          </DialogHeader>
          <PackageFormDialog
            initialData={editingPackage || undefined}
            onSave={handleSavePackage}
            onCancel={() => {
              setIsPackageDialogOpen(false)
              setEditingPackage(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Package Form Dialog Component
interface PackageFormDialogProps {
  initialData?: Partial<ServicePackage>
  onSave: (data: Omit<ServicePackage, "id">) => void
  onCancel: () => void
}

function PackageFormDialog({ initialData, onSave, onCancel }: PackageFormDialogProps) {
  const [pkgData, setPkgData] = useState({
    name: initialData?.name || "",
    price: initialData?.price || 0,
    duration: initialData?.duration || "",
    description: initialData?.description || "",
    popular: initialData?.popular || false,
  })

  const handleSubmit = () => {
    if (!pkgData.name || !pkgData.price || !pkgData.duration || !pkgData.description) {
      alert("Please fill in all required fields")
      return
    }
    onSave({
      ...pkgData,
      features: initialData?.features || []
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pkg-name">Package Name *</Label>
        <Input
          id="pkg-name"
          value={pkgData.name}
          onChange={(e) => setPkgData({ ...pkgData, name: e.target.value })}
          placeholder="e.g., Basic Package, Standard Package"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pkg-price">Price (RWF) *</Label>
          <Input
            id="pkg-price"
            type="number"
            value={pkgData.price}
            onChange={(e) => setPkgData({ ...pkgData, price: Number(e.target.value) })}
            placeholder="120000"
          />
        </div>

        <div>
          <Label htmlFor="pkg-duration">Duration *</Label>
          <Input
            id="pkg-duration"
            value={pkgData.duration}
            onChange={(e) => setPkgData({ ...pkgData, duration: e.target.value })}
            placeholder="e.g., 2 hours, 3 hours"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="pkg-description">Description *</Label>
        <Textarea
          id="pkg-description"
          value={pkgData.description}
          onChange={(e) => setPkgData({ ...pkgData, description: e.target.value })}
          placeholder="Brief description of this package"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="pkg-popular"
          checked={pkgData.popular}
          onChange={(e) => setPkgData({ ...pkgData, popular: e.target.checked })}
        />
        <Label htmlFor="pkg-popular" className="cursor-pointer">Mark as "Most Popular"</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button className="flex-1" onClick={handleSubmit}>
          Save Package
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

