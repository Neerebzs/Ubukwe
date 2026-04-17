"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, AlertTriangle, Camera, X, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { apiClient, axiosInstance } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
  ValidationError,
} from "@/lib/validation/onboarding-schema"
import { useRef } from "react"

interface ServiceCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  is_active: boolean
}

export default function ProviderOnboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stepErrors, setStepErrors] = useState<ValidationError[]>([])
  const [cameraActive, setCameraActive] = useState(false)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [isResubmission, setIsResubmission] = useState(false) // true when updating existing application
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    yearsExperience: "",
    serviceCategories: [] as string[],
    description: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "",
  })

  const [documents, setDocuments] = useState({
    idDocument: null as File | null,
    selfiePhoto: null as File | null,
    businessLicense: null as File | null,
    businessLogo: null as File | null,
    taxCertificate: null as File | null,
    insuranceCertificate: null as File | null,
    portfolio: [] as File[],
  })

  const steps = [
    { id: 1, title: "Business Information", completed: currentStep > 1 },
    { id: 2, title: "Service Details", completed: currentStep > 2 },
    { id: 3, title: "Contact Information", completed: currentStep > 3 },
    { id: 4, title: "Identity Verification", completed: currentStep > 4 },
    { id: 5, title: "Business Documents", completed: currentStep > 5 },
    { id: 6, title: "Review & Submit", completed: false },
  ]

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Check if user already has an onboarding application
  useEffect(() => {
    const checkExistingApplication = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/provider/onboarding/status")
        const onboardingData = response.data

        if (onboardingData && onboardingData.onboarding_status) {
          const status = onboardingData.onboarding_status

          // Pending/approved — no need to re-submit, go back to the onboarding status tab
          if (status === "pending" || status === "approved") {
            toast.info(`Your application is ${status}. You don't need to submit again.`)
            router.push("/provider/dashboard?tab=onboarding")
            return
          }

          // Requires revision or rejected — pre-fill the form with existing data
          if ((status === "requires_revision" || status === "rejected") && onboardingData.application_details) {
            const details = onboardingData.application_details
            setFormData({
              businessName: details.business_name || "",
              businessType: details.business_type || "",
              yearsExperience: String(details.years_experience) || "",
              serviceCategories: Array.isArray(details.service_categories) ? details.service_categories : [],
              description: details.business_description || "",
              phone: details.phone || "",
              email: details.email || "",
              address: details.address || "",
              city: details.city || "",
              country: details.country || "",
            })
            setIsResubmission(true)
            const msg = status === "requires_revision"
              ? "Please update your information as requested by the administrator."
              : "Your previous application was declined. Please review and resubmit."
            toast.info(msg)
          }
        }
      } catch (error: any) {
        if (!error.message?.includes("404")) {
          console.error("Error checking onboarding status:", error)
        }
      }
    }

    checkExistingApplication()
  }, [])

  // Fetch service categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true)
      try {
        const response = await axiosInstance.get("/api/v1/public/categories")
        const data = response.data
        // Handle both array response and wrapped response
        const cats = Array.isArray(data) ? data : (data?.data ?? data?.categories ?? [])
        setCategories(cats.filter((c: ServiceCategory) => c.is_active !== false))
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        // Fallback to empty — user will see a message
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [])

  /* ---------------- CAMERA (FIXED) ---------------- */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 400 },
          height: { ideal: 400 },
        },
        audio: false,
      })

      streamRef.current = stream
      setCameraActive(true)


      // wait for video element to mount
      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = async () => {
            await videoRef.current?.play()
          }
        }
      }, 100)
    } catch (error) {
      console.error(error)
      toast.error("Unable to access camera. Please allow camera permission.")
    }
  }


  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }


  const captureSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return


    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    ctx.drawImage(videoRef.current, 0, 0)


    canvasRef.current.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Failed to capture selfie")
          return
        }
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" })
        setDocuments((p) => ({ ...p, selfiePhoto: file }))
        stopCamera()
        toast.success("Selfie captured successfully")
      },
      "image/jpeg",
      0.95
    )
  }


  useEffect(() => {
    return () => stopCamera()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (type: keyof typeof documents, files: FileList | null) => {
    if (!files) return
    if (type === "portfolio") {
      setDocuments((prev) => ({
        ...prev,
        portfolio: [...prev.portfolio, ...Array.from(files)],
      }))
    } else {
      setDocuments((prev) => ({
        ...prev,
        [type]: files[0],
      }))
    }
  }

  const validateCurrentStep = (): boolean => {
    setStepErrors([])
    let validation

    switch (currentStep) {
      case 1:
        validation = validateStep1({
          businessName: formData.businessName,
          businessType: formData.businessType,
          yearsExperience: formData.yearsExperience,
        })
        break
      case 2:
        validation = validateStep2({
          serviceCategories: formData.serviceCategories,
          description: formData.description,
        })
        break
      case 3:
        validation = validateStep3({
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          country: formData.country,
        })
        break
      case 4:
        validation = validateStep4({
          idDocument: documents.idDocument,
          selfiePhoto: documents.selfiePhoto,
        })
        break
      case 5:
        validation = validateStep5({
          businessLicense: documents.businessLicense,
          portfolio: documents.portfolio,
        })
        break
      default:
        return true
    }

    if (!validation.isValid) {
      setStepErrors(validation.errors)
      return false
    }
    return true
  }

  const handleNext = async () => {
    if (!validateCurrentStep()) return

    if (currentStep === 4) {
      setIsSubmitting(true)
      try {
        if (!documents.idDocument || !documents.selfiePhoto) {
          throw new Error("Missing ID document or selfie photo. Please upload both documents.")
        }

        const docResponse = await apiClient.provider.submitDocuments(
          documents.idDocument,
          documents.selfiePhoto
        )

        if (!docResponse.data.face_match) {
          throw new Error(docResponse.data.detail || "Face does not match National ID. Please retake your selfie with better lighting and ensure your face is clearly visible.")
        }

        toast.success("Identity verified successfully!")
        setCurrentStep(5)
      } catch (error: any) {
        console.error("Verification failed:", error)

        // Handle specific verification errors with actual API messages
        let errorMessage = "Identity verification failed. Please try again."

        if (error.message) {
          if (error.message.includes("face_match") || error.message.includes("Face does not match")) {
            errorMessage = "Face verification failed. Please ensure good lighting and retake your selfie."
          } else if (error.message.includes("NO_FACE_NID")) {
            errorMessage = "No face detected in your ID document. Please upload a clear image of your National ID."
          } else if (error.message.includes("NO_FACE_SELFIE")) {
            errorMessage = "No face detected in your selfie. Please retake your selfie with better lighting."
          } else if (error.message.includes("MULTIPLE_FACES")) {
            errorMessage = "Multiple faces detected. Please ensure only one face is visible in the image."
          } else if (error.message.includes("timeout")) {
            errorMessage = "Verification timed out. Please check your internet connection and try again."
          } else if (error.message.includes("413") || error.message.includes("too large")) {
            errorMessage = "Image files are too large. Please use smaller images (max 10MB each)."
          } else {
            // Use the actual error message from the API
            errorMessage = error.message
          }
        }

        toast.error(errorMessage)
      } finally {
        setIsSubmitting(false)
      }
    } else if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (isSubmitting) return
    setStepErrors([])
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return
    }
    setIsSubmitting(true)
    try {
      // Validate required documents (only for fresh submissions — resubmissions may keep existing docs)
      if (!isResubmission && !documents.businessLicense) {
        throw new Error("Missing business license (RDB file). Please upload your RDB certificate.")
      }

      const onboardingData = {
        businessName: formData.businessName,
        businessType: formData.businessType,
        yearsExperience: parseInt(formData.yearsExperience) || 0,
        serviceCategories: formData.serviceCategories,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        country: formData.country,
      }

      if (isResubmission) {
        // Use PUT to update the existing application
        await apiClient.provider.updateOnboarding(onboardingData, documents.businessLicense, documents.businessLogo)
        toast.success("Application updated successfully! Our team will review your changes.")
      } else {
        await apiClient.provider.submitOnboarding(onboardingData, documents.businessLicense!, documents.businessLogo)
        toast.success("Onboarding application submitted successfully! You will be notified once it's reviewed.")
      }

      router.push("/provider/dashboard?tab=onboarding")
    } catch (error: any) {
      console.error("Submission failed:", error)

      // Extract the actual error message from the API response
      let errorMessage = "Failed to submit onboarding data. Please try again."

      if (error.message) {
        // Check for specific error messages from the API
        if (error.message.includes("Onboarding application already exists")) {
          errorMessage = "You have already submitted an onboarding application. Please check your dashboard for the status."
        } else if (error.message.includes("User must be a service provider")) {
          errorMessage = "Only service providers can submit onboarding applications. Please contact support if you believe this is an error."
        } else if (error.message.includes("User not found")) {
          errorMessage = "Your account could not be found. Please try logging in again."
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timed out. Please check your internet connection and try again."
        } else if (error.message.includes("Network error")) {
          errorMessage = "Network error. Please check your internet connection and try again."
        } else if (error.message.includes("413") || error.message.includes("too large")) {
          errorMessage = "File size too large. Please use a smaller file (max 10MB)."
        } else if (error.message.includes("400") || error.message.includes("validation")) {
          errorMessage = "Please check your information and try again. " + error.message
        } else if (error.message.includes("401") || error.message.includes("unauthorized")) {
          errorMessage = "Session expired. Please login again."
        } else if (error.message.includes("403") || error.message.includes("forbidden")) {
          errorMessage = "You don't have permission to perform this action."
        } else {
          // Use the actual error message from the API
          errorMessage = error.message
        }
      }

      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / 6) * 100

  return (
    <div className="min-h-screen bg-[#fbfcff] py-6 md:py-12 px-3 md:px-4 font-sans">
      {cameraActive && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center flex-col gap-4">
          <button
            onClick={stopCamera}
            className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-96 h-96 object-cover rounded-lg"
          />

          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2 p-4 mt-4">
            <Button
              type="button"
              onClick={captureSelfie}
              className="flex-1 bg-sage-600 hover:bg-sage-700 text-white rounded-full transition-all duration-300"
            >
              <Camera className="w-4 h-4 mr-2" />
              Capture
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={stopCamera}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30 rounded-full backdrop-blur-sm transition-all duration-300"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-8 md:mb-12">
          <Link href="/" className="text-sage-600 hover:text-sage-700 text-sm flex items-center gap-2 transition-colors font-medium">
            ← Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif italic text-slate-900 mt-4 md:mt-6 leading-tight">Provider Onboarding</h1>
          <p className="text-slate-500 mt-2 md:mt-3 text-base md:text-lg">Complete your profile to start offering services on our boutique platform</p>
        </div>

        <div className="mb-8 md:mb-12">
          <Progress value={progress} className="mb-6 md:mb-8 h-2 bg-sage-100 [&>div]:bg-sage-600" />
          <div className="flex justify-between relative gap-1">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center flex-1 relative z-10">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${step.completed
                    ? "bg-sage-600 border-sage-600 text-white"
                    : currentStep === step.id
                      ? "bg-white border-sage-600 text-sage-600 shadow-[0_0_20px_rgba(13,148,136,0.3)]"
                      : "bg-white border-slate-200 text-slate-400"
                    }`}
                >
                  {step.completed ? <CheckCircle className="w-5 h-5 md:w-6 md:h-6" /> : <span className="text-xs md:text-sm font-bold">{step.id}</span>}
                </div>
                <p className={`text-[10px] md:text-[11px] font-medium mt-2 md:mt-3 uppercase tracking-wider text-center max-w-[80px] ${currentStep === step.id ? "text-sage-600 block" : "text-slate-400 hidden md:block"}`}>
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-md">
          <CardHeader className="pb-6 pt-8 md:pb-8 md:pt-10 px-5 md:px-8 lg:px-12 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0">
              <div>
                <CardTitle className="text-xl md:text-2xl font-serif text-slate-800">{steps[currentStep - 1].title}</CardTitle>
                <CardDescription className="text-slate-500 mt-1 text-sm">
                  Complete the details to proceed
                </CardDescription>
              </div>
              <span className="text-xs md:text-sm font-medium text-sage-600 bg-sage-50 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-sage-100">
                Step {currentStep} of {steps.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 md:space-y-8 p-5 md:p-8 lg:p-12">
            {stepErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">Please fix the following errors:</h3>
                    <ul className="space-y-1">
                      {stepErrors.map((error, idx) => (
                        <li key={idx} className="text-sm text-red-800">
                          • {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessName" className="text-slate-700 font-medium mb-2 block">Business/Professional Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    placeholder="Enter your business name"
                    className={`rounded-xl border-slate-200 focus:border-sage-500 focus:ring-sage-500/20 py-6 ${stepErrors.some((e) => e.field === "businessName") ? "border-red-500" : ""}`}
                  />
                  {stepErrors.some((e) => e.field === "businessName") && (
                    <p className="text-sm text-red-600 mt-1">{stepErrors.find((e) => e.field === "businessName")?.message}</p>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select value={formData.businessType} onValueChange={(value) => handleInputChange("businessType", value)}>
                      <SelectTrigger className={stepErrors.some((e) => e.field === "businessType") ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sole-proprietor">Sole Proprietor</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                        <SelectItem value="corporation">Corporation</SelectItem>
                        <SelectItem value="individual">Individual/Freelancer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="yearsExperience">Years of Experience *</Label>
                    <Select value={formData.yearsExperience} onValueChange={(value) => handleInputChange("yearsExperience", value)}>
                      <SelectTrigger className={stepErrors.some((e) => e.field === "yearsExperience") ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="2-5">2-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="11+">11+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="serviceCategories" className="text-slate-700 font-medium mb-1 block">
                    Service Categories *
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select all categories that apply to your business. You can choose multiple.
                  </p>

                  {categoriesLoading ? (
                    <div className="flex items-center justify-center py-10 gap-3 text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Loading categories...</span>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      No categories available yet. Please contact the administrator to add service categories.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categories.map((cat) => {
                        const isSelected = formData.serviceCategories.includes(cat.name)
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              const updated = isSelected
                                ? formData.serviceCategories.filter((c) => c !== cat.name)
                                : [...formData.serviceCategories, cat.name]
                              handleInputChange("serviceCategories", updated)
                            }}
                            className={`relative flex items-center gap-3 rounded-xl border-2 px-4 py-4 text-left transition-all duration-200 ${
                              isSelected
                                ? "border-sage-600 bg-sage-50 text-sage-800 shadow-md shadow-sage-100"
                                : "border-slate-200 bg-white text-slate-600 hover:border-sage-300 hover:bg-sage-50/50"
                            }`}
                          >
                            {/* Checkbox indicator */}
                            <span
                              className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "border-sage-600 bg-sage-600"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </span>
                            <span className="text-sm font-medium leading-tight">{cat.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Selected count badge */}
                  {formData.serviceCategories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs text-slate-500 self-center">Selected:</span>
                      {formData.serviceCategories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center gap-1 bg-sage-100 text-sage-800 text-xs font-medium px-2.5 py-1 rounded-full"
                        >
                          {cat}
                          <button
                            type="button"
                            onClick={() =>
                              handleInputChange(
                                "serviceCategories",
                                formData.serviceCategories.filter((c) => c !== cat)
                              )
                            }
                            className="hover:text-sage-600 ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {stepErrors.some((e) => e.field === "serviceCategories") && (
                    <p className="text-sm text-red-600 mt-2">
                      {stepErrors.find((e) => e.field === "serviceCategories")?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Business Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your services, experience, and what makes you unique..."
                    rows={6}
                    className={stepErrors.some((e) => e.field === "description") ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{formData.description.length}/500 characters</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+250 XXX XXX XXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter your business address"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rwanda">Rwanda</SelectItem>
                        <SelectItem value="uganda">Uganda</SelectItem>
                        <SelectItem value="kenya">Kenya</SelectItem>
                        <SelectItem value="tanzania">Tanzania</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Identity Verification:</strong> Please upload both your National ID and a clear selfie photo.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>National ID Document *</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="idDocument"
                        accept="image/*"
                        onChange={(e) => handleFileUpload("idDocument", e.target.files)}
                        className="hidden"
                      />
                      <label htmlFor="idDocument" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload National ID</p>
                      </label>
                      {documents.idDocument && (
                        <div className="mt-2 flex items-center justify-center gap-2 text-sm">
                          <FileText className="w-4 h-4" />
                          {documents.idDocument.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Selfie Photo *</Label>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full border-2 border-dashed rounded-lg p-6 text-center hover:border-sage-400 transition-colors"
                    >
                      <Camera className="w-12 h-12 mx-auto mb-3 text-sage-600" />
                      <p className="text-sm font-medium">Click to take selfie</p>
                    </button>

                    {documents.selfiePhoto && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Selfie captured
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                {/* Business License / RDB Certificate */}
                <div>
                  <Label className="text-slate-700 font-medium mb-1 block">
                    Business License / RDB Certificate *
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload your official business registration document (PDF or image)
                  </p>
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    documents.businessLicense ? "border-sage-400 bg-sage-50" : "border-slate-200 hover:border-sage-300"
                  }`}>
                    <input
                      type="file"
                      id="businessLicense"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("businessLicense", e.target.files)}
                      className="hidden"
                    />
                    <label htmlFor="businessLicense" className="cursor-pointer block">
                      {documents.businessLicense ? (
                        <div className="flex items-center justify-center gap-3 text-sage-700">
                          <CheckCircle className="w-6 h-6 text-sage-600" />
                          <div className="text-left">
                            <p className="text-sm font-semibold">{documents.businessLicense.name}</p>
                            <p className="text-xs text-slate-500">{(documents.businessLicense.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setDocuments(p => ({ ...p, businessLicense: null })) }}
                            className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm font-medium text-slate-600">Click to upload RDB certificate</p>
                          <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG — max 10MB</p>
                        </>
                      )}
                    </label>
                  </div>
                  {stepErrors.some((e) => e.field === "businessLicense") && (
                    <p className="text-sm text-red-600 mt-1">{stepErrors.find((e) => e.field === "businessLicense")?.message}</p>
                  )}
                </div>

                {/* Business Logo */}
                <div>
                  <Label className="text-slate-700 font-medium mb-1 block">
                    Business Logo
                    <span className="ml-2 text-xs font-normal text-slate-400">(Optional)</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload your company logo — it will appear on your public profile and services
                  </p>
                  <div className={`border-2 border-dashed rounded-xl transition-colors ${
                    documents.businessLogo ? "border-sage-400 bg-sage-50" : "border-slate-200 hover:border-sage-300"
                  }`}>
                    <input
                      type="file"
                      id="businessLogo"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                      onChange={(e) => handleFileUpload("businessLogo", e.target.files)}
                      className="hidden"
                    />
                    {documents.businessLogo ? (
                      <div className="p-4 flex items-center gap-4">
                        {/* Preview */}
                        <img
                          src={URL.createObjectURL(documents.businessLogo)}
                          alt="Logo preview"
                          className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-white p-1 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">{documents.businessLogo.name}</p>
                          <p className="text-xs text-slate-500">{(documents.businessLogo.size / 1024).toFixed(1)} KB</p>
                          <label
                            htmlFor="businessLogo"
                            className="text-xs text-sage-600 hover:text-sage-700 cursor-pointer underline mt-1 inline-block"
                          >
                            Change logo
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDocuments(p => ({ ...p, businessLogo: null }))}
                          className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="businessLogo" className="cursor-pointer block p-6 text-center">
                        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">Click to upload your logo</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, SVG, WebP — max 5MB</p>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Review Your Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Business:</span> {formData.businessName}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span> {formData.businessType}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Experience:</span> {formData.yearsExperience}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Contact:</span> {formData.phone} | {formData.email}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Your application will be reviewed within 2-3 business days.
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-between pt-6 md:pt-10 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="rounded-full px-5 md:px-8 py-5 md:py-6 border-slate-200 hover:bg-slate-50 transition-colors text-sm md:text-base"
              >
                Previous
              </Button>
              {currentStep < 6 ? (
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="rounded-full px-6 md:px-10 py-5 md:py-6 bg-[#668c65] hover:bg-[#557555] text-white shadow-xl shadow-slate-200 transition-all duration-300 transform hover:-translate-y-0.5 text-sm md:text-base font-semibold"
                >
                  <span className="flex items-center gap-2">
                    {isSubmitting ? "Verifying..." : currentStep === 4 ? "Verify Identity" : "Next Step"}
                    {currentStep !== 4 && <ArrowRight className="w-4 h-4" />}
                  </span>
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-full px-8 md:px-12 py-5 md:py-6 bg-[#668c65] hover:bg-[#557555] text-white shadow-xl shadow-slate-200 transition-all duration-300 transform hover:-translate-y-0.5 text-sm md:text-base font-semibold"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
