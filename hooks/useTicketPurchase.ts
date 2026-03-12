"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ticketPurchaseAPI,
  AvailableEvent,
  TicketTypeForPurchase,
  AvailabilityCheck,
  PurchaseConfirmation,
  CustomerTicket,
  TicketValidation,
  TicketHolder,
} from "@/lib/api/ticketPurchase";

// Fetch available events
export const useAvailableEvents = () => {
  return useQuery({
    queryKey: ["availableEvents"],
    queryFn: () => ticketPurchaseAPI.getAvailableEvents(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Fetch event details
export const useEventDetails = (eventId: string) => {
  return useQuery({
    queryKey: ["eventDetails", eventId],
    queryFn: () => ticketPurchaseAPI.getEventDetails(eventId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!eventId,
  });
};

// Fetch ticket types for event
export const useTicketTypes = (eventId: string) => {
  return useQuery({
    queryKey: ["ticketTypes", eventId],
    queryFn: () => ticketPurchaseAPI.getTicketTypes(eventId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!eventId,
  });
};

// Check ticket availability
export const useCheckAvailability = (
  eventId: string,
  ticketTypeId: string,
  quantity: number = 1
) => {
  return useQuery({
    queryKey: ["availability", eventId, ticketTypeId, quantity],
    queryFn: () =>
      ticketPurchaseAPI.checkAvailability(eventId, ticketTypeId, quantity),
    staleTime: 1000 * 30, // 30 seconds
    enabled: !!eventId && !!ticketTypeId,
  });
};

// Purchase tickets mutation
export const usePurchaseTickets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      ticketTypeId,
      tickets,
      paymentReference,
    }: {
      eventId: string;
      ticketTypeId: string;
      tickets: TicketHolder[];
      paymentReference?: string;
    }) =>
      ticketPurchaseAPI.purchaseTickets(
        eventId,
        ticketTypeId,
        tickets,
        paymentReference
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTickets"] });
      queryClient.invalidateQueries({ queryKey: ["availableEvents"] });
    },
  });
};

// Get customer's tickets
export const useMyTickets = () => {
  return useQuery({
    queryKey: ["myTickets"],
    queryFn: () => ticketPurchaseAPI.getMyTickets(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Validate ticket for check-in
export const useValidateTicket = (ticketNumber: string) => {
  return useQuery({
    queryKey: ["validateTicket", ticketNumber],
    queryFn: () => ticketPurchaseAPI.validateTicket(ticketNumber),
    staleTime: 0, // No caching for validation
    enabled: !!ticketNumber,
  });
};
