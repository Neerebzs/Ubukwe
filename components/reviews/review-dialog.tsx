"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ReviewForm } from "./review-form"
import { useState } from "react"

interface ReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  serviceName: string
  providerName: string
  onSuccess?: () => void
}

export function ReviewDialog({ 
  isOpen, 
  onClose, 
  bookingId, 
  serviceName, 
  providerName,
  onSuccess 
}: ReviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] md:max-w-4xl p-0 border-none bg-transparent shadow-none max-h-[90vh] overflow-y-auto rounded-[2rem] md:rounded-[2.5rem] scrollbar-hide focus:outline-none translate-y-[-50%]">
        <ReviewForm 
          bookingId={bookingId}
          serviceName={serviceName}
          providerName={providerName}
          onSubmit={() => {
            onSuccess?.();
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
