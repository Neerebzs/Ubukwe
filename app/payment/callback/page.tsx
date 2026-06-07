"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Clock, Loader2, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyPayment, type Payment } from "@/lib/api/payments";

type CallbackState = "verifying" | "success" | "pending" | "failed" | "error";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<CallbackState>("verifying");
  const [payment, setPayment] = useState<Payment | null>(null);
  const [message, setMessage] = useState<string>("");

  const paymentId = searchParams.get("payment_id");
  // DPO appends its own parameters to the redirect URL
  const transactionToken = searchParams.get("TransactionToken") || searchParams.get("TransID") || undefined;

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!paymentId) {
        setState("error");
        setMessage("Missing payment reference in the callback URL.");
        return;
      }
      try {
        const result = await verifyPayment(paymentId, transactionToken);
        if (cancelled) return;
        setPayment(result);
        if (result.status === "completed") {
          setState("success");
        } else if (result.status === "failed" || result.status === "cancelled") {
          setState("failed");
          setMessage("The payment was not completed.");
        } else {
          setState("pending");
          setMessage("Your payment is still being processed. This page will not update automatically — check your bookings in a few minutes.");
        }
      } catch (err: any) {
        if (cancelled) return;
        setState("error");
        setMessage(err?.response?.data?.detail || err?.message || "We could not verify your payment.");
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [paymentId, transactionToken]);

  return (
    <div className="min-h-screen bg-[#FCFBF9] flex items-center justify-center px-6 py-20">
      <div className="bg-white rounded-[40px] p-10 md:p-14 shadow-xl shadow-slate-100 border border-slate-50 max-w-lg w-full text-center">
        {state === "verifying" && (
          <>
            <Loader2 className="h-14 w-14 text-[#668c65] animate-spin mx-auto mb-6" />
            <h1 className="font-serif text-3xl text-slate-900 mb-3">Verifying your payment…</h1>
            <p className="text-slate-500 font-light">
              Please wait while we confirm your transaction with DPO Pay. Do not close this page.
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle2 className="h-14 w-14 text-[#668c65] mx-auto mb-6" />
            <h1 className="font-serif text-3xl text-slate-900 mb-3">Payment successful</h1>
            <p className="text-slate-500 font-light mb-2">
              Your booking is confirmed. A confirmation email is on its way.
            </p>
            {payment && (
              <p className="text-sm text-slate-400 mb-8">
                Reference: <span className="font-mono">{payment.transaction_id}</span>
              </p>
            )}
            <Link href="/customer">
              <Button className="rounded-full bg-[#668c65] hover:bg-[#557454] text-white gap-2 px-8 h-12">
                Go to my bookings
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </>
        )}

        {state === "pending" && (
          <>
            <Clock className="h-14 w-14 text-amber-500 mx-auto mb-6" />
            <h1 className="font-serif text-3xl text-slate-900 mb-3">Payment processing</h1>
            <p className="text-slate-500 font-light mb-8">{message}</p>
            <Link href="/customer">
              <Button className="rounded-full bg-slate-900 hover:bg-slate-700 text-white gap-2 px-8 h-12">
                View my bookings
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </>
        )}

        {(state === "failed" || state === "error") && (
          <>
            <XCircle className="h-14 w-14 text-red-500 mx-auto mb-6" />
            <h1 className="font-serif text-3xl text-slate-900 mb-3">
              {state === "failed" ? "Payment not completed" : "Verification problem"}
            </h1>
            <p className="text-slate-500 font-light mb-8">
              {message || "Something went wrong while confirming your payment."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/customer">
                <Button variant="outline" className="rounded-full gap-2 px-6 h-12 w-full sm:w-auto">
                  <RotateCcw className="h-4 w-4" />
                  My bookings
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="rounded-full bg-slate-900 hover:bg-slate-700 text-white px-6 h-12 w-full sm:w-auto">
                  Contact support
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FCFBF9] flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-[#668c65] animate-spin" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
