import { apiClient, API_ENDPOINTS } from "../api";

/**
 * FDI Payments (PAY-X) — MTN MoMo and Airtel Money.
 *
 * Flow (USSD PIN on the customer's phone, not a hosted card page):
 *   1. POST /payments  with phone_number  → backend starts FDI momo/pull
 *   2. Customer approves on their phone
 *   3. Redirect to /payment/callback?payment_id=... which polls POST /{id}/verify
 *   4. FDI webhook can settle the same payment if the customer leaves the page
 */

export type PaymentMethod = "mobile_money" | "card" | "bank_transfer" | "cash";

export interface FdiPaymentConfig {
  payment_id: string;
  payment_url?: string | null;
  trans_token?: string | null;
  gw_ref?: string | null;
  tx_ref: string;
  amount: number;
  currency: string;
  status?: string;
  channel_id?: string | null;
  msisdn?: string | null;
  message?: string;
}

/** @deprecated Use FdiPaymentConfig */
export type DpoPaymentConfig = FdiPaymentConfig;

export interface Payment {
  id: string;
  booking_id: string;
  status: string; // "pending" | "processing" | "completed" | "failed" | ...
  amount: string | number;
  currency: string;
  payment_method: PaymentMethod;
  transaction_id?: string | null;
  payment_gateway?: string | null;
  paid_at?: string | null;
}

/** Create the payment on the backend and start the FDI MoMo pull. */
export async function createPayment(params: {
  bookingId: string;
  paymentMethod?: PaymentMethod;
  phoneNumber: string;
  amount?: number;
  notes?: string;
}): Promise<FdiPaymentConfig> {
  const response = await apiClient.post<FdiPaymentConfig>(API_ENDPOINTS.PAYMENTS.CREATE, {
    booking_id: params.bookingId,
    payment_method: params.paymentMethod || "mobile_money",
    phone_number: params.phoneNumber,
    amount: params.amount,
    notes: params.notes,
  });
  return response.data as FdiPaymentConfig;
}

/**
 * Confirm an FDI collection. Safe to poll — pending stays pending until
 * the customer approves (or FDI reports failure).
 */
export async function verifyPayment(paymentId: string, transactionToken?: string): Promise<Payment> {
  const response = await apiClient.post<Payment>(API_ENDPOINTS.PAYMENTS.VERIFY(paymentId), {
    transaction_token: transactionToken || undefined,
  });
  return response.data as Payment;
}

