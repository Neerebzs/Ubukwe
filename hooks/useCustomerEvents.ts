"use client";

import { useQuery } from "@tanstack/react-query";
import { customerEventAPI } from "@/lib/api/customer-events";
import {
  queryKeys,
  slowQueryOptions,
  dynamicQueryOptions,
} from "@/lib/cache";

/**
 * Public event detail.
 * Slow-changing (event info rarely changes once published) — 5-min stale.
 */
export const usePublicEvent = (eventId: string) => {
  return useQuery({
    queryKey: queryKeys.public.event(eventId),
    queryFn: () => customerEventAPI.getEvent(eventId),
    enabled: !!eventId,
    ...slowQueryOptions,
  });
};

/**
 * Public events listing.
 * Slow-changing — 5-min stale is appropriate for the public-facing catalog.
 */
export const usePublicEvents = (category?: string) => {
  return useQuery({
    queryKey: queryKeys.public.events(category),
    queryFn: () => customerEventAPI.getEvents(category),
    ...slowQueryOptions,
  });
};

/**
 * Customer's purchased tickets.
 * Dynamic — ticket status (check-in state, payment) must always be fresh.
 */
export const useMyTickets = () => {
  return useQuery({
    queryKey: queryKeys.tickets.mine(),
    queryFn: () => customerEventAPI.getMyTickets(),
    ...dynamicQueryOptions,
  });
};

/**
 * Single ticket detail.
 * Dynamic for the same reason as the list.
 */
export const useTicket = (ticketId: string) => {
  return useQuery({
    queryKey: queryKeys.tickets.detail(ticketId),
    queryFn: () => customerEventAPI.getTicket(ticketId),
    enabled: !!ticketId,
    ...dynamicQueryOptions,
  });
};
