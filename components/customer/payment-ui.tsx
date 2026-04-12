"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Loader2, Lock, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentUIProps {
  amount: number;
  eventTitle: string;
  ticketCount: number;
  ticketBreakdown?: Array<{ name: string; quantity: number; price: number }>;
  onPaymentSubmit: (paymentData: {
    method: "card" | "mobile_money";
    reference: string;
    cardNumber?: string;
    cardHolder?: string;
    expiryDate?: string;
    cvv?: string;
    phoneNumber?: string;
  }) => void;
  isLoading?: boolean;
  error?: string;
}

export function PaymentUI({
  amount,
  eventTitle,
  ticketCount,
  ticketBreakdown,
  onPaymentSubmit,
  isLoading = false,
  error,
}: PaymentUIProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile_money">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateCardForm = () => {
    const errors: Record<string, string> = {};

    if (!cardNumber.replace(/\s/g, "")) {
      errors.cardNumber = "Card number is required";
    } else if (!/^\d{13,19}$/.test(cardNumber.replace(/\s/g, ""))) {
      errors.cardNumber = "Invalid card number";
    }

    if (!cardHolder.trim()) {
      errors.cardHolder = "Cardholder name is required";
    }

    if (!expiryDate) {
      errors.expiryDate = "Expiry date is required";
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      errors.expiryDate = "Use MM/YY format";
    }

    if (!cvv) {
      errors.cvv = "CVV is required";
    } else if (!/^\d{3,4}$/.test(cvv)) {
      errors.cvv = "Invalid CVV";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateMobileMoneyForm = () => {
    const errors: Record<string, string> = {};

    if (!phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[0-9]{10,}$/.test(phoneNumber.replace(/\s/g, ""))) {
      errors.phoneNumber = "Invalid phone number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, "");
    if (!/^\d*$/.test(value)) return;
    
    // Format with spaces every 4 digits
    const formatted = value.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    setExpiryDate(value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCvv(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      setFormErrors({ terms: "You must agree to the terms and conditions" });
      return;
    }

    // Generate payment reference
    const paymentReference = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    if (paymentMethod === "card") {
      if (!validateCardForm()) return;
      onPaymentSubmit({
        method: "card",
        reference: paymentReference,
        cardNumber: cardNumber.replace(/\s/g, ""),
        cardHolder,
        expiryDate,
        cvv,
      });
    } else {
      if (!validateMobileMoneyForm()) return;
      onPaymentSubmit({
        method: "mobile_money",
        reference: paymentReference,
        phoneNumber,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Order Summary */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{eventTitle}</span>
              <span className="font-medium">{ticketCount} ticket(s)</span>
            </div>
            
            {ticketBreakdown && ticketBreakdown.length > 0 && (
              <div className="space-y-2 py-3 border-t border-slate-200">
                {ticketBreakdown.map((item, index) => (
                  <div key={index} className="flex justify-between text-xs text-slate-600">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString()} RWF</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="pt-3 border-t border-slate-200 flex justify-between">
              <span className="font-semibold text-slate-900">Total Amount</span>
              <span className="text-2xl font-bold text-primary">
                {amount.toLocaleString()} RWF
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="card" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Card Payment
          </TabsTrigger>
          <TabsTrigger value="mobile_money" className="gap-2">
            <Lock className="h-4 w-4" />
            Mobile Money
          </TabsTrigger>
        </TabsList>

        {/* Card Payment */}
        <TabsContent value="card" className="space-y-4 mt-6">
          <div className="space-y-3">
            <Label htmlFor="card-number" className="text-sm font-medium">
              Card Number
            </Label>
            <Input
              id="card-number"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              disabled={isLoading}
              maxLength="19"
              className={`h-10 font-mono tracking-widest ${
                formErrors.cardNumber ? "border-red-500" : ""
              }`}
            />
            {formErrors.cardNumber && (
              <p className="text-sm text-red-500">{formErrors.cardNumber}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="card-holder" className="text-sm font-medium">
              Cardholder Name
            </Label>
            <Input
              id="card-holder"
              placeholder="John Doe"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              disabled={isLoading}
              className={`h-10 ${formErrors.cardHolder ? "border-red-500" : ""}`}
            />
            {formErrors.cardHolder && (
              <p className="text-sm text-red-500">{formErrors.cardHolder}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="expiry" className="text-sm font-medium">
                Expiry Date
              </Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={handleExpiryChange}
                disabled={isLoading}
                maxLength="5"
                className={`h-10 font-mono ${
                  formErrors.expiryDate ? "border-red-500" : ""
                }`}
              />
              {formErrors.expiryDate && (
                <p className="text-sm text-red-500">{formErrors.expiryDate}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="cvv" className="text-sm font-medium">
                CVV
              </Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cvv}
                onChange={handleCvvChange}
                disabled={isLoading}
                maxLength="4"
                className={`h-10 font-mono ${formErrors.cvv ? "border-red-500" : ""}`}
              />
              {formErrors.cvv && (
                <p className="text-sm text-red-500">{formErrors.cvv}</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Mobile Money Payment */}
        <TabsContent value="mobile_money" className="space-y-4 mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900">
              You will receive a prompt on your phone to confirm the payment. Please ensure your phone is nearby.
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+250 7XX XXX XXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
              className={`h-10 ${formErrors.phoneNumber ? "border-red-500" : ""}`}
            />
            {formErrors.phoneNumber && (
              <p className="text-sm text-red-500">{formErrors.phoneNumber}</p>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              Supported providers: MTN Mobile Money, Airtel Money
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Terms and Conditions */}
      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
        <input
          type="checkbox"
          id="terms"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          disabled={isLoading}
          className="mt-1 h-4 w-4 rounded border-slate-300 cursor-pointer"
        />
        <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
          I agree to the{" "}
          <a href="#" className="text-primary hover:underline font-medium">
            terms and conditions
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary hover:underline font-medium">
            privacy policy
          </a>
        </label>
      </div>
      {formErrors.terms && (
        <p className="text-sm text-red-500">{formErrors.terms}</p>
      )}

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Lock className="h-3 w-3" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 font-semibold text-base"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Pay ${amount.toLocaleString()} RWF`
        )}
      </Button>
    </form>
  );
}
