import { apiClient, API_ENDPOINTS } from "../api";

/**
 * IremboPay payments — kept entirely in-app (no redirect).
 *
 *   • Mobile Money: the backend creates an invoice and pushes a prompt to the
 *     customer's phone. The UI then polls `verifyPayment` until it settles.
 *   • Card: the backend creates an invoice; the UI opens IremboPay's secure
 *     inline widget (a modal over the page) with the invoice number + public key,
 *     then verifies once the widget reports success.
 *
 * Typical usage from a page:
 *   const cfg = await createPayment({ bookingId, paymentMethod: "mobile_money", phoneNumber, provider });
 *   const payment = await pollPaymentStatus(cfg.payment_id, { onUpdate: setStatus });
 *
 *   const cfg = await createPayment({ bookingId, paymentMethod: "card" });
 *   await openIrembopayWidget(cfg);            // resolves when the customer pays
 *   const payment = await verifyPayment(cfg.payment_id);
 */

export type PaymentMethod = "mobile_money" | "card" | "bank_transfer" | "cash";
export type MomoProvider = "MTN" | "AIRTEL";

/** Browser-safe bits the widget needs, returned on every create/initiate call. */
export interface IrembopayWidgetConfig {
  invoice_number: string;
  payment_method: string;
  amount: number;
  currency: string;
  momo_initiated?: boolean;
  momo_message?: string | null;
  public_key?: string | null;
  widget_script_url?: string | null;
  environment?: string | null;
}

export interface PaymentInitResponse extends IrembopayWidgetConfig {
  payment_id: string;
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

const DEFAULT_WIDGET_SRC = "https://dashboard.irembopay.com/assets/payment/inline.js";

declare global {
  interface Window {
    // IremboPay inline.js global (loaded on demand for card payments)
    IremboPay?: any;
  }
}

// ── Booking payments ─────────────────────────────────────────────────────────

/** Create a booking payment. For mobile_money, pass phoneNumber + provider. */
export async function createPayment(params: {
  bookingId: string;
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
  provider?: MomoProvider;
  notes?: string;
}): Promise<PaymentInitResponse> {
  const response = await apiClient.post<PaymentInitResponse>(API_ENDPOINTS.PAYMENTS.CREATE, {
    booking_id: params.bookingId,
    payment_method: params.paymentMethod,
    phone_number: params.phoneNumber,
    provider: params.provider,
    notes: params.notes,
  });
  return response.data as PaymentInitResponse;
}

/** Verify a booking payment's invoice; confirms the booking on success. Safe to poll. */
export async function verifyPayment(paymentId: string): Promise<Payment> {
  const response = await apiClient.post<Payment>(API_ENDPOINTS.PAYMENTS.VERIFY(paymentId), {});
  return response.data as Payment;
}

/** Fetch a payment's current state. */
export async function getPayment(paymentId: string): Promise<Payment> {
  const response = await apiClient.get<Payment>(API_ENDPOINTS.PAYMENTS.GET(paymentId));
  return response.data as Payment;
}

// ── Ticket orders (event tickets, public endpoints) ─────────────────────────

export interface TicketOrderItemInput {
  ticket_type_id: string;
  tickets: Array<{
    holder_name?: string;
    holder_email: string;
    holder_phone?: string;
  }>;
}

export interface TicketOrderInitResponse extends IrembopayWidgetConfig {
  order_id: string;
}

export interface SettledTicketOrder {
  order_id: string;
  status: string; // "completed" | "pending" | "failed"
  reason?: string | null;
  event_id?: string;
  event_title?: string;
  event_date?: string;
  event_location?: string;
  event_image?: string | null;
  customer_email?: string;
  quantity?: number;
  total_price?: number;
  currency?: string;
  payment_reference?: string;
  tickets?: Array<{
    ticket_id: string;
    ticket_number: string;
    holder_name: string;
    holder_email: string;
    ticket_type: string;
    price: number;
    status: string;
  }>;
}

/** Create a ticket order. For mobile_money, pass phoneNumber + provider. */
export async function initiateTicketOrder(params: {
  eventId: string;
  customerEmail: string;
  paymentMethod: "card" | "mobile_money";
  phoneNumber?: string;
  provider?: MomoProvider;
  items: TicketOrderItemInput[];
}): Promise<TicketOrderInitResponse> {
  const response = await apiClient.post<TicketOrderInitResponse>(API_ENDPOINTS.TICKET_ORDERS.INITIATE, {
    event_id: params.eventId,
    customer_email: params.customerEmail,
    payment_method: params.paymentMethod,
    phone_number: params.phoneNumber,
    provider: params.provider,
    items: params.items,
  });
  return response.data as TicketOrderInitResponse;
}

/** Verify a ticket order's invoice; issues tickets on success (idempotent). Safe to poll. */
export async function verifyTicketOrder(orderId: string): Promise<SettledTicketOrder> {
  const response = await apiClient.post<SettledTicketOrder>(API_ENDPOINTS.TICKET_ORDERS.VERIFY(orderId), {});
  return response.data as SettledTicketOrder;
}

// ── IremboPay inline widget (card payments) ─────────────────────────────────

let widgetScriptPromise: Promise<void> | null = null;

/** Inject IremboPay's inline.js once and resolve when window.IremboPay is ready. */
export function loadIrembopayScript(scriptUrl?: string | null): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IremboPay widget can only load in the browser"));
  }
  if (window.IremboPay) return Promise.resolve();
  if (widgetScriptPromise) return widgetScriptPromise;

  const src = scriptUrl || DEFAULT_WIDGET_SRC;
  widgetScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing && window.IremboPay) {
      resolve();
      return;
    }
    const script = existing ?? document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      widgetScriptPromise = null;
      reject(new Error("Failed to load the IremboPay payment widget"));
    };
    if (!existing) document.body.appendChild(script);
  });
  return widgetScriptPromise;
}

