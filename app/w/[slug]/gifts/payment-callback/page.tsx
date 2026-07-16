import { Suspense } from "react";
import { GiftPaymentCallback } from "@/components/public-wedding/gift-payment-callback";

export default function GiftPaymentCallbackPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f9fafc]">
          Confirming payment…
        </div>
      }
    >
      <GiftPaymentCallback slug={params.slug} />
    </Suspense>
  );
}
