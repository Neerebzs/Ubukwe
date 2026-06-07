"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerEventAPI, PublicEvent, TicketPurchaseResponse } from "@/lib/api/customer-events";

// Fetch public event details
export const usePublicEvent = (eventId: string) => {
  return useQuery({
    queryKey: ["public-event", eventId],
    queryFn: () => customerEventAPI.getEvent(eventId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!eventId,
  });
};

// Fetch public events list
export const usePublicEvents = (category?: string) => {
  return useQuery({
    queryKey: ["public-events", category],
    queryFn: () => customerEventAPI.getEvents(category),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// NOTE: the old usePurchaseTicket mutation was removed — tickets are now paid
// via DPO Pay; see startTicketDpoPayment/verifyTicketOrder in lib/api/payments.ts.

// Fetch customer's tickets
export const useMyTickets = () => {
  return useQuery({
    queryKey: ["my-tickets"],
    queryFn: () => customerEventAPI.getMyTickets(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Fetch single ticket
export const useTicket = (ticketId: string) => {
  return useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => customerEventAPI.getTicket(ticketId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!ticketId,
  });
};
