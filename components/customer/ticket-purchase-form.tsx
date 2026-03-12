"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Loader2, Plus, Minus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PublicEvent, PublicTicketType } from "@/lib/api/customer-events";

interface TicketPurchaseFormProps {
  event: PublicEvent;
  onSubmit: (data: {
    ticketTypeId: string;
    quantity: number;
    holderName: string;
    holderEmail: string;
    holderPhone?: string;
  }) => void;
  isLoading?: boolean;
  error?: string;
}

export function TicketPurchaseForm({
  event,
  onSubmit,
  isLoading = false,
  error,
}: TicketPurchaseFormProps) {
  const [selectedTicketType, setSelectedTicketType] = useState<PublicTicketType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [holderName, setHolderName] = useState("");
  const [holderEmail, setHolderEmail] = useState("");
  const [holderPhone, setHolderPhone] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!selectedTicketType) {
      errors.ticketType = "Please select a ticket type";
    }

    if (quantity < 1) {
      errors.quantity = "Quantity must be at least 1";
    }

    if (!holderName.trim()) {
      errors.holderName = "Name is required";
    }

    if (!holderEmail.trim()) {
      errors.holderEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(holderEmail)) {
      errors.holderEmail = "Please enter a valid email";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!selectedTicketType) return;

    onSubmit({
      ticketTypeId: selectedTicketType.id,
      quantity,
      holderName,
      holderEmail,
      holderPhone: holderPhone || undefined,
    });
  };

  const availableTickets = selectedTicketType
    ? selectedTicketType.quantity - selectedTicketType.sold
    : 0;

  const totalPrice = selectedTicketType ? selectedTicketType.price * quantity : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Ticket Type Selection */}
      <div className="space-y-3">
        <Label htmlFor="ticket-type" className="text-base font-semibold">
          Select Ticket Type
        </Label>
        <Select
          value={selectedTicketType?.id || ""}
          onValueChange={(value) => {
            const ticket = event.ticket_types.find((t) => t.id === value);
            setSelectedTicketType(ticket || null);
            setQuantity(1);
          }}
        >
          <SelectTrigger
            id="ticket-type"
            className={`h-12 ${formErrors.ticketType ? "border-red-500" : ""}`}
          >
            <SelectValue placeholder="Choose a ticket type..." />
          </SelectTrigger>
          <SelectContent>
            {event.ticket_types.map((ticketType) => {
              const available = ticketType.quantity - ticketType.sold;
              return (
                <SelectItem key={ticketType.id} value={ticketType.id}>
                  <div className="flex items-center gap-2">
                    <span>{ticketType.name}</span>
                    <span className="text-slate-500">
                      ({available} available)
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {formErrors.ticketType && (
          <p className="text-sm text-red-500">{formErrors.ticketType}</p>
        )}
      </div>

      {/* Ticket Type Details */}
      {selectedTicketType && (
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-900">{selectedTicketType.name}</p>
                  {selectedTicketType.description && (
                    <p className="text-sm text-slate-600 mt-1">
                      {selectedTicketType.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {selectedTicketType.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">RWF per ticket</p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between text-sm">
                <span className="text-slate-600">Available:</span>
                <span className="font-semibold text-slate-900">{availableTickets} tickets</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quantity Selection */}
      {selectedTicketType && (
        <div className="space-y-3">
          <Label htmlFor="quantity" className="text-base font-semibold">
            Quantity
          </Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || isLoading}
              className="h-10 w-10"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={availableTickets}
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setQuantity(Math.min(Math.max(1, val), availableTickets));
              }}
              className="h-10 text-center font-semibold"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.min(availableTickets, quantity + 1))}
              disabled={quantity >= availableTickets || isLoading}
              className="h-10 w-10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {formErrors.quantity && (
            <p className="text-sm text-red-500">{formErrors.quantity}</p>
          )}
        </div>
      )}

      {/* Holder Information */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h3 className="font-semibold text-slate-900">Ticket Holder Information</h3>

        <div className="space-y-3">
          <Label htmlFor="holder-name" className="text-sm font-medium">
            Full Name *
          </Label>
          <Input
            id="holder-name"
            placeholder="Enter your full name"
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            disabled={isLoading}
            className={`h-10 ${formErrors.holderName ? "border-red-500" : ""}`}
          />
          {formErrors.holderName && (
            <p className="text-sm text-red-500">{formErrors.holderName}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="holder-email" className="text-sm font-medium">
            Email Address *
          </Label>
          <Input
            id="holder-email"
            type="email"
            placeholder="Enter your email"
            value={holderEmail}
            onChange={(e) => setHolderEmail(e.target.value)}
            disabled={isLoading}
            className={`h-10 ${formErrors.holderEmail ? "border-red-500" : ""}`}
          />
          {formErrors.holderEmail && (
            <p className="text-sm text-red-500">{formErrors.holderEmail}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="holder-phone" className="text-sm font-medium">
            Phone Number (Optional)
          </Label>
          <Input
            id="holder-phone"
            type="tel"
            placeholder="Enter your phone number"
            value={holderPhone}
            onChange={(e) => setHolderPhone(e.target.value)}
            disabled={isLoading}
            className="h-10"
          />
        </div>
      </div>

      {/* Price Summary */}
      {selectedTicketType && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  {selectedTicketType.name} × {quantity}
                </span>
                <span className="font-medium">
                  {(selectedTicketType.price * quantity).toLocaleString()} RWF
                </span>
              </div>
              <div className="pt-2 border-t border-primary/10 flex justify-between">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-xl font-bold text-primary">
                  {totalPrice.toLocaleString()} RWF
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!selectedTicketType || isLoading}
        className="w-full h-12 font-semibold text-base"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Proceed to Payment"
        )}
      </Button>
    </form>
  );
}
