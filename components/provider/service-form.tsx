"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Save, X, MapPin, Star, Image as ImageIcon, Upload, Check, ChevronRight, ChevronLeft, CheckCircle, PlayCircle, Loader2, Film, Camera, Tag, Calendar, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiClient } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { MediaValidator, ValidationResult } from "@/lib/mediaValidator"

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
  type: "image" | "video" | "reel"
  contentType: null | "offer" | "event"
  url: string
  thumbnail?: string
  file?: File
  preview?: string // For local preview
  title: string
  description: string
}

export interface ServiceFormData {
  // Basic Info
  name: string
  category: string
  categoryId: string  // Add category ID
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
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5
  const [currentSpecialty, setCurrentSpecialty] = useState("")
  const [currentFeature, setCurrentFeature] = useState<{ packageId: string; feature: string }>({ packageId: "", feature: "" })
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null)
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null)
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]) // Track which files are being uploaded
  const [activeMediaTab, setActiveMediaTab] = useState<"image" | "video" | "reel">("image")
  const [activeContentTab, setActiveContentTab] = useState<"offer" | "event">("offer")
  const [galleryItemForm, setGalleryItemForm] = useState({
    title: "",
    description: ""
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<ServiceFormData>({
    name: initialData?.name || "",
    category: initialData?.category || "",
    categoryId: initialData?.categoryId || "",
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

  const [categories, setCategories] = useState<Array<{id: string, name: string, slug: string}>>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  const locations = [
    "Kigali", "Butare", "Gisenyi", "Musanze", "Huye", "Rwamagana", "Other"
  ]

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
        const response = await fetch(`${API_BASE_URL}/api/v1/public/categories`)
        const data = await response.json()
        setCategories(data || [])
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load categories. Please refresh the page."
        })
      } finally {
        setIsLoadingCategories(false)
      }
    }
    
    fetchCategories()
  }, [])

  const addSpecialty = () => {
    if (currentSpecialty.trim() && !formData.specialties.includes(currentSpecialty.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, currentSpecialty.trim()]
      })
      setCurrentSpecialty("")
      toast({
        title: "Specialty Added",
        description: `"${currentSpecialty.trim()}" has been added to your specialties.`
      })
    } else if (formData.specialties.includes(currentSpecialty.trim())) {
      toast({
        variant: "destructive",
        title: "Duplicate Specialty",
        description: "This specialty already exists in your list."
      })
    }
  }

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter(s => s !== specialty)
    })
    toast({
      title: "Specialty Removed",
      description: `"${specialty}" has been removed from your specialties.`
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video" | "reel", contentType?: "offer" | "event") => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newItems: GalleryItem[] = []
    let hasErrors = false

    for (const file of Array.from(files)) {
      // Pre-upload validation
      let validationResult: ValidationResult;
      
      try {
        if (type === "reel" || type === "video") {
          validationResult = await MediaValidator.validateReel(file);
        } else {
          validationResult = await MediaValidator.validateImage(file);
        }

        // Check if validation passed
        if (!validationResult.valid) {
          // Show all errors
          validationResult.errors.forEach(error => {
            toast({
              variant: "destructive",
              title: "Upload Rejected",
              description: error
            });
          });
          hasErrors = true;
          continue;
        }

        // Show warnings if any
        if (validationResult.warnings && validationResult.warnings.length > 0) {
          validationResult.warnings.forEach(warning => {
            toast({
              title: "Upload Warning",
              description: warning,
              variant: "default"
            });
          });
        }

        // Show validation success with metadata
        if (validationResult.metadata) {
          const meta = validationResult.metadata;
          let successMessage = `✅ Validation passed`;
          
          if (type === "reel" || type === "video") {
            successMessage += `\n📐 ${meta.width}×${meta.height} (${meta.aspectRatio})`;
            if (meta.duration) {
              successMessage += `\n⏱️ ${MediaValidator.formatDuration(meta.duration)}`;
            }
          } else {
            successMessage += `\n📐 ${meta.width}×${meta.height}`;
          }
          
          if (meta.fileSize) {
            successMessage += `\n📦 ${MediaValidator.formatFileSize(meta.fileSize)}`;
          }

          toast({
            title: "Media Validated",
            description: successMessage,
          });
        }

      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.message || "Failed to validate media file"
        });
        hasErrors = true;
        continue;
      }

      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined

      const newItem: GalleryItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type,
        contentType: contentType || activeContentTab,
        url: "", // Will be set after upload to server
        file,
        preview,
        title: galleryItemForm.title || "",
        description: galleryItemForm.description || ""
      }

      newItems.push(newItem)
    }

    if (newItems.length > 0) {
      setFormData({
        ...formData,
        gallery: [...formData.gallery, ...newItems]
      })

      toast({
        title: "Files Added Successfully",
        description: `${newItems.length} ${type}(s) added to your gallery.`
      })

      // Reset form
      setGalleryItemForm({ title: "", description: "" })
    }
    
    // Reset input
    e.target.value = ""
  }

  const addGalleryItem = (type: "image" | "video" | "reel") => {
    // Trigger file input click
    const inputId = type === "image" ? "image-upload-input" : type === "reel" ? "reel-upload-input" : "video-upload-input"
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
    toast({
      title: "Media Removed",
      description: "The media item has been removed from your gallery."
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
    const pkg = formData.packages.find(p => p.id === id)
    setFormData({
      ...formData,
      packages: formData.packages.filter(p => p.id !== id)
    })
    toast({
      title: "Package Removed",
      description: `"${pkg?.name || "Package"}" has been removed.`
    })
  }

  const addPackageFeature = (packageId: string, feature: string) => {
    if (!feature.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Feature",
        description: "Please enter a feature description."
      })
      return
    }
    setFormData({
      ...formData,
      packages: formData.packages.map(p =>
        p.id === packageId
          ? { ...p, features: [...p.features, feature.trim()] }
          : p
      )
    })
    setCurrentFeature({ packageId: "", feature: "" })
    toast({
      title: "Feature Added",
      description: "The feature has been added to the package."
    })
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
    const errors: Record<string, string> = {}
    
    switch (step) {
      case 1: // Basic Information
        if (!formData.name?.trim()) {
          errors.name = "Service name is required"
        }
        if (!formData.categoryId) {
          errors.category = "Category is required"
        }
        if (!formData.location) {
          errors.location = "Location is required"
        }
        if (!formData.description?.trim()) {
          errors.description = "Description is required"
        } else if (formData.description.trim().length < 50) {
          errors.description = "Description must be at least 50 characters"
        }
        if (!formData.priceRangeMin || Number(formData.priceRangeMin) <= 0) {
          errors.priceRangeMin = "Minimum price is required and must be greater than 0"
        }
        if (!formData.priceRangeMax || Number(formData.priceRangeMax) <= 0) {
          errors.priceRangeMax = "Maximum price is required and must be greater than 0"
        }
        if (formData.priceRangeMin && formData.priceRangeMax && Number(formData.priceRangeMin) > Number(formData.priceRangeMax)) {
          errors.priceRangeMax = "Maximum price must be greater than minimum price"
        }
        
        setValidationErrors(errors)
        
        if (Object.keys(errors).length > 0) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please fix the errors in the form before continuing."
          })
          return false
        }
        return true
        
      case 2: // Packages
        if (formData.packages.length === 0) {
          toast({
            variant: "destructive",
            title: "No Packages Created",
            description: "Please create at least one package for your service."
          })
          return false
        }
        return true
        
      case 3: // Gallery - Require at least 2 photos
        const photoCount = formData.gallery.filter(item => item.type === "image").length
        if (photoCount < 2) {
          toast({
            variant: "destructive",
            title: "Photos Required",
            description: `Please add at least 2 photos to showcase your service. You currently have ${photoCount} photo${photoCount === 1 ? '' : 's'}.`
          })
          return false
        }
        return true
        
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
        setValidationErrors({})
        toast({
          title: "Step Completed",
          description: `Moving to ${stepLabels[currentStep]}`
        })
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const uploadGalleryImages = async (serviceId?: string): Promise<GalleryItem[]> => {
    /**
     * Upload gallery items to Cloudinary and return updated items with URLs and thumbnails
     * Only uploads items that have files (not already uploaded)
     */
    const filesToUpload = formData.gallery.filter(item => item.file && !item.url)
    
    if (filesToUpload.length === 0) {
      // Return existing gallery items
      return formData.gallery
    }

    try {
      const uploadResults: Array<{ url: string; thumbnail?: string }> = []
      setUploadingFiles([]) // Reset uploading files list
      
      // Upload image files
      const imageFiles = filesToUpload.filter(item => item.type === "image")
      console.log(`Found ${imageFiles.length} image files to upload`)
      for (const item of imageFiles) {
        if (!item.file) continue
        console.log(`Uploading image: ${item.file.name}, size: ${item.file.size} bytes`)
        setUploadingFiles(prev => [...prev, item.file!.name])
        try {
          const response = await apiClient.upload.general<any>(item.file, "ubukwe/gallery", "image")
          console.log("Image upload response:", response)
          console.log("Response data:", response.data)
          console.log("Response data type:", typeof response.data)
          console.log("Response data keys:", response.data ? Object.keys(response.data) : 'no data')
          
          // The backend returns FileUploadResponse which has url at top level
          // The API client wraps it as: { status: 'success', data: { success: true, url: "..." } }
          const imageUrl = response.data?.url;
          
          console.log("Extracted image URL:", imageUrl)
          
          if (imageUrl) {
            // Generate thumbnail URL from Cloudinary
            const thumbnailUrl = imageUrl.replace('/upload/', '/upload/c_thumb,w_200/')
            uploadResults.push({ 
              url: imageUrl,
              thumbnail: thumbnailUrl
            })
            console.log(`✅ Image uploaded successfully: ${imageUrl}`)
          } else {
            console.error(`❌ Image upload failed - no URL found in response:`, response)
            console.error("Full response structure:", JSON.stringify(response, null, 2))
            throw new Error(`Failed to upload image: ${item.file.name} - No URL in response`)
          }
        } catch (error) {
          console.error(`❌ Image upload error for ${item.file.name}:`, error)
          throw error
        } finally {
          setUploadingFiles(prev => prev.filter(name => name !== item.file!.name))
        }
      }

      // Upload reel files
      const reelFiles = filesToUpload.filter(item => item.type === "reel")
      console.log(`Found ${reelFiles.length} reel files to upload`)
      for (const item of reelFiles) {
        if (!item.file) continue
        console.log(`Uploading reel: ${item.file.name}, size: ${item.file.size} bytes`)
        setUploadingFiles(prev => [...prev, item.file!.name])
        try {
          const response = await apiClient.upload.general<any>(item.file, "ubukwe/reels", "video")
          console.log("Reel upload response:", response)
          console.log("Reel response data:", response.data)
          
          // The backend returns FileUploadResponse which has url at top level
          // The API client wraps it as: { status: 'success', data: { success: true, url: "..." } }
          const reelUrl = response.data?.url;
          
          console.log("Extracted reel URL:", reelUrl)
          
          if (reelUrl) {
            // Generate thumbnail URL for video
            const thumbnailUrl = reelUrl.replace('/upload/', '/upload/so_0/').replace(/\.[^.]+$/, '.jpg')
            uploadResults.push({ 
              url: reelUrl,
              thumbnail: thumbnailUrl
            })
            console.log(`✅ Reel uploaded successfully: ${reelUrl}`)
          } else {
            console.error(`❌ Reel upload failed - no URL found in response:`, response)
            console.error("Full reel response structure:", JSON.stringify(response, null, 2))
            throw new Error(`Failed to upload reel: ${item.file.name} - No URL in response`)
          }
        } catch (error) {
          console.error(`❌ Reel upload error for ${item.file.name}:`, error)
          throw error
        } finally {
          setUploadingFiles(prev => prev.filter(name => name !== item.file!.name))
        }
      }

      // Upload video files
      const videoFiles = filesToUpload.filter(item => item.type === "video")
      console.log(`Found ${videoFiles.length} video files to upload`)
      for (const item of videoFiles) {
        if (!item.file) continue
        console.log(`Uploading video: ${item.file.name}, size: ${item.file.size} bytes`)
        setUploadingFiles(prev => [...prev, item.file!.name])
        try {
          const response = await apiClient.upload.general<any>(item.file, "ubukwe/videos", "video")
          console.log("Video upload response:", response)
          console.log("Video response data:", response.data)
          
          // The backend returns FileUploadResponse which has url at top level
          // The API client wraps it as: { status: 'success', data: { success: true, url: "..." } }
          const videoUrl = response.data?.url;
          
          console.log("Extracted video URL:", videoUrl)
          
          if (videoUrl) {
            // Generate thumbnail URL for video
            const thumbnailUrl = videoUrl.replace('/upload/', '/upload/so_0/').replace(/\.[^.]+$/, '.jpg')
            uploadResults.push({ 
              url: videoUrl,
              thumbnail: thumbnailUrl
            })
            console.log(`✅ Video uploaded successfully: ${videoUrl}`)
          } else {
            console.error(`❌ Video upload failed - no URL found in response:`, response)
            console.error("Full video response structure:", JSON.stringify(response, null, 2))
            throw new Error(`Failed to upload video: ${item.file.name} - No URL in response`)
          }
        } catch (error) {
          console.error(`❌ Video upload error for ${item.file.name}:`, error)
          throw error
        } finally {
          setUploadingFiles(prev => prev.filter(name => name !== item.file!.name))
        }
      }

      console.log("All upload results:", uploadResults)
      console.log(`Expected ${filesToUpload.length} uploads, got ${uploadResults.length} results`)

      // Validate we got results for all files
      if (uploadResults.length !== filesToUpload.length) {
        throw new Error(`Upload mismatch: Expected ${filesToUpload.length} uploads but only got ${uploadResults.length} results`)
      }

      // Create a mapping of files to upload results
      const uploadResultsMap = new Map()
      let resultIndex = 0
      
      // Map image results
      for (const item of imageFiles) {
        if (item.file && resultIndex < uploadResults.length) {
          uploadResultsMap.set(item.id, uploadResults[resultIndex])
          resultIndex++
        }
      }
      
      // Map reel results
      for (const item of reelFiles) {
        if (item.file && resultIndex < uploadResults.length) {
          uploadResultsMap.set(item.id, uploadResults[resultIndex])
          resultIndex++
        }
      }
      
      // Map video results
      for (const item of videoFiles) {
        if (item.file && resultIndex < uploadResults.length) {
          uploadResultsMap.set(item.id, uploadResults[resultIndex])
          resultIndex++
        }
      }

      console.log("Upload results mapping:", uploadResultsMap)

      // Update formData with uploaded URLs and thumbnails
      const updatedGallery = formData.gallery.map(item => {
        if (item.file && !item.url && uploadResultsMap.has(item.id)) {
          const result = uploadResultsMap.get(item.id)
          console.log(`Mapping result for item ${item.id}:`, result)
          return { 
            ...item, 
            url: result?.url || "",
            thumbnail: result?.thumbnail
          }
        }
        return item
      })

      console.log("Updated gallery after upload:", updatedGallery)

      setFormData({
        ...formData,
        gallery: updatedGallery
      })

      return updatedGallery
    } catch (error: any) {
      console.error("Gallery upload error:", error)
      const errorMessage = error?.response?.data?.detail || error?.message || "Unknown error"
      throw new Error(`Upload failed: ${errorMessage}`)
    }
  }

  const handleSubmit = async (status?: "draft" | "active") => {
    // Final validation
    if (!formData.name || !formData.categoryId || !formData.location || !formData.description) {
      toast({
        variant: "destructive",
        title: "Missing Required Fields",
        description: "Please fill in all required fields (Name, Category, Location, Description)"
      })
      return
    }

    if (formData.packages.length === 0) {
      toast({
        variant: "destructive",
        title: "No Packages",
        description: "Please create at least one package before publishing."
      })
      return
    }

    // Validate gallery - require at least 2 photos
    if (formData.gallery.length < 2) {
      toast({
        variant: "destructive",
        title: "Gallery Required",
        description: "Please add at least 2 photos to showcase your service."
      })
      return
    }

    // Count photos (images only, not videos/reels)
    const photoCount = formData.gallery.filter(item => item.type === "image").length
    if (photoCount < 2) {
      toast({
        variant: "destructive",
        title: "Photos Required",
        description: `Please add at least 2 photos. You currently have ${photoCount} photo${photoCount === 1 ? '' : 's'}.`
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      console.log("=== BEFORE UPLOAD ===")
      console.log("Gallery items count:", formData.gallery.length)
      console.log("Gallery items:", formData.gallery.map(g => ({
        id: g.id,
        type: g.type,
        hasFile: !!g.file,
        hasUrl: !!g.url,
        fileName: g.file?.name
      })))
      
      toast({
        title: "Uploading Service",
        description: "Please wait while we upload your service and media files..."
      })

      // Step 1: Upload gallery images if there are any with files
      const galleryUrls = await uploadGalleryImages()
      setUploadProgress(50)

      console.log("=== AFTER UPLOAD ===")
      console.log("Gallery URLs count:", galleryUrls.length)
      console.log("Gallery URLs:", galleryUrls.map(g => ({
        id: g.id,
        type: g.type,
        hasUrl: !!g.url,
        url: g.url
      })))

      // Validate gallery is not empty after upload
      if (!galleryUrls || galleryUrls.length === 0) {
        throw new Error("Gallery upload failed - no media items were uploaded. Please try again.")
      }

      // Validate we still have at least 2 photos after upload
      const uploadedPhotoCount = galleryUrls.filter(item => item.type === "image").length
      if (uploadedPhotoCount < 2) {
        throw new Error(`Only ${uploadedPhotoCount} photo(s) were uploaded successfully. Please ensure at least 2 photos are uploaded.`)
      }

      // Step 2: Create the final data with uploaded gallery URLs
      const finalData = {
        ...formData,
        gallery: galleryUrls.map(item => ({ 
          id: item.id,
          type: item.type,
          contentType: item.contentType || null,
          url: item.url || "",
          thumbnail: item.thumbnail,
          title: item.title || "",
          description: item.description || ""
        })),
        status: status || formData.status
      }

      // Final validation: Check payload gallery is not empty before sending to backend
      if (!finalData.gallery || finalData.gallery.length === 0) {
        throw new Error("Gallery data is empty in payload. Cannot submit service without media.")
      }

      // Final validation: Check payload has at least 2 photos
      const finalPhotoCount = finalData.gallery.filter(i => i.type === "image").length
      if (finalPhotoCount < 2) {
        throw new Error(`Payload validation failed: Only ${finalPhotoCount} photo(s) in final data. At least 2 photos required.`)
      }

      setUploadProgress(75)

      // Log the complete payload for debugging
      console.log("=== SERVICE FORM PAYLOAD ===")
      console.log(JSON.stringify(finalData, null, 2))
      console.log("=== GALLERY STATISTICS ===")
      console.log(`Total Items: ${finalData.gallery.length}`)
      console.log(`Images: ${finalData.gallery.filter(i => i.type === "image").length}`)
      console.log(`Reels: ${finalData.gallery.filter(i => i.type === "reel").length}`)
      console.log(`Videos: ${finalData.gallery.filter(i => i.type === "video").length}`)
      console.log(`Offers: ${finalData.gallery.filter(i => i.contentType === "offer").length}`)
      console.log(`Events: ${finalData.gallery.filter(i => i.contentType === "event").length}`)
      console.log("===========================")

      // Step 3: Save the service with gallery URLs
      if (onSave) {
        onSave(finalData)
      } else {
        console.log("Service Data with uploaded gallery:", finalData)
      }

      setUploadProgress(100)

      // Success toast
      toast({
        title: status === "active" 
          ? (initialData ? "Service Updated & Published!" : "Service Published!") 
          : (initialData ? "Service Updated!" : "Service Saved!"),
        description: status === "active" 
          ? (initialData 
              ? "Your service changes are now live and visible to customers." 
              : "Your service is now live and visible to customers."
            )
          : (initialData 
              ? "Your service changes have been saved as a draft." 
              : "Your service has been saved as a draft. You can publish it later."
            )
      })
    } catch (error: any) {
      console.error("Submit error:", error)
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to save service. Please try again."
      })
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
          <h2 className="text-2xl font-bold">
            {initialData ? "Edit Service" : "Create New Service"}
          </h2>
          <p className="text-muted-foreground">
            {initialData 
              ? "Update your service information and settings" 
              : "Complete all steps to create a service that customers will see"
            }
          </p>
        </div>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            {initialData ? "Cancel Edit" : "Cancel"}
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
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (validationErrors.name) {
                      setValidationErrors({ ...validationErrors, name: "" })
                    }
                  }}
                  placeholder="e.g., Traditional Intore Dancers"
                  className={validationErrors.name ? "border-red-500" : ""}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(categoryId) => {
                      const selectedCategory = categories.find(cat => cat.id === categoryId)
                      setFormData({ 
                        ...formData, 
                        categoryId: categoryId,
                        category: selectedCategory?.name || ""
                      })
                    }}
                    disabled={isLoadingCategories}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
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
                    onChange={(e) => {
                      setFormData({ ...formData, priceRangeMin: e.target.value })
                      if (validationErrors.priceRangeMin) {
                        setValidationErrors({ ...validationErrors, priceRangeMin: "" })
                      }
                    }}
                    placeholder="e.g., 120000"
                    className={validationErrors.priceRangeMin ? "border-red-500" : ""}
                  />
                  {validationErrors.priceRangeMin && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.priceRangeMin}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="priceMax">Maximum Price (RWF) *</Label>
                  <Input
                    id="priceMax"
                    type="number"
                    value={formData.priceRangeMax}
                    onChange={(e) => {
                      setFormData({ ...formData, priceRangeMax: e.target.value })
                      if (validationErrors.priceRangeMax) {
                        setValidationErrors({ ...validationErrors, priceRangeMax: "" })
                      }
                    }}
                    placeholder="e.g., 200000"
                    className={validationErrors.priceRangeMax ? "border-red-500" : ""}
                  />
                  {validationErrors.priceRangeMax && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.priceRangeMax}
                    </p>
                  )}
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
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value })
                    if (validationErrors.description) {
                      setValidationErrors({ ...validationErrors, description: "" })
                    }
                  }}
                  placeholder="Describe your service in detail. This will be shown to customers..."
                  rows={6}
                  className={validationErrors.description ? "border-red-500" : ""}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length} characters (minimum 50 required)
                  </p>
                  {validationErrors.description && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.description}
                    </p>
                  )}
                </div>
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
              <CardTitle>Media Gallery</CardTitle>
              <CardDescription>Showcase your service with images, reels, videos, offers, and events</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="media" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="media" className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Media Content
                  </TabsTrigger>
                  <TabsTrigger value="promotional" className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Promotional Content
                  </TabsTrigger>
                </TabsList>

                {/* Media Content Tab */}
                <TabsContent value="media" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Media Type</h3>
                        <p className="text-sm text-muted-foreground">Choose the type of media you want to upload</p>
                      </div>
                    </div>

                    {/* Media Type Tabs */}
                    <Tabs value={activeMediaTab} onValueChange={(v) => setActiveMediaTab(v as "image" | "video" | "reel")} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="image" className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Images
                        </TabsTrigger>
                        <TabsTrigger value="reel" className="flex items-center gap-2">
                          <Film className="w-4 h-4" />
                          Reels
                        </TabsTrigger>
                        <TabsTrigger value="video" className="flex items-center gap-2">
                          <PlayCircle className="w-4 h-4" />
                          Videos
                        </TabsTrigger>
                      </TabsList>

                      {/* Image Upload */}
                      <TabsContent value="image" className="space-y-4 mt-6">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/20 hover:bg-muted/40 transition-colors">
                          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h4 className="font-semibold mb-2">Upload Images</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Showcase your service with high-quality images
                          </p>
                          <input
                            id="image-upload-input"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "image")}
                          />
                          <Button onClick={() => addGalleryItem("image")}>
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Images
                          </Button>
                          <p className="text-xs text-muted-foreground mt-3">
                            JPG, PNG, GIF • Max 10MB per file • Multiple files supported
                          </p>
                        </div>
                      </TabsContent>

                      {/* Reel Upload */}
                      <TabsContent value="reel" className="space-y-4 mt-6">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/20 hover:bg-muted/40 transition-colors">
                          <Film className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h4 className="font-semibold mb-2">Upload Reels</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Short-form vertical videos perfect for social media (9:16 aspect ratio recommended)
                          </p>
                          <input
                            id="reel-upload-input"
                            type="file"
                            accept="video/*,image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "reel")}
                          />
                          <Button onClick={() => addGalleryItem("reel")}>
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Reels
                          </Button>
                          <p className="text-xs text-muted-foreground mt-3">
                            MP4, MOV • Max 50MB per file • 15-60 seconds recommended
                          </p>
                        </div>
                      </TabsContent>

                      {/* Video Upload */}
                      <TabsContent value="video" className="space-y-4 mt-6">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/20 hover:bg-muted/40 transition-colors">
                          <PlayCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h4 className="font-semibold mb-2">Upload Videos</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Full-length videos showcasing your service in action
                          </p>
                          <input
                            id="video-upload-input"
                            type="file"
                            accept="video/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "video")}
                          />
                          <Button onClick={() => addGalleryItem("video")}>
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Videos
                          </Button>
                          <p className="text-xs text-muted-foreground mt-3">
                            MP4, MOV, AVI • Max 50MB per file • HD quality recommended
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Display uploaded media */}
                    {formData.gallery.filter(item => !item.contentType || item.contentType === "offer").length > 0 && (
                      <div className="space-y-3">
                        <Separator />
                        <h4 className="font-semibold">Uploaded Media</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {formData.gallery
                            .filter(item => !item.contentType || item.contentType === "offer")
                            .map((item) => (
                              <div key={item.id} className="relative aspect-video bg-muted rounded-lg overflow-hidden group border-2 border-border hover:border-primary transition-colors">
                                {item.type === "image" && item.preview ? (
                                  <img
                                    src={item.preview}
                                    alt={item.title || `Gallery item ${item.id}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (item.type === "video" || item.type === "reel") ? (
                                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      {item.type === "reel" ? (
                                        <Film className="w-12 h-12 text-white opacity-75" />
                                      ) : (
                                        <PlayCircle className="w-12 h-12 text-white opacity-75" />
                                      )}
                                    </div>
                                    <div className="absolute bottom-2 left-2 right-2">
                                      <p className="text-xs text-white truncate bg-black/70 px-2 py-1 rounded">
                                        {item.file?.name || item.type}
                                      </p>
                                      {item.file && (
                                        <p className="text-xs text-white/80 bg-black/70 px-2 py-1 rounded mt-1">
                                          {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                      )}
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
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Promotional Content Tab */}
                <TabsContent value="promotional" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Promotional Content</h3>
                      <p className="text-sm text-muted-foreground">Create special offers and event announcements</p>
                    </div>

                    {/* Content Type Tabs */}
                    <Tabs value={activeContentTab} onValueChange={(v) => setActiveContentTab(v as "offer" | "event")} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="offer" className="flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Special Offers
                        </TabsTrigger>
                        <TabsTrigger value="event" className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Events
                        </TabsTrigger>
                      </TabsList>

                      {/* Offer Content */}
                      <TabsContent value="offer" className="space-y-4 mt-6">
                        <Card className="border-2 border-primary/20 bg-primary/5">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Tag className="w-5 h-5 text-primary" />
                              Create Special Offer
                            </CardTitle>
                            <CardDescription>
                              Promote discounts, packages, or limited-time deals to attract customers
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label htmlFor="offer-title">Offer Title</Label>
                              <Input
                                id="offer-title"
                                value={galleryItemForm.title}
                                onChange={(e) => setGalleryItemForm({ ...galleryItemForm, title: e.target.value })}
                                placeholder="e.g., 20% Off Wedding Photography Package"
                              />
                            </div>
                            <div>
                              <Label htmlFor="offer-description">Offer Description</Label>
                              <Textarea
                                id="offer-description"
                                value={galleryItemForm.description}
                                onChange={(e) => setGalleryItemForm({ ...galleryItemForm, description: e.target.value })}
                                placeholder="Describe your special offer, terms, and conditions..."
                                rows={4}
                              />
                            </div>
                            <div className="space-y-3">
                              <Label>Upload Offer Media</Label>
                              <p className="text-sm text-muted-foreground">Choose the type of media to showcase your offer</p>
                              
                              {/* Hidden file inputs */}
                              <input
                                id="offer-image-input"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, "image", "offer")}
                              />
                              <input
                                id="offer-reel-input"
                                type="file"
                                accept="video/*,image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, "reel", "offer")}
                              />
                              <input
                                id="offer-video-input"
                                type="file"
                                accept="video/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, "video", "offer")}
                              />
                              
                              <div className="grid grid-cols-3 gap-3">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                                  onClick={() => document.getElementById("offer-image-input")?.click()}
                                >
                                  <ImageIcon className="w-6 h-6" />
                                  <span className="text-xs font-medium">Upload Image</span>
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                                  onClick={() => document.getElementById("offer-reel-input")?.click()}
                                >
                                  <Film className="w-6 h-6" />
                                  <span className="text-xs font-medium">Upload Reel</span>
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-24 flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                                  onClick={() => document.getElementById("offer-video-input")?.click()}
                                >
                                  <PlayCircle className="w-6 h-6" />
                                  <span className="text-xs font-medium">Upload Video</span>
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Images: Max 10MB • Videos/Reels: Max 50MB • Multiple files supported
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Event Content */}
                      <TabsContent value="event" className="space-y-4 mt-6">
                        <Card className="border-2 border-purple-500/20 bg-purple-500/5">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-purple-600" />
                              Create Event Announcement
                            </CardTitle>
                            <CardDescription>
                              Announce upcoming events, workshops, or showcases related to your service
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label htmlFor="event-title">Event Title</Label>
                              <Input
                                id="event-title"
                                value={galleryItemForm.title}
                                onChange={(e) => setGalleryItemForm({ ...galleryItemForm, title: e.target.value })}
                                placeholder="e.g., Traditional Dance Workshop - March 2026"
                              />
                            </div>
                            <div>
                              <Label htmlFor="event-description">Event Description</Label>
                              <Textarea
                                id="event-description"
                                value={galleryItemForm.description}
                                onChange={(e) => setGalleryItemForm({ ...galleryItemForm, description: e.target.value })}
                                placeholder="Describe your event, date, time, location, and what attendees can expect..."
                                rows={4}
                              />
                            </div>
                            <div className="space-y-3">
                              <Label>Upload Event Media</Label>
                              <p className="text-sm text-muted-foreground">Choose the type of media to promote your event</p>
                              
                              {/* Hidden file inputs */}
                              <input
                                id="event-image-input"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, "image", "event")}
                              />
                              <input
                                id="event-reel-input"
                                type="file"
                                accept="video/*,image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, "reel", "event")}
                              />
                              <input
                                id="event-video-input"
                                type="file"
                                accept="video/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, "video", "event")}
                              />
                              
                              <div className="grid grid-cols-3 gap-3">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-24 flex-col gap-2 hover:bg-purple-500/10 hover:border-purple-500 transition-all"
                                  onClick={() => document.getElementById("event-image-input")?.click()}
                                >
                                  <ImageIcon className="w-6 h-6" />
                                  <span className="text-xs font-medium">Upload Image</span>
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-24 flex-col gap-2 hover:bg-purple-500/10 hover:border-purple-500 transition-all"
                                  onClick={() => document.getElementById("event-reel-input")?.click()}
                                >
                                  <Film className="w-6 h-6" />
                                  <span className="text-xs font-medium">Upload Reel</span>
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-24 flex-col gap-2 hover:bg-purple-500/10 hover:border-purple-500 transition-all"
                                  onClick={() => document.getElementById("event-video-input")?.click()}
                                >
                                  <PlayCircle className="w-6 h-6" />
                                  <span className="text-xs font-medium">Upload Video</span>
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Images: Max 10MB • Videos/Reels: Max 50MB • Multiple files supported
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>

                    {/* Display promotional content */}
                    {formData.gallery.filter(item => item.contentType === activeContentTab).length > 0 && (
                      <div className="space-y-3">
                        <Separator />
                        <h4 className="font-semibold">
                          {activeContentTab === "offer" ? "Your Offers" : "Your Events"}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {formData.gallery
                            .filter(item => item.contentType === activeContentTab)
                            .map((item) => (
                              <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                                <div className="relative aspect-video bg-muted">
                                  {item.type === "image" && item.preview ? (
                                    <img
                                      src={item.preview}
                                      alt={item.title || `${item.contentType} item`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (item.type === "video" || item.type === "reel") ? (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                      {item.type === "reel" ? (
                                        <Film className="w-16 h-16 text-white opacity-75" />
                                      ) : (
                                        <PlayCircle className="w-16 h-16 text-white opacity-75" />
                                      )}
                                    </div>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ImageIcon className="w-16 h-16 opacity-50" />
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeGalleryItem(item.id)}
                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    title="Remove"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                  <div className="absolute top-2 left-2 flex gap-2">
                                    <Badge className="capitalize bg-black/70 text-white border-none">
                                      {item.type}
                                    </Badge>
                                    <Badge 
                                      className={`capitalize border-none ${
                                        item.contentType === "offer" 
                                          ? "bg-primary text-primary-foreground" 
                                          : "bg-purple-600 text-white"
                                      }`}
                                    >
                                      {item.contentType}
                                    </Badge>
                                  </div>
                                </div>
                                <CardContent className="p-4">
                                  {item.title && (
                                    <h5 className="font-semibold mb-1 line-clamp-1">{item.title}</h5>
                                  )}
                                  {item.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Summary */}
              {formData.gallery.length > 0 && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Gallery Summary</p>
                      <p className="text-sm text-muted-foreground">
                        {formData.gallery.filter(i => i.type === "image").length} Images • {" "}
                        {formData.gallery.filter(i => i.type === "reel").length} Reels • {" "}
                        {formData.gallery.filter(i => i.type === "video").length} Videos • {" "}
                        {formData.gallery.filter(i => i.contentType === "offer").length} Offers • {" "}
                        {formData.gallery.filter(i => i.contentType === "event").length} Events
                      </p>
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {formData.gallery.length} Total Items
                    </Badge>
                  </div>
                </div>
              )}
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
                  {isUploading ? "Saving..." : initialData ? "Update as Draft" : "Save Draft"}
                </Button>
                <Button 
                  onClick={() => handleSubmit("active")}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  {isUploading ? (initialData ? "Updating..." : "Publishing...") : (initialData ? "Update & Publish" : "Publish Service")}
                </Button>
              </div>
            )}
            
            {isUploading && (
              <div className="mt-2 space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">{uploadProgress}% Complete</p>
                {uploadingFiles.length > 0 && (
                  <div className="text-xs text-muted-foreground text-center">
                    <p>Uploading: {uploadingFiles.join(', ')}</p>
                  </div>
                )}
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
  const { toast } = useToast()
  const [pkgData, setPkgData] = useState({
    name: initialData?.name || "",
    price: initialData?.price || 0,
    duration: initialData?.duration || "",
    description: initialData?.description || "",
    popular: initialData?.popular || false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    
    if (!pkgData.name.trim()) {
      newErrors.name = "Package name is required"
    }
    if (!pkgData.price || pkgData.price <= 0) {
      newErrors.price = "Price must be greater than 0"
    }
    if (!pkgData.duration.trim()) {
      newErrors.duration = "Duration is required"
    }
    if (!pkgData.description.trim()) {
      newErrors.description = "Description is required"
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields correctly."
      })
      return
    }
    
    onSave({
      ...pkgData,
      features: initialData?.features || []
    })
    
    toast({
      title: "Package Saved",
      description: `${pkgData.name} has been ${initialData ? "updated" : "created"} successfully.`
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pkg-name">Package Name *</Label>
        <Input
          id="pkg-name"
          value={pkgData.name}
          onChange={(e) => {
            setPkgData({ ...pkgData, name: e.target.value })
            if (errors.name) setErrors({ ...errors, name: "" })
          }}
          placeholder="e.g., Basic Package, Standard Package"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.name}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pkg-price">Price (RWF) *</Label>
          <Input
            id="pkg-price"
            type="number"
            value={pkgData.price}
            onChange={(e) => {
              setPkgData({ ...pkgData, price: Number(e.target.value) })
              if (errors.price) setErrors({ ...errors, price: "" })
            }}
            placeholder="120000"
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && (
            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.price}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="pkg-duration">Duration *</Label>
          <Input
            id="pkg-duration"
            value={pkgData.duration}
            onChange={(e) => {
              setPkgData({ ...pkgData, duration: e.target.value })
              if (errors.duration) setErrors({ ...errors, duration: "" })
            }}
            placeholder="e.g., 2 hours, 3 hours"
            className={errors.duration ? "border-red-500" : ""}
          />
          {errors.duration && (
            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.duration}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="pkg-description">Description *</Label>
        <Textarea
          id="pkg-description"
          value={pkgData.description}
          onChange={(e) => {
            setPkgData({ ...pkgData, description: e.target.value })
            if (errors.description) setErrors({ ...errors, description: "" })
          }}
          placeholder="Brief description of this package"
          rows={3}
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.description}
          </p>
        )}
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
          <Save className="w-4 h-4 mr-2" />
          Save Package
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