/**
 * Open IremboPay's inline card widget for an invoice. Resolves when the customer
 * completes payment, rejects if they close it or it errors. The caller should
 * then verify with the backend (verifyPayment / verifyTicketOrder).
 */
export async function openIrembopayWidget(config: IrembopayWidgetConfig): Promise<void> {
  if (!config.public_key) {
    throw new Error("Card payments are not configured (missing IremboPay public key)");
  }
  await loadIrembopayScript(config.widget_script_url);
  const IremboPay = window.IremboPay;
  if (!IremboPay?.initiate) {
    throw new Error("The IremboPay widget failed to initialise");
  }

  return new Promise<void>((resolve, reject) => {
    let settled = false;
    IremboPay.initiate({
      publicKey: config.public_key,
      invoiceNumber: config.invoice_number,
      locale: IremboPay.locale?.EN ?? "EN",
      callback: (err: any, _resp: any) => {
        if (settled) return;
        settled = true;
        if (err) {
          reject(new Error(err?.message || "Payment was not completed"));
        } else {
          resolve();
        }
      },
    });
  });
}

// ── Polling helpers (mobile money & post-widget confirmation) ───────────────

export interface PollOptions {
  intervalMs?: number;
  timeoutMs?: number;
  onUpdate?: (status: string) => void;
}

/** Poll verifyPayment until the payment completes or fails (or times out). */
export async function pollPaymentStatus(
  paymentId: string,
  opts: PollOptions = {}
): Promise<Payment> {
  const intervalMs = opts.intervalMs ?? 3000;
  const timeoutMs = opts.timeoutMs ?? 120000;
  const deadline = Date.now() + timeoutMs;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let payment: Payment;
    try {
      payment = await verifyPayment(paymentId);
    } catch {
      payment = await getPayment(paymentId);
    }
    opts.onUpdate?.(payment.status);
    if (payment.status === "completed" || payment.status === "failed") {
      return payment;
    }
    if (Date.now() >= deadline) return payment; // still pending — let the UI decide
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

/** Poll verifyTicketOrder until the order settles or fails (or times out). */
export async function pollTicketOrder(
  orderId: string,
  opts: PollOptions = {}
): Promise<SettledTicketOrder> {
  const intervalMs = opts.intervalMs ?? 3000;
  const timeoutMs = opts.timeoutMs ?? 120000;
  const deadline = Date.now() + timeoutMs;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const order = await verifyTicketOrder(orderId);
    opts.onUpdate?.(order.status);
    if (order.status === "completed" || order.status === "failed") {
      return order;
    }
    if (Date.now() >= deadline) return order;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
