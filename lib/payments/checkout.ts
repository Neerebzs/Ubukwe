/**
 * In-app IremboPay checkout orchestration (no redirect).
 *
 * Branches on the chosen method:
 *   • mobile_money — backend already pushed the prompt; poll until it settles.
 *   • card         — open the inline widget, then verify (with a short poll
 *                     fallback in case the webhook lands first).
 *
 * Pages stay thin: collect phone/provider for mobile money, then await one call.
 */
import {
  createPayment,
  verifyPayment,
  pollPaymentStatus,
  initiateTicketOrder,
  verifyTicketOrder,
  pollTicketOrder,
  openIrembopayWidget,
  type Payment,
  type MomoProvider,
  type SettledTicketOrder,
  type TicketOrderItemInput,
} from "@/lib/api/payments";

export type CheckoutPhase =
  | "creating"
  | "prompt_sent" // mobile money: prompt is on the customer's phone
  | "widget" // card: IremboPay modal is open
  | "verifying"
  | "completed"
  | "failed";

export async function payForBooking(params: {
  bookingId: string;
  method: "card" | "mobile_money";
  phoneNumber?: string;
  provider?: MomoProvider;
  onPhase?: (phase: CheckoutPhase) => void;
}): Promise<Payment> {
  const onPhase = params.onPhase ?? (() => {});
  onPhase("creating");
  const cfg = await createPayment({
    bookingId: params.bookingId,
    paymentMethod: params.method,
    phoneNumber: params.phoneNumber,
    provider: params.provider,
  });

  if (params.method === "mobile_money") {
    onPhase("prompt_sent");
    const payment = await pollPaymentStatus(cfg.payment_id);
    if (payment.status !== "completed") {
      throw new Error("The mobile money payment wasn't completed. Please try again.");
    }
    return payment;
  }

  // Card — open the secure inline widget, then confirm.
  onPhase("widget");
  await openIrembopayWidget(cfg);
  onPhase("verifying");
  let payment = await verifyPayment(cfg.payment_id);
  if (payment.status !== "completed") {
    payment = await pollPaymentStatus(cfg.payment_id, { timeoutMs: 20000 });
  }
  if (payment.status !== "completed") {
    throw new Error("We couldn't confirm your card payment yet. If you were charged, it will update shortly.");
  }
  return payment;
}

export async function payForTickets(params: {
  eventId: string;
  customerEmail: string;
  method: "card" | "mobile_money";
  items: TicketOrderItemInput[];
  phoneNumber?: string;
  provider?: MomoProvider;
  onPhase?: (phase: CheckoutPhase) => void;
}): Promise<SettledTicketOrder> {
  const onPhase = params.onPhase ?? (() => {});
  onPhase("creating");
  const cfg = await initiateTicketOrder({
    eventId: params.eventId,
    customerEmail: params.customerEmail,
    paymentMethod: params.method,
    phoneNumber: params.phoneNumber,
    provider: params.provider,
    items: params.items,
  });

  if (params.method === "mobile_money") {
    onPhase("prompt_sent");
    const order = await pollTicketOrder(cfg.order_id);
    if (order.status !== "completed") {
      throw new Error(order.reason || "The mobile money payment wasn't completed. Please try again.");
    }
    return order;
  }

  onPhase("widget");
  await openIrembopayWidget(cfg);
  onPhase("verifying");
  let order = await verifyTicketOrder(cfg.order_id);
  if (order.status !== "completed") {
    order = await pollTicketOrder(cfg.order_id, { timeoutMs: 20000 });
  }
  if (order.status !== "completed") {
    throw new Error(order.reason || "We couldn't confirm your card payment yet. If you were charged, your tickets will appear shortly.");
  }
  return order;
}
