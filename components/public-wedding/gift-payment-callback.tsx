"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";

function unwrapData<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

interface VerifyResult {
  payment_status: string;
  message: string;
  gift_reference?: string;
}

export function GiftPaymentCallback({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const contributionId = searchParams.get("contribution_id") || "";
  const transactionToken =
    searchParams.get("TransactionToken") ||
    searchParams.get("transaction_token") ||
    undefined;

  const [status, setStatus] = useState<"loading" | "paid" | "failed" | "pending" | "error">("loading");
  const [message, setMessage] = useState("Confirming your payment...");
  const [reference, setReference] = useState<string | undefined>();

  useEffect(() => {
    if (!contributionId) {
      setStatus("error");
      setMessage("Missing payment reference.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.gifts.verifyPayment<VerifyResult>(
          contributionId,
          transactionToken,
        );
        if (cancelled) return;
        const data = unwrapData(res);
        setMessage(data.message || "Payment update received");
        setReference(data.gift_reference);
        if (data.payment_status === "paid") setStatus("paid");
        else if (data.payment_status === "failed") setStatus("failed");
        else setStatus("pending");
      } catch (err: unknown) {
        if (cancelled) return;
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Could not verify payment");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [contributionId, transactionToken]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f9fafc]">
      <div className="max-w-md w-full text-center space-y-6 bg-white rounded-2xl shadow-xl p-8">
        {status === "loading" && <Loader2 className="h-12 w-12 mx-auto animate-spin text-[#668c65]" />}
        {status === "paid" && <CheckCircle className="h-12 w-12 mx-auto text-emerald-600" />}
        {(status === "failed" || status === "error") && <XCircle className="h-12 w-12 mx-auto text-red-500" />}
        {status === "pending" && <Loader2 className="h-12 w-12 mx-auto text-amber-500" />}

        <h1 className="font-serif text-3xl text-[#0d182a]">
          {status === "paid"
            ? "Payment Confirmed"
            : status === "failed"
              ? "Payment Failed"
              : status === "pending"
                ? "Payment Pending"
                : status === "loading"
                  ? "Verifying…"
                  : "Something went wrong"}
        </h1>
        <p className="text-slate-600">{message}</p>
        {reference && (
          <div className="p-4 rounded-xl bg-slate-50 border">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Gift Reference</p>
            <p className="font-mono font-bold mt-1">{reference}</p>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Button asChild className="bg-[#668c65] hover:bg-[#668c65]/90">
            <Link href={`/w/${slug}/gifts`}>Back to Gifts</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/w/${slug}`}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Wedding Site
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
