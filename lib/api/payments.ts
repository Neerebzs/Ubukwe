import { apiClient, API_ENDPOINTS } from "../api";

/**
 * Flutterwave Inline payments.
 *
 * Flow (no redirect — the modal opens inside our own UI):
 *   1. POST /payments               → backend creates a pending Payment and returns the inline config
 *   2. FlutterwaveCheckout(config)  → modal opens over our page; customer pays (card / mobile money)
 *   3. inline callback fires        → we get a Flutterwave transaction_id
 *   4. POST /{id}/verify-flutterwave → backend verifies with Flutterwave and confirms the booking
 *
 * Usage from your UI:
 *   const payment = await startFlutterwavePayment({ bookingId, paymentMethod: "mobile_money" });
 *   if (payment.status === "completed") { ...show your success UI... }
 */

const FLW_INLINE_SCRIPT = "https://checkout.flutterwave.com/v3.js";

export type PaymentMethod = "mobile_money" | "card" | "bank_transfer" | "cash";

// Config the backend returns to drive FlutterwaveCheckout()
export interface FlutterwaveInlineConfig {
  payment_id: string;
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string | null;
  title: string;
  description: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  status: string; // "pending" | "completed" | "failed" | ...
  amount: string | number;
  currency: string;
  payment_method: PaymentMethod;
  transaction_id?: string | null;
  payment_gateway?: string | null;
  paid_at?: string | null;
}

// Shape Flutterwave hands to the inline callback
interface FlutterwaveCallbackResponse {
  transaction_id?: number | string;
  tx_ref?: string;
  status?: string; // "successful" | "completed" | "cancelled" | ...
}

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: any) => { close: () => void };
    // Flutterwave injects this helper to programmatically dismiss the modal
    closePaymentModal?: () => void;
  }
}

/** Inject the Flutterwave inline script once and resolve when it is ready. */
function loadFlutterwaveScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Flutterwave inline can only run in the browser"));
      return;
    }
    if (window.FlutterwaveCheckout) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${FLW_INLINE_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Flutterwave script")));
      return;
    }
    const script = document.createElement("script");
    script.src = FLW_INLINE_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Flutterwave script"));
    document.head.appendChild(script);
  });
}

/** Create the payment on the backend and get the inline checkout config. */
export async function createPayment(params: {
  bookingId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}): Promise<FlutterwaveInlineConfig> {
  const response = await apiClient.post<FlutterwaveInlineConfig>(API_ENDPOINTS.PAYMENTS.CREATE, {
    booking_id: params.bookingId,
    payment_method: params.paymentMethod,
    notes: params.notes,
  });
  return response.data as FlutterwaveInlineConfig;
}

/** Confirm a Flutterwave transaction (id from the inline callback) on the backend. */
export async function verifyPayment(paymentId: string, transactionId: string | number): Promise<Payment> {
  const response = await apiClient.post<Payment>(API_ENDPOINTS.PAYMENTS.VERIFY_FLUTTERWAVE(paymentId), {
    transaction_id: String(transactionId),
  });
  return response.data as Payment;
}

export class PaymentCancelledError extends Error {
  constructor() {
    super("Payment was cancelled");
    this.name = "PaymentCancelledError";
  }
}

/**
 * End-to-end inline payment: create → open modal → verify.
 * Resolves with the verified Payment, or rejects with PaymentCancelledError
 * if the customer closes the modal without paying.
 */
export async function startFlutterwavePayment(params: {
  bookingId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}): Promise<Payment> {
  await loadFlutterwaveScript();
  const config = await createPayment(params);

  return new Promise<Payment>((resolve, reject) => {
    if (!window.FlutterwaveCheckout) {
      reject(new Error("Flutterwave inline failed to initialise"));
      return;
    }

    let settled = false;

    window.FlutterwaveCheckout({
      public_key: config.public_key,
      tx_ref: config.tx_ref,
      amount: config.amount,
      currency: config.currency,
      payment_options: config.payment_options,
      customer: {
        email: config.customer_email,
        phone_number: config.customer_phone || undefined,
        name: config.customer_name,
      },
      customizations: {
        title: config.title,
        description: config.description,
      },
      callback: async (data: FlutterwaveCallbackResponse) => {
        settled = true;
        // Dismiss the modal before we hit our backend to verify
        window.closePaymentModal?.();
        try {
          if (!data?.transaction_id) {
            reject(new Error("No transaction id returned by Flutterwave"));
            return;
          }
          const payment = await verifyPayment(config.payment_id, data.transaction_id);
          resolve(payment);
        } catch (err: any) {
          reject(new Error(err?.message || "Failed to verify payment"));
        }
      },
      onclose: () => {
        // Fires on cancel too; only treat as cancellation if no callback ran
        if (!settled) reject(new PaymentCancelledError());
      },
    });
  });
}
