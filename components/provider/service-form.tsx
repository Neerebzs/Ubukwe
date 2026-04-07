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
import { Plus, Trash2, Save, X, MapPin, Star, Image as ImageIcon, Upload, Check, ChevronRight, ChevronLeft, CheckCircle, PlayCircle, Loader2, Film, Camera, Tag, Calendar, AlertCircle, Edit } from "lucide-react"
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
  contentType: null | "offer"
  url: string
  thumbnail?: string
  file?: File
  preview?: string // For local preview
  title: string
  description: string
  // Special offer fields
  validFrom?: string // Start date for offers
  validTo?: string   // End date for offers
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
  const [isSubmitting, setIsSubmitting] = useState(false) // For backend API calls
  const [submitType, setSubmitType] = useState<"draft" | "active" | null>(null) // Track which button was clicked
  const [activeMediaTab, setActiveMediaTab] = useState<"image" | "video" | "reel">("image")
  const [galleryItemForm, setGalleryItemForm] = useState({
    title: "",
    description: "",
    validFrom: "",
    validTo: ""
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
        // Safely extract categories array from potential wrapper object
        setCategories(Array.isArray(data) ? data : (data?.data || []))
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video" | "reel", contentType?: "offer") => {
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
        // Set contentType based on which main tab we're on:
        // - If contentType is explicitly passed (from promotional tab), use it
        // - Otherwise, set to null (regular media content)
        contentType: contentType || null,
        url: "", // Will be set after upload to server
        file,
        preview,
        title: galleryItemForm.title || "",
        description: galleryItemForm.description || "",
        validFrom: galleryItemForm.validFrom || undefined,
        validTo: galleryItemForm.validTo || undefined
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
      setGalleryItemForm({ title: "", description: "", validFrom: "", validTo: "" })
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

  const handleSaveGalleryItem = (itemData: { title: string; description: string; validFrom: string; validTo: string }) => {
    if (editingGalleryItem) {
      // Update existing gallery item
      setFormData({
        ...formData,
        gallery: formData.gallery.map(item => 
          item.id === editingGalleryItem.id 
            ? { 
                ...item, 
                title: itemData.title,
                description: itemData.description,
                validFrom: itemData.validFrom || undefined,
                validTo: itemData.validTo || undefined
              } 
            : item
        )
      })
      toast({
        title: "Offer Updated",
        description: "Your special offer has been updated successfully."
      })
    }
    setIsGalleryDialogOpen(false)
    setEditingGalleryItem(null)
    setGalleryItemForm({ title: "", description: "", validFrom: "", validTo: "" })
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
      for (const item of imageFiles) {
        if (!item.file) continue
        setUploadingFiles(prev => [...prev, item.file!.name])
        try {
          const response = await apiClient.upload.general<any>(item.file, "ubukwe/gallery", "image")
          
          // The backend returns FileUploadResponse which has url at top level
          // The API client wraps it as: { status: 'success', data: { success: true, url: "..." } }
          const imageUrl = response.data?.url;
          
          
          if (imageUrl) {
            // Generate thumbnail URL from Cloudinary
            const thumbnailUrl = imageUrl.replace('/upload/', '/upload/c_thumb,w_200/')
            uploadResults.push({ 
              url: imageUrl,
              thumbnail: thumbnailUrl
            })
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
      for (const item of reelFiles) {
        if (!item.file) continue
        setUploadingFiles(prev => [...prev, item.file!.name])
        try {
          const response = await apiClient.upload.general<any>(item.file, "ubukwe/reels", "video")
          
          // The backend returns FileUploadResponse which has url at top level
          // The API client wraps it as: { status: 'success', data: { success: true, url: "..." } }
          const reelUrl = response.data?.url;
          
          
          if (reelUrl) {
            // Generate thumbnail URL for video
            const thumbnailUrl = reelUrl.replace('/upload/', '/upload/so_0/').replace(/\.[^.]+$/, '.jpg')
            uploadResults.push({ 
              url: reelUrl,
              thumbnail: thumbnailUrl
            })
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
      for (const item of videoFiles) {
        if (!item.file) continue
        setUploadingFiles(prev => [...prev, item.file!.name])
        try {
          const response = await apiClient.upload.general<any>(item.file, "ubukwe/videos", "video")
          
          // The backend returns FileUploadResponse which has url at top level
          // The API client wraps it as: { status: 'success', data: { success: true, url: "..." } }
          const videoUrl = response.data?.url;
          
          
          if (videoUrl) {
            // Generate thumbnail URL for video
            const thumbnailUrl = videoUrl.replace('/upload/', '/upload/so_0/').replace(/\.[^.]+$/, '.jpg')
            uploadResults.push({ 
              url: videoUrl,
              thumbnail: thumbnailUrl
            })
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


      // Update formData with uploaded URLs and thumbnails
      const updatedGallery = formData.gallery.map(item => {
        if (item.file && !item.url && uploadResultsMap.has(item.id)) {
          const result = uploadResultsMap.get(item.id)
          return { 
            ...item, 
            url: result?.url || "",
            thumbnail: result?.thumbnail
          }
        }
        return item
      })


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

    // Set loading states
    setIsUploading(true)
    setIsSubmitting(true)
    setSubmitType(status || "draft")
    setUploadProgress(0)

    try {
      console.log("Gallery items state:", formData.gallery.map(g => ({
        id: g.id,
        type: g.type,
        hasFile: !!g.file,
        hasUrl: !!g.url,
        fileName: g.file?.name
      })));
      
      toast({
        title: status === "active" 
          ? (initialData ? "Updating & Publishing Service..." : "Publishing Service...")
          : (initialData ? "Updating Service..." : "Saving Service..."),
        description: "Please wait while we process your request..."
      })

      // Step 1: Upload gallery images if there are any with files
      const galleryUrls = await uploadGalleryImages()
      setUploadProgress(50)

      console.log("Gallery upload progress:", galleryUrls.map(g => ({
        id: g.id,
        type: g.type,
        hasUrl: !!g.url,
        url: g.url
      })));

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
          description: item.description || "",
          validFrom: item.validFrom || undefined,
          validTo: item.validTo || undefined
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
      const offersWithDates = finalData.gallery.filter(i => i.contentType === "offer" && (i.validFrom || i.validTo))
      offersWithDates.forEach(offer => {
      })

      // Step 3: Save the service with gallery URLs (Backend API call)
      if (onSave) {
        await onSave(finalData) // Make this await to handle the API call properly
      } else {
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
        title: "Operation Failed",
        description: error.message || "Failed to save service. Please try again."
      })
    } finally {
      setIsUploading(false)
      setIsSubmitting(false)
      setSubmitType(null)
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
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div className="space-y-1">
          <h2 className="text-4xl font-serif italic text-slate-900 tracking-tight">
            {initialData ? "Refine Asset" : "Draft New Entry"}
          </h2>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-[#668c65]/60" />
            <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em]">
              {initialData 
                ? "Adjusting the details of an existing masterpiece" 
                : "Introducing a regular service to the catalogue"
              }
            </p>
          </div>
        </div>
        {onCancel && (
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="h-12 px-6 rounded-2xl border-slate-100 text-slate-700 hover:bg-slate-50 font-bold uppercase text-[10px] tracking-widest transition-all"
          >
            <X className="w-4 h-4 mr-2" />
            {initialData ? "Retreat" : "Discard"}
          </Button>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
          <div className="space-y-4">
            {/* Progress Bar */}
            <Progress value={(currentStep / totalSteps) * 100} className="h-1 bg-slate-100 [&>div]:bg-[#668c65]" />

            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {stepLabels.map((label, index) => {
                const stepNum = index + 1
                const isCompleted = stepNum < currentStep
                const isCurrent = stepNum === currentStep

                return (
                  <div key={stepNum} className="flex items-center flex-1">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(stepNum)}
                      className="flex flex-col items-center flex-1 group cursor-pointer hover:scale-105 transition-transform duration-200"
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                        isCompleted
                          ? "bg-[#668c65] border-[#668c65] text-white shadow-md shadow-[#668c65]/20 group-hover:shadow-lg group-hover:shadow-[#668c65]/30"
                          : isCurrent
                            ? "border-[#668c65] bg-white text-[#668c65] shadow-sm group-hover:shadow-md"
                            : "border-slate-100 bg-slate-50 text-slate-400 group-hover:border-slate-200 group-hover:bg-slate-100"
                        }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="font-semibold text-sm">{stepNum}</span>
                        )}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest mt-3 text-center transition-colors ${
                        isCurrent ? "text-slate-900" : isCompleted ? "text-[#668c65]" : "text-slate-400 group-hover:text-slate-600"
                        }`}>
                        {label}
                      </span>
                    </button>
                    {stepNum < totalSteps && (
                      <ChevronRight className={`w-4 h-4 mx-2 transition-colors ${
                        isCompleted ? "text-[#668c65]/50" : "text-slate-200"
                        }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h3 className="text-2xl font-serif italic text-slate-900 tracking-tight">Service Details</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Basic information customers will see</p>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <Label htmlFor="name" className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-2 block">Service Designation *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (validationErrors.name) {
                      setValidationErrors({ ...validationErrors, name: "" })
                    }
                  }}
                  placeholder="e.g., Traditional Ceremonial Dance"
                  className={`h-14 rounded-2xl border-slate-100 focus-visible:ring-1 focus-visible:ring-[#668c65] focus-visible:border-[#668c65] px-5 bg-slate-50/50 hover:bg-slate-50 transition-colors ${validationErrors.name ? "border-red-500" : ""}`}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category" className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-2 block">Classification *</Label>
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
                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 focus:ring-[#668c65] px-5 bg-slate-50/50 hover:bg-slate-50 transition-colors text-slate-900">
                      <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a category"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={cat.id} className="rounded-xl focus:bg-[#668c65]/5 focus:text-[#668c65]">{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location" className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-2 block">Location *</Label>
                  <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 focus:ring-[#668c65] px-5 bg-slate-50/50 hover:bg-slate-50 transition-colors text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                      {locations.map(loc => (
                        <SelectItem key={loc} value={loc} className="rounded-xl focus:bg-[#668c65]/5 focus:text-[#668c65]">{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="priceMin" className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-2 block">Minimum Price (RWF) *</Label>
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
                    placeholder="e.g., 120,000"
                    className={`h-14 rounded-2xl border-slate-100 focus-visible:ring-1 focus-visible:ring-[#668c65] focus-visible:border-[#668c65] px-5 bg-slate-50/50 hover:bg-slate-50 transition-colors ${validationErrors.priceRangeMin ? "border-red-500" : ""}`}
                  />
                  {validationErrors.priceRangeMin && (
                    <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.priceRangeMin}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="priceMax" className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-2 block">Maximum Price (RWF) *</Label>
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
                    placeholder="e.g., 200,000"
                    className={`h-14 rounded-2xl border-slate-100 focus-visible:ring-1 focus-visible:ring-[#668c65] focus-visible:border-[#668c65] px-5 bg-slate-50/50 hover:bg-slate-50 transition-colors ${validationErrors.priceRangeMax ? "border-red-500" : ""}`}
                  />
                  {validationErrors.priceRangeMax && (
                    <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.priceRangeMax}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Will display as: <span className="text-[#668c65]">{formData.priceRangeMin && formData.priceRangeMax
                  ? `${Number(formData.priceRangeMin).toLocaleString()} - ${Number(formData.priceRangeMax).toLocaleString()} RWF`
                  : "Price range will appear here"}</span>
              </p>

              <div>
                <Label htmlFor="description" className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-2 block">Narrative Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value })
                    if (validationErrors.description) {
                      setValidationErrors({ ...validationErrors, description: "" })
                    }
                  }}
                  placeholder="Elaborate on the artisanal nature of this service..."
                  rows={6}
                  className={`min-h-[160px] rounded-2xl border-slate-100 focus-visible:ring-1 focus-visible:ring-[#668c65] focus-visible:border-[#668c65] resize-none p-5 bg-slate-50/50 hover:bg-slate-50 transition-colors text-slate-900 ${validationErrors.description ? "border-red-500" : ""}`}
                />
                <div className="flex items-center justify-between mt-2 px-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {formData.description.length} chars (min 50)
                  </p>
                  {validationErrors.description && (
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.description}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-2 block">Specialties</Label>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={currentSpecialty}
                    onChange={(e) => setCurrentSpecialty(e.target.value)}
                    placeholder="e.g., Intore Dance, Traditional Music"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
                    className="h-14 rounded-2xl border-slate-100 focus-visible:ring-1 focus-visible:ring-[#668c65] focus-visible:border-[#668c65] px-5 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  />
                  <Button type="button" onClick={addSpecialty} className="h-14 w-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-all border-none">
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="bg-[#668c65]/10 text-[#668c65] border-none px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-none flex items-center gap-1 hover:bg-[#668c65]/20 transition-colors">
                      {specialty}
                      <button
                        type="button"
                        onClick={() => removeSpecialty(specialty)}
                        className="ml-1 hover:text-slate-900 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>


            </div>
          </div>
        )}

        {/* Step 2: Packages & Pricing */}
        {currentStep === 2 && (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-serif italic text-slate-900 tracking-tight">Service Packages</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Create pricing tiers for your offering</p>
              </div>
              <Button onClick={handleAddPackage} className="h-12 rounded-2xl bg-[#668c65] hover:bg-[#5a7c59] text-white shadow-xl shadow-[#668c65]/20 font-bold uppercase text-[10px] tracking-widest border-none shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Add Package
              </Button>
            </div>
            <div className="p-8">
              {formData.packages.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Check className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No packages configured yet</p>
                  <p className="text-sm text-slate-400 mt-2">Click "Add Package" to create your first pricing tier.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.packages.map((pkg) => (
                    <div key={pkg.id} className={`bg-white rounded-3xl border ${pkg.popular ? "border-[#668c65] shadow-lg shadow-[#668c65]/5" : "border-slate-100 shadow-sm"} overflow-hidden transition-all hover:shadow-md`}>
                      <div className={`p-6 border-b ${pkg.popular ? "bg-[#668c65]/5 border-[#668c65]/10" : "bg-slate-50/50 border-slate-50"}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <h4 className="text-xl font-serif italic text-slate-900 tracking-tight">{pkg.name}</h4>
                            {pkg.popular && (
                              <Badge variant="default" className="bg-[#668c65] hover:bg-[#668c65] text-white border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md shadow-[#668c65]/20">Featured</Badge>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm" onClick={() => handleEditPackage(pkg)} className="h-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 font-bold uppercase text-[10px] tracking-widest">
                              Modify
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => removePackage(pkg.id)} className="h-10 w-10 p-0 rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        <div>
                          <p className="text-sm text-slate-600 leading-relaxed">{pkg.description}</p>
                          <div className="flex items-baseline gap-3 mt-4">
                            <span className="text-3xl font-bold text-slate-900 tracking-tight">{pkg.price.toLocaleString()} <span className="text-lg text-slate-500 font-normal">RWF</span></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{pkg.duration}</span>
                          </div>
                        </div>
                        <div className="pt-6 border-t border-slate-50">
                          <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-4 block">Included Amenities</Label>
                          <div className="flex gap-2 mb-4">
                            <Input
                              value={currentFeature.packageId === pkg.id ? currentFeature.feature : ""}
                              onChange={(e) => setCurrentFeature({ packageId: pkg.id, feature: e.target.value })}
                              placeholder="Add an included feature..."
                              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPackageFeature(pkg.id, currentFeature.feature))}
                              className="h-12 rounded-xl border-slate-100 focus-visible:ring-1 focus-visible:ring-[#668c65] px-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                            />
                            <Button
                              type="button"
                              onClick={() => addPackageFeature(pkg.id, currentFeature.feature)}
                              className="h-12 w-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all border-none"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <ul className="space-y-2">
                            {pkg.features.map((feature, index) => (
                              <li key={index} className="flex items-center justify-between text-sm bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl group hover:bg-white hover:border-slate-200 transition-colors">
                                <span className="flex items-center gap-3 text-slate-700">
                                  <div className="w-6 h-6 rounded-full bg-[#668c65]/10 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-[#668c65]" />
                                  </div>
                                  {feature}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removePackageFeature(pkg.id, index)}
                                  className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Gallery */}
        {currentStep === 3 && (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h3 className="text-2xl font-serif italic text-slate-900 tracking-tight">Visual Portfolio</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Showcase your service with images, reels, videos, offers, and events</p>
            </div>
            <div className="p-8">
              <Tabs defaultValue="media" className="space-y-8">
                <TabsList className="grid w-full grid-cols-2 bg-slate-50 p-1 rounded-2xl">
                  <TabsTrigger value="media" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#668c65] data-[state=active]:shadow-sm text-[10px] font-black uppercase tracking-widest py-3">
                    <Camera className="w-4 h-4 mr-2" />
                    Media Content
                  </TabsTrigger>
                  <TabsTrigger value="promotional" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#668c65] data-[state=active]:shadow-sm text-[10px] font-black uppercase tracking-widest py-3">
                    <Tag className="w-4 h-4 mr-2" />
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
                      <h3 className="text-lg font-semibold">Special Offers</h3>
                      <p className="text-sm text-muted-foreground">Create special offers and promotional content to attract customers</p>
                    </div>

                    {/* Special Offer Form */}
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
                        
                        {/* Valid Period Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="offer-valid-from">Valid From</Label>
                            <Input
                              id="offer-valid-from"
                              type="date"
                              value={galleryItemForm.validFrom}
                              onChange={(e) => setGalleryItemForm({ ...galleryItemForm, validFrom: e.target.value })}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <Label htmlFor="offer-valid-to">Valid Until</Label>
                            <Input
                              id="offer-valid-to"
                              type="date"
                              value={galleryItemForm.validTo}
                              onChange={(e) => setGalleryItemForm({ ...galleryItemForm, validTo: e.target.value })}
                              className="w-full"
                            />
                          </div>
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

                    {/* Display promotional content */}
                    {formData.gallery.filter(item => item.contentType === "offer").length > 0 && (
                      <div className="space-y-3">
                        <Separator />
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Your Special Offers</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Edit className="w-3 h-3" />
                            Click the blue edit button to modify offers
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {formData.gallery
                            .filter(item => item.contentType === "offer")
                            .map((item) => (
                              <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                                <div className="relative aspect-video bg-muted">
                                  {item.type === "image" && item.preview ? (
                                    <img
                                      src={item.preview}
                                      alt={item.title || "Special offer"}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (item.type === "video" || item.type === "reel") ? (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/30">
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
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingGalleryItem(item);
                                      setGalleryItemForm({
                                        title: item.title || "",
                                        description: item.description || "",
                                        validFrom: item.validFrom || "",
                                        validTo: item.validTo || ""
                                      });
                                      setIsGalleryDialogOpen(true);
                                    }}
                                    className="absolute top-2 right-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    title="Edit Offer"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <div className="absolute top-2 left-2 flex gap-2">
                                    <Badge className="capitalize bg-black/70 text-white border-none">
                                      {item.type}
                                    </Badge>
                                    <Badge className="capitalize bg-primary text-primary-foreground border-none">
                                      Special Offer
                                    </Badge>
                                    <Badge className="bg-blue-500/90 text-white border-none text-xs">
                                      <Edit className="w-3 h-3 mr-1" />
                                      Editable
                                    </Badge>
                                  </div>
                                </div>
                                <div className="p-4">
                                  {item.title && (
                                    <h5 className="font-semibold mb-1 line-clamp-1">{item.title}</h5>
                                  )}
                                  {item.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                                  )}
                                  {/* Valid Period Display */}
                                  {(item.validFrom || item.validTo) && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                      <Calendar className="w-3 h-3" />
                                      <span>
                                        {item.validFrom && item.validTo 
                                          ? `${new Date(item.validFrom).toLocaleDateString()} - ${new Date(item.validTo).toLocaleDateString()}`
                                          : item.validFrom 
                                            ? `From ${new Date(item.validFrom).toLocaleDateString()}`
                                            : `Until ${new Date(item.validTo!).toLocaleDateString()}`
                                        }
                                      </span>
                                    </div>
                                  )}
                                  <Badge variant="secondary" className="bg-[#668c65]/10 text-[#668c65] border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                    Special Offer
                                  </Badge>
                                </div>
                              </Card>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {formData.gallery.length > 0 && (
                <div className="mt-8 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Portfolio Summary</p>
                    <p className="text-sm text-slate-500">
                      {formData.gallery.filter(i => i.type === "image").length} Images • {" "}
                      {formData.gallery.filter(i => i.type === "reel").length} Reels • {" "}
                      {formData.gallery.filter(i => i.type === "video").length} Videos • {" "}
                      {formData.gallery.filter(i => i.contentType === "offer").length} Offers
                    </p>
                  </div>
                  <Badge variant="outline" className="border-[#668c65] text-[#668c65] bg-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl">
                    {formData.gallery.length} Assets Total
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Contact Info */}
        {currentStep === 4 && (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h3 className="text-2xl font-serif italic text-slate-900 tracking-tight">Contact Details</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Information visible on your service's "About" section</p>
            </div>
            <div className="p-8 space-y-6 max-w-2xl">
              <div>
                <Label htmlFor="phone" className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-2 block">Direct Line</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+250 788 123 456"
                  className="h-14 rounded-2xl border-slate-100 focus-visible:ring-1 focus-visible:ring-[#668c65] focus-visible:border-[#668c65] px-5 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-2 block">Electronic Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@artisan.com"
                  className="h-14 rounded-2xl border-slate-100 focus-visible:ring-1 focus-visible:ring-[#668c65] focus-visible:border-[#668c65] px-5 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Publish */}
        {currentStep === 5 && (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h3 className="text-2xl font-serif italic text-slate-900 tracking-tight">Final Review</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Verify all details before presenting to the world</p>
            </div>
            <div className="p-8 space-y-10">
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {formData.gallery.map((item) => (
                      <div key={item.id} className="aspect-video rounded-xl overflow-hidden bg-slate-100 relative">
                        {(item.preview || item.url) ? (
                          item.type === "video" || item.type === "reel" ? (
                            <video
                              src={item.preview || item.url}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={item.preview || item.url}
                              alt={item.title || "Gallery item"}
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : item.file ? (
                          <img
                            src={URL.createObjectURL(item.file)}
                            alt={item.title || "Gallery item"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Badge variant="outline">{item.type}</Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Contact Review */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-[#668c65] uppercase tracking-widest border-b border-slate-100 pb-2">Part IV: Contact Details</h3>
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Line</p>
                    <p className="font-semibold text-slate-900">{formData.phone || "Not provided"}</p>
                  </div>
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Electronic Mail</p>
                    <p className="font-semibold text-slate-900">{formData.email || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="sticky bottom-6 z-10 bg-white/80 backdrop-blur-md rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-900/5 p-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="w-full md:w-auto h-14 px-8 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold uppercase text-[10px] tracking-widest transition-all"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retreat
        </Button>

        <div className="hidden md:flex flex-col items-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Phase {currentStep} of {totalSteps}
          </p>
          <div className="flex gap-1 mt-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < currentStep ? "w-6 bg-[#668c65]" : "w-1.5 bg-slate-200"}`} />
            ))}
          </div>
        </div>

        {currentStep < totalSteps ? (
          <Button 
            onClick={handleNext} 
            disabled={isUploading}
            className="w-full md:w-auto h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-all font-bold uppercase text-[10px] tracking-widest border-none"
          >
            Advance
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <div className="flex w-full md:w-auto gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleSubmit("draft")}
              disabled={isUploading || isSubmitting}
              className="flex-1 md:flex-none h-14 px-6 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold uppercase text-[10px] tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isUploading || isSubmitting) && submitType === "draft" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2 text-[#668c65]" />
              )}
              {(isUploading || isSubmitting) && submitType === "draft" 
                ? (initialData ? "Updating..." : "Saving...") 
                : (initialData ? "Update Archive" : "Save to Archive")
              }
            </Button>
            <Button 
              onClick={() => handleSubmit("active")}
              disabled={isUploading || isSubmitting}
              className="flex-1 md:flex-none h-14 px-8 rounded-2xl bg-[#668c65] hover:bg-[#5a7c59] text-white shadow-xl shadow-[#668c65]/20 font-bold uppercase text-[10px] tracking-widest border-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isUploading || isSubmitting) && submitType === "active" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {(isUploading || isSubmitting) && submitType === "active" 
                ? (initialData ? "Refining..." : "Publishing...") 
                : (initialData ? "Refine & Publish" : "Publish to Catalogue")
              }
            </Button>
          </div>
        )}
        
        {(isUploading || isSubmitting) && (
          <div className="absolute -top-12 left-0 right-0 bg-white rounded-xl shadow-lg border border-slate-100 p-3 mx-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-[#668c65] uppercase tracking-widest">
                {isUploading && !isSubmitting 
                  ? "Uploading Media Assets..." 
                  : isSubmitting 
                    ? (submitType === "active" 
                        ? (initialData ? "Updating & Publishing Service..." : "Publishing Service...")
                        : (initialData ? "Updating Service..." : "Saving Service...")
                      )
                    : "Processing..."
                }
              </p>
              <p className="text-[10px] font-black text-slate-400">{uploadProgress}%</p>
            </div>
            <Progress value={uploadProgress} className="h-1 bg-slate-100 [&>div]:bg-[#668c65]" />
            {uploadingFiles.length > 0 && (
              <p className="text-[9px] text-slate-400 mt-2 truncate font-mono">
                {uploadingFiles.join(', ')}
              </p>
            )}
          </div>
        )}
      </div>

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
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Gallery Item Edit Dialog */}
      <Dialog open={isGalleryDialogOpen} onOpenChange={setIsGalleryDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Special Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div>
              <Label htmlFor="edit-offer-title">Offer Title</Label>
              <Input
                id="edit-offer-title"
                value={galleryItemForm.title}
                onChange={(e) => setGalleryItemForm({ ...galleryItemForm, title: e.target.value })}
                placeholder="e.g., 20% Off Wedding Photography Package"
              />
            </div>
            <div>
              <Label htmlFor="edit-offer-description">Offer Description</Label>
              <Textarea
                id="edit-offer-description"
                value={galleryItemForm.description}
                onChange={(e) => setGalleryItemForm({ ...galleryItemForm, description: e.target.value })}
                placeholder="Describe your special offer, terms, and conditions..."
                rows={4}
              />
            </div>
            
            {/* Valid Period Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-offer-valid-from">Valid From</Label>
                <Input
                  id="edit-offer-valid-from"
                  type="date"
                  value={galleryItemForm.validFrom}
                  onChange={(e) => setGalleryItemForm({ ...galleryItemForm, validFrom: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="edit-offer-valid-to">Valid Until</Label>
                <Input
                  id="edit-offer-valid-to"
                  type="date"
                  value={galleryItemForm.validTo}
                  onChange={(e) => setGalleryItemForm({ ...galleryItemForm, validTo: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsGalleryDialogOpen(false)
                  setEditingGalleryItem(null)
                  setGalleryItemForm({ title: "", description: "", validFrom: "", validTo: "" })
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleSaveGalleryItem(galleryItemForm)}
                className="flex-1 bg-[#668c65] hover:bg-[#5a7b59] text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
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

