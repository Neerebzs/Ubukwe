"use client"

import React, { useState } from "react"
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
import { HelpCircle, Loader2, Send, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { axiosInstance } from "@/lib/api-client"

export function SupportWidget() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    sender_email: "",
    sender_name: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subject || !formData.message || !formData.sender_email) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      await axiosInstance.post("/api/v1/admin/support/submit", formData)
      setSubmitted(true)
      toast.success("Support request sent! Check your email for confirmation.")
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to send support request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = (val: boolean) => {
    setOpen(val)
    if (!val) {
      setTimeout(() => {
        setSubmitted(false)
        setFormData({ subject: "", message: "", sender_email: "", sender_name: "" })
      }, 300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 p-0 bg-slate-900 border border-white/10 hover:bg-slate-800 hover:scale-110 transition-all duration-300 group"
          aria-label="Contact Support"
        >
          <HelpCircle className="h-7 w-7 text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#608d64] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#608d64]"></span>
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-white/10 text-white shadow-2xl">
        {submitted ? (
          <div className="py-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#608d64]/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-[#608d64]" />
            </div>
            <h3 className="text-2xl font-serif italic">Request Sent!</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              We've received your message and sent a confirmation to <span className="text-white font-medium">{formData.sender_email}</span>.
              Our team will reply to your email shortly.
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
                <HelpCircle className="h-6 w-6 text-[#608d64]" />
                System Support
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Have a question or encountered a bug? Send us a message and we'll reply to your email.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sender_name" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Name
                  </Label>
                  <Input
                    id="sender_name"
                    placeholder="Your name"
                    className="bg-white/5 border-white/10 text-white rounded-xl h-11 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 placeholder:text-slate-600"
                    value={formData.sender_name}
                    onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
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
                    value={formData.sender_email}
                    onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
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
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
