import { apiClient, API_ENDPOINTS } from "../api";

/**
 * DPO Pay hosted-page payments.
 *
 * Flow (redirect — the customer pays on DPO's hosted payment page):
 *   1. POST /payments                → backend registers the transaction with DPO
 *                                      (createToken) and returns a payment_url
 *   2. window.location = payment_url → customer pays on the DPO page (card / mobile money)
 *   3. DPO redirects back            → /payment/callback?payment_id=...&TransactionToken=...
 *   4. POST /{id}/verify-dpo         → backend verifies with DPO and confirms the booking
 *
 * Usage from your UI:
 *   await startDpoPayment({ bookingId, paymentMethod: "mobile_money" });
 *   // the browser navigates away; the /payment/callback page completes the flow
 */

export type PaymentMethod = "mobile_money" | "card" | "bank_transfer" | "cash";

// Config the backend returns to start the DPO redirect
export interface DpoPaymentConfig {
  payment_id: string;
  payment_url: string;
  trans_token: string;
  tx_ref: string;
  amount: number;
  currency: string;
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

/** Create the payment on the backend and get the DPO hosted page URL. */
export async function createPayment(params: {
  bookingId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}): Promise<DpoPaymentConfig> {
  const response = await apiClient.post<DpoPaymentConfig>(API_ENDPOINTS.PAYMENTS.CREATE, {
    booking_id: params.bookingId,
    payment_method: params.paymentMethod,
    notes: params.notes,
  });
  return response.data as DpoPaymentConfig;
}

/**
 * Confirm a DPO transaction on the backend after the redirect back.
 * The token is optional — the backend falls back to the one stored at creation.
 */
export async function verifyPayment(paymentId: string, transactionToken?: string): Promise<Payment> {
  const response = await apiClient.post<Payment>(API_ENDPOINTS.PAYMENTS.VERIFY_DPO(paymentId), {
    transaction_token: transactionToken || undefined,
  });
  return response.data as Payment;
}

/** Fetch a payment's current state (used by the callback page to poll pending payments). */
export async function getPayment(paymentId: string): Promise<Payment> {
  const response = await apiClient.get<Payment>(API_ENDPOINTS.PAYMENTS.GET(paymentId));
  return response.data as Payment;
}

/**
 * End-to-end hosted-page payment: create → redirect to DPO.
 * This navigates the browser away; on return, /payment/callback verifies and
 * shows the result. Resolves with the created config just before redirecting
 * (useful for storing context), so callers should not expect to keep running.
 */
export async function startDpoPayment(params: {
  bookingId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}): Promise<DpoPaymentConfig> {
  if (typeof window === "undefined") {
    throw new Error("DPO payments can only be started in the browser");
  }
  const config = await createPayment(params);
  if (!config?.payment_url) {
    throw new Error("The server did not return a DPO payment URL");
  }
  window.location.assign(config.payment_url);
  return config;
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

export interface TicketOrderConfig {
  order_id: string;
  payment_url: string;
  trans_token: string;
  tx_ref: string;
  amount: number;
  currency: string;
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

/** Create a pending ticket order (one DPO charge for the whole checkout). */
export async function initiateTicketOrder(params: {
  eventId: string;
  customerEmail: string;
  paymentMethod: "card" | "mobile_money";
  items: TicketOrderItemInput[];
}): Promise<TicketOrderConfig> {
  const response = await apiClient.post<TicketOrderConfig>(API_ENDPOINTS.TICKET_ORDERS.INITIATE, {
    event_id: params.eventId,
    customer_email: params.customerEmail,
    payment_method: params.paymentMethod,
    items: params.items,
  });
  return response.data as TicketOrderConfig;
}

/**
 * Verify a ticket order after the redirect back from DPO. Issues the tickets
 * on success (idempotent — safe to call again).
 */
export async function verifyTicketOrder(orderId: string, transactionToken?: string): Promise<SettledTicketOrder> {
  const response = await apiClient.post<SettledTicketOrder>(API_ENDPOINTS.TICKET_ORDERS.VERIFY(orderId), {
    transaction_token: transactionToken || undefined,
  });
  return response.data as SettledTicketOrder;
}

/** End-to-end ticket payment: create the order → redirect to the DPO page. */
export async function startTicketDpoPayment(params: {
  eventId: string;
  customerEmail: string;
  paymentMethod: "card" | "mobile_money";
  items: TicketOrderItemInput[];
}): Promise<TicketOrderConfig> {
  if (typeof window === "undefined") {
    throw new Error("DPO payments can only be started in the browser");
  }
  const config = await initiateTicketOrder(params);
  if (!config?.payment_url) {
    throw new Error("The server did not return a DPO payment URL");
  }
  window.location.assign(config.payment_url);
  return config;
}
