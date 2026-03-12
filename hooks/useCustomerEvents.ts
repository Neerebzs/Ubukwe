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
export const usePublicEvents = (category?: string, status?: string) => {
  return useQuery({
    queryKey: ["public-events", category, status],
    queryFn: () => customerEventAPI.getEvents(category, status),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Purchase ticket mutation
export const usePurchaseTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      ticketTypeId,
      ticketData,
    }: {
      eventId: string;
      ticketTypeId: string;
      ticketData: any;
    }) => customerEventAPI.purchaseTicket(eventId, ticketTypeId, ticketData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["public-events"] });
    },
  });
};

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
