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
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none">
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
