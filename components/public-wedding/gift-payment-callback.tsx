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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function GiftPaymentCallback({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const contributionId = searchParams.get("contribution_id") || "";

  const [status, setStatus] = useState<"loading" | "paid" | "failed" | "pending" | "error">("loading");
  const [message, setMessage] = useState("Check your phone and approve the Mobile Money request...");
  const [reference, setReference] = useState<string | undefined>();

  useEffect(() => {
    if (!contributionId) {
      setStatus("error");
      setMessage("Missing payment reference.");
      return;
    }

    let cancelled = false;
    (async () => {
      const started = Date.now();
      try {
        while (!cancelled && Date.now() - started < 180_000) {
          const res = await apiClient.gifts.verifyPayment<VerifyResult>(contributionId);
          if (cancelled) return;
          const data = unwrapData(res);
          setMessage(data.message || "Payment update received");
          setReference(data.gift_reference);
          if (data.payment_status === "paid") {
            setStatus("paid");
            return;
          }
          if (data.payment_status === "failed") {
            setStatus("failed");
            return;
          }
          await sleep(3000);
        }
        if (!cancelled) setStatus("pending");
      } catch (err: unknown) {
        if (cancelled) return;
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Could not verify payment");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [contributionId]);

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
                  ? "Waiting for your PIN"
                  : "Something went wrong"}
        </h1>
        <p className="text-slate-600">{message}</p>
        {reference && (
          <p className="text-sm text-slate-400 font-mono">{reference}</p>
        )}
        <Button asChild variant="outline">
          <Link href={`/w/${slug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to wedding site
          </Link>
        </Button>
      </div>
    </div>
  );
}