export async function getPayment(paymentId: string): Promise<Payment> {
  const response = await apiClient.get<Payment>(API_ENDPOINTS.PAYMENTS.GET(paymentId));
  return response.data as Payment;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Poll verify until completed/failed or timeout (default 3 minutes). */
export async function pollPaymentUntilSettled(
  paymentId: string,
  options?: { intervalMs?: number; timeoutMs?: number; token?: string },
): Promise<Payment> {
  const intervalMs = options?.intervalMs ?? 3000;
  const timeoutMs = options?.timeoutMs ?? 180_000;
  const started = Date.now();
  let last: Payment | null = null;
  while (Date.now() - started < timeoutMs) {
    last = await verifyPayment(paymentId, options?.token);
    if (last.status === "completed" || last.status === "failed" || last.status === "cancelled" || last.status === "refunded") {
      return last;
    }
    await sleep(intervalMs);
  }
  return last || (await getPayment(paymentId));
}

/**
 * Start a booking collection and send the customer to the waiting page.
 */
export async function startFdiPayment(params: {
  bookingId: string;
  phoneNumber: string;
  paymentMethod?: PaymentMethod;
  amount?: number;
  notes?: string;
}): Promise<FdiPaymentConfig> {
  if (typeof window === "undefined") {
    throw new Error("Payments can only be started in the browser");
  }
  if (!params.phoneNumber?.trim()) {
    throw new Error("Enter the Mobile Money number that will pay");
  }
  const config = await createPayment(params);
  const waitUrl = config.payment_url || `/payment/callback?payment_id=${config.payment_id}`;
  window.location.assign(waitUrl);
  return config;
}

/** @deprecated Use startFdiPayment */
export async function startDpoPayment(params: {
  bookingId: string;
  paymentMethod?: PaymentMethod;
  phoneNumber?: string;
  notes?: string;
}): Promise<FdiPaymentConfig> {
  return startFdiPayment({
    bookingId: params.bookingId,
    phoneNumber: params.phoneNumber || "",
    paymentMethod: params.paymentMethod,
    notes: params.notes,
  });
}

// ── Ticket orders ───────────────────────────────────────────────────────────

export interface TicketOrderItemInput {
  ticket_type_id: string;
  tickets: Array<{
    holder_name?: string;
    holder_email: string;
    holder_phone?: string;
  }>;
}

export interface TicketOrderConfig {
  order_id: string;
  payment_url?: string | null;
  trans_token?: string | null;
  tx_ref: string;
  amount: number;
  currency: string;
  status?: string;
  message?: string;
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

export async function initiateTicketOrder(params: {
  eventId: string;
  customerEmail: string;
  phoneNumber: string;
  paymentMethod?: "card" | "mobile_money";
  amount?: number;
  items: TicketOrderItemInput[];
}): Promise<TicketOrderConfig> {
  const response = await apiClient.post<TicketOrderConfig>(API_ENDPOINTS.TICKET_ORDERS.INITIATE, {
    event_id: params.eventId,
    customer_email: params.customerEmail,
    payment_method: params.paymentMethod || "mobile_money",
    phone_number: params.phoneNumber,
    amount: params.amount,
    items: params.items,
  });
  return response.data as TicketOrderConfig;
}

export async function verifyTicketOrder(orderId: string, transactionToken?: string): Promise<SettledTicketOrder> {
  const response = await apiClient.post<SettledTicketOrder>(API_ENDPOINTS.TICKET_ORDERS.VERIFY(orderId), {
    transaction_token: transactionToken || undefined,
  });
  return response.data as SettledTicketOrder;
}

export async function pollTicketOrderUntilSettled(
  orderId: string,
  options?: { intervalMs?: number; timeoutMs?: number; token?: string },
): Promise<SettledTicketOrder> {
  const intervalMs = options?.intervalMs ?? 3000;
  const timeoutMs = options?.timeoutMs ?? 180_000;
  const started = Date.now();
  let last: SettledTicketOrder | null = null;
  while (Date.now() - started < timeoutMs) {
    last = await verifyTicketOrder(orderId, options?.token);
    if (last.status === "completed" || last.status === "failed") {
      return last;
    }
    await sleep(intervalMs);
  }
  return last || { order_id: orderId, status: "pending", reason: "Timed out waiting for Mobile Money approval" };
}

export async function startTicketFdiPayment(params: {
  eventId: string;
  customerEmail: string;
  phoneNumber: string;
  paymentMethod?: "card" | "mobile_money";
  amount?: number;
  items: TicketOrderItemInput[];
}): Promise<TicketOrderConfig> {
  if (typeof window === "undefined") {
    throw new Error("Payments can only be started in the browser");
  }
  const config = await initiateTicketOrder(params);
  const waitUrl = config.payment_url || `/events/${params.eventId}/tickets?order_id=${config.order_id}`;
  window.location.assign(waitUrl);
  return config;
}

/** @deprecated Use startTicketFdiPayment */
export async function startTicketDpoPayment(params: {
  eventId: string;
  customerEmail: string;
  paymentMethod?: "card" | "mobile_money";
  phoneNumber?: string;
  items: TicketOrderItemInput[];
}): Promise<TicketOrderConfig> {
  return startTicketFdiPayment({
    ...params,
    phoneNumber: params.phoneNumber || "",
  });
}
