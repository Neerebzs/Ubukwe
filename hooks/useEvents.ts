"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventAPI } from "@/lib/api/events";
import {
  queryKeys,
  dynamicQueryOptions,
  invalidateEvents,
} from "@/lib/cache";

// ── Queries ──────────────────────────────────────────────────────────────────

/** Provider's own event list. Dynamic — event status changes must always be fresh. */
export const useEvents = (status?: string) => {
  return useQuery({
    queryKey: queryKeys.events.list(status),
    queryFn: () => eventAPI.getEvents(status),
    ...dynamicQueryOptions,
  });
};

/** Single event detail. Dynamic for the same reason as the list. */
export const useEvent = (eventId: string) => {
  return useQuery({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: () => eventAPI.getEvent(eventId),
    enabled: !!eventId,
    ...dynamicQueryOptions,
  });
};

/** Ticket types for an event. Rarely changes but must be accurate at purchase time. */
export const useTicketTypes = (eventId: string) => {
  return useQuery({
    queryKey: queryKeys.events.ticketTypes(eventId),
    queryFn: () => eventAPI.getTicketTypes(eventId),
    enabled: !!eventId,
    ...dynamicQueryOptions,
  });
};

/** All tickets sold for an event. Dynamic — check-in state changes in real time. */
export const useTickets = (eventId: string) => {
  return useQuery({
    queryKey: queryKeys.events.tickets(eventId),
    queryFn: () => eventAPI.getTickets(eventId),
    enabled: !!eventId,
    ...dynamicQueryOptions,
  });
};

/** Event analytics. Allow 2-minute stale window — analytics can lag slightly. */
export const useEventAnalytics = (eventId: string) => {
  return useQuery({
    queryKey: queryKeys.events.analytics(eventId),
    queryFn: () => eventAPI.getEventAnalytics(eventId),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/** Ticket inspectors. Dynamic — inspectors can be added/removed before the event. */
export const useInspectors = (eventId: string) => {
  return useQuery({
    queryKey: queryKeys.events.inspectors(eventId),
    queryFn: () => eventAPI.getInspectors(eventId),
    enabled: !!eventId,
    ...dynamicQueryOptions,
  });
};

// ── Mutations ────────────────────────────────────────────────────────────────

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventAPI.createEvent,
    onSuccess: () => {
      invalidateEvents(queryClient);
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: any }) =>
      eventAPI.updateEvent(eventId, data),
    onSuccess: (_, { eventId }) => {
      invalidateEvents(queryClient, eventId);
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventAPI.deleteEvent,
    onSuccess: (_, eventId) => {
      invalidateEvents(queryClient, eventId);
    },
  });
};

export const usePublishEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventAPI.publishEvent,
    onSuccess: (_, eventId) => {
      invalidateEvents(queryClient, eventId);
    },
  });
};

export const useCancelEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventAPI.cancelEvent,
    onSuccess: (_, eventId) => {
      invalidateEvents(queryClient, eventId);
    },
  });
};

// ── Ticket Type Mutations ────────────────────────────────────────────────────

export const useCreateTicketType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: any }) =>
      eventAPI.createTicketType(eventId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.ticketTypes(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
    },
  });
};

export const useUpdateTicketType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      ticketTypeId,
      data,
    }: { eventId: string; ticketTypeId: string; data: any }) =>
      eventAPI.updateTicketType(eventId, ticketTypeId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.ticketTypes(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
    },
  });
};

export const useDeleteTicketType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, ticketTypeId }: { eventId: string; ticketTypeId: string }) =>
      eventAPI.deleteTicketType(eventId, ticketTypeId),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.ticketTypes(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
    },
  });
};

// ── Ticket Mutations ─────────────────────────────────────────────────────────

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      ticketTypeId,
      data,
    }: { eventId: string; ticketTypeId: string; data: any }) =>
      eventAPI.createTicket(eventId, ticketTypeId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.tickets(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
    },
  });
};

export const useCheckInTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, ticketId }: { eventId: string; ticketId: string }) =>
      eventAPI.checkInTicket(eventId, ticketId),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.tickets(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.analytics(eventId) });
    },
  });
};

// ── Inspector Mutations ──────────────────────────────────────────────────────

export const useCreateInspector = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: { name: string; email: string; phone_number: string } }) =>
      eventAPI.createInspector(eventId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.inspectors(eventId) });
    },
  });
};

export const useDeleteInspector = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, inspectorId }: { eventId: string; inspectorId: string }) =>
      eventAPI.deleteInspector(eventId, inspectorId),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.inspectors(eventId) });
    },
  });
};

export const useVerifyInspector = () => {
  return useMutation({
    mutationFn: (identificationNumber: string) => eventAPI.verifyInspector(identificationNumber),
  });
};

export const useCheckInByInspector = () => {
  return useMutation({
    mutationFn: (data: { ticket_number: string; identification_number: string }) =>
      eventAPI.checkInByInspector(data),
  });
};
