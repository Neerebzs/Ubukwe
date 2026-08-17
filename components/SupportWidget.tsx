"use client"

import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HelpCircle, Loader2, Send, CheckCircle, MessageSquareHeart, Star } from "lucide-react"
import { toast } from "sonner"
import { axiosInstance } from "@/lib/api-client"
import { userManager } from "@/lib/auth"
import { cn } from "@/lib/utils"

type WidgetTab = "support" | "testimony"

const ROLE_OPTIONS = ["Bride", "Groom", "Couple", "Family", "Guest"] as const

const emptySupport = {
  subject: "",
  message: "",
  sender_email: "",
  sender_name: "",
}

const emptyTestimony = {
  author_name: "",
  author_email: "",
  message: "",
  author_role: "",
  wedding_date: "",
  rating: 0,
}

export function SupportWidget() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<WidgetTab>("support")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<WidgetTab | null>(null)
  const [supportForm, setSupportForm] = useState(emptySupport)
  const [testimonyForm, setTestimonyForm] = useState(emptyTestimony)

  useEffect(() => {
    if (!open) return
    const user = userManager.getUser()
    if (!user) return
    const name = user.full_name || user.username || ""
    const email = user.email || ""
    setSupportForm((prev) => ({
      ...prev,
      sender_name: prev.sender_name || name,
      sender_email: prev.sender_email || email,
    }))
    setTestimonyForm((prev) => ({
      ...prev,
      author_name: prev.author_name || name,
      author_email: prev.author_email || email,
    }))
  }, [open])

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supportForm.subject || !supportForm.message || !supportForm.sender_email) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      await axiosInstance.post("/api/v1/admin/support/submit", supportForm)
      setSubmitted("support")
      toast.success("Support request sent! Check your email for confirmation.")
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to send support request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTestimonySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!testimonyForm.author_name || !testimonyForm.author_email || !testimonyForm.message) {
      toast.error("Please fill in your name, email, and testimony")
      return
    }
    if (testimonyForm.message.trim().length < 20) {
      toast.error("Please share a little more — at least 20 characters")
      return
    }

    setIsSubmitting(true)
    try {
      await axiosInstance.post("/api/v1/admin/testimonials/submit", {
        author_name: testimonyForm.author_name.trim(),
        author_email: testimonyForm.author_email.trim(),
        message: testimonyForm.message.trim(),
        author_role: testimonyForm.author_role || undefined,
        wedding_date: testimonyForm.wedding_date || undefined,
        rating: testimonyForm.rating || undefined,
      })
      setSubmitted("testimony")
      toast.success("Thank you! Your testimony was submitted for review.")
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to submit testimony. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = (val: boolean) => {
    setOpen(val)
    if (!val) {
      setTimeout(() => {
        setSubmitted(null)
        setActiveTab("support")
        setSupportForm(emptySupport)
        setTestimonyForm(emptyTestimony)
      }, 300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 p-0 bg-slate-900 border border-white/10 hover:bg-slate-800 hover:scale-110 transition-all duration-300 group"
          aria-label="Contact Support or Share Testimony"
        >
          <HelpCircle className="h-7 w-7 text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#608d64] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#608d64]"></span>
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[460px] bg-slate-900 border-white/10 text-white shadow-2xl">
        {submitted ? (
          <div className="py-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#608d64]/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-[#608d64]" />
            </div>
            <h3 className="text-2xl font-serif italic">
              {submitted === "testimony" ? "Thank You!" : "Request Sent!"}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {submitted === "testimony" ? (
                <>
                  We received your testimony and sent a confirmation to{" "}
                  <span className="text-white font-medium">{testimonyForm.author_email}</span>.
                  Our team will review it before it appears on the homepage.
                </>
              ) : (
                <>
                  We've received your message and sent a confirmation to{" "}
                  <span className="text-white font-medium">{supportForm.sender_email}</span>.
                  Our team will reply to your email shortly.
                </>
              )}
            </p>
            <Button
              onClick={() => handleClose(false)}
              className="mt-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold"
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif italic flex items-center gap-2">
                {activeTab === "support" ? (
                  <>
                    <HelpCircle className="h-6 w-6 text-[#608d64]" />
                    System Support
                  </>
                ) : (
                  <>
                    <MessageSquareHeart className="h-6 w-6 text-[#608d64]" />
                    Share Your Story
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {activeTab === "support"
                  ? "Have a question or encountered a bug? Send us a message and we'll reply to your email."
                  : "Loved planning with us? Share a testimony — after review, it may appear on our homepage."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("support")}
                className={cn(
                  "flex-1 h-9 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all",
                  activeTab === "support"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
              >
                Support
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("testimony")}
                className={cn(
                  "flex-1 h-9 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all",
                  activeTab === "testimony"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
              >
                Testimony
              </button>
            </div>

            {activeTab === "support" ? (
              <form onSubmit={handleSupportSubmit} className="space-y-4 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="sender_name" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Name
                    </Label>
                    <Input
                      id="sender_name"
                      placeholder="Your name"
                      className="bg-white/5 border-white/10 text-white rounded-xl h-11 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 placeholder:text-slate-600"
                      value={supportForm.sender_name}
                      onChange={(e) => setSupportForm({ ...supportForm, sender_name: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sender_email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Email <span className="text-[#608d64]">*</span>
                    </Label>
                    <Input
                      id="sender_email"
                      type="email"
                      placeholder="you@email.com"
                      className="bg-white/5 border-white/10 text-white rounded-xl h-11 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 placeholder:text-slate-600"
                      value={supportForm.sender_email}
                      onChange={(e) => setSupportForm({ ...supportForm, sender_email: e.target.value })}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Subject <span className="text-[#608d64]">*</span>
                  </Label>
                  <Input
                    id="subject"
                    placeholder="How can we help?"
                    className="bg-white/5 border-white/10 text-white rounded-xl h-11 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 placeholder:text-slate-600"
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Message <span className="text-[#608d64]">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us what's happening..."
                    className="bg-white/5 border-white/10 text-white rounded-xl min-h-[110px] focus:ring-[#608d64]/20 focus:border-[#608d64]/40 resize-none placeholder:text-slate-600"
                    value={supportForm.message}
                    onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <DialogFooter className="pt-1">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-white hover:bg-[#8ca88b] text-slate-900 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" />Send Request</>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            ) : (
              <form onSubmit={handleTestimonySubmit} className="space-y-4 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="author_name" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Name <span className="text-[#608d64]">*</span>
                    </Label>
                    <Input
                      id="author_name"
                      placeholder="Your name"
                      className="bg-white/5 border-white/10 text-white rounded-xl h-11 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 placeholder:text-slate-600"
                      value={testimonyForm.author_name}
                      onChange={(e) => setTestimonyForm({ ...testimonyForm, author_name: e.target.value })}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="author_email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Email <span className="text-[#608d64]">*</span>
                    </Label>
                    <Input
                      id="author_email"
                      type="email"
                      placeholder="you@email.com"
                      className="bg-white/5 border-white/10 text-white rounded-xl h-11 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 placeholder:text-slate-600"
                      value={testimonyForm.author_email}
                      onChange={(e) => setTestimonyForm({ ...testimonyForm, author_email: e.target.value })}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      I am
                    </Label>
                    <select
                      className="w-full h-11 rounded-xl bg-white/5 border border-white/10 text-white text-sm px-3 focus:outline-none focus:ring-[#608d64]/20 focus:border-[#608d64]/40"
                      value={testimonyForm.author_role}
                      onChange={(e) => setTestimonyForm({ ...testimonyForm, author_role: e.target.value })}
                      disabled={isSubmitting}
                    >
                      <option value="" className="bg-slate-900 text-slate-400">Select…</option>
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role} className="bg-slate-900 text-white">
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="wedding_date" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Wedding date
                    </Label>
                    <Input
                      id="wedding_date"
                      type="date"
                      className="bg-white/5 border-white/10 text-white rounded-xl h-11 focus:ring-[#608d64]/20 focus:border-[#608d64]/40"
                      value={testimonyForm.wedding_date}
                      onChange={(e) => setTestimonyForm({ ...testimonyForm, wedding_date: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Rating
                  </Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTestimonyForm({ ...testimonyForm, rating: star })}
                        className="p-0.5"
                        disabled={isSubmitting}
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={cn(
                            "h-6 w-6 transition-colors",
                            star <= testimonyForm.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-600 hover:text-amber-300"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="testimony_message" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Your testimony <span className="text-[#608d64]">*</span>
                  </Label>
                  <Textarea
                    id="testimony_message"
                    placeholder="Tell couples what it was like planning with Ubukwe..."
                    className="bg-white/5 border-white/10 text-white rounded-xl min-h-[110px] focus:ring-[#608d64]/20 focus:border-[#608d64]/40 resize-none placeholder:text-slate-600"
                    value={testimonyForm.message}
                    onChange={(e) => setTestimonyForm({ ...testimonyForm, message: e.target.value })}
                    disabled={isSubmitting}
                    maxLength={2000}
                    required
                  />
                  <p className="text-[10px] text-slate-600 text-right">{testimonyForm.message.length}/2000</p>
                </div>

                <DialogFooter className="pt-1">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-white hover:bg-[#8ca88b] text-slate-900 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" />Submit Testimony</>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
