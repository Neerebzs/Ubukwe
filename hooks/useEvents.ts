"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventAPI, Event, EventAnalytics, TicketType } from "@/lib/api/events";

// Fetch all events
export const useEvents = (status?: string) => {
  return useQuery({
    queryKey: ["events", status],
    queryFn: () => eventAPI.getEvents(status),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Fetch single event
export const useEvent = (eventId: string) => {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => eventAPI.getEvent(eventId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!eventId,
  });
};

// Create event mutation
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventAPI.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

// Update event mutation
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: any }) =>
      eventAPI.updateEvent(eventId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

// Delete event mutation
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventAPI.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

// Publish event mutation
export const usePublishEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventAPI.publishEvent,
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

// Cancel event mutation
export const useCancelEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventAPI.cancelEvent,
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

// Ticket Types
export const useTicketTypes = (eventId: string) => {
  return useQuery({
    queryKey: ["ticketTypes", eventId],
    queryFn: () => eventAPI.getTicketTypes(eventId),
    staleTime: 1000 * 60 * 5,
    enabled: !!eventId,
  });
};

export const useCreateTicketType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: any }) =>
      eventAPI.createTicketType(eventId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["ticketTypes", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
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
    }: {
      eventId: string;
      ticketTypeId: string;
      data: any;
    }) => eventAPI.updateTicketType(eventId, ticketTypeId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["ticketTypes", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });
};

export const useDeleteTicketType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, ticketTypeId }: { eventId: string; ticketTypeId: string }) =>
      eventAPI.deleteTicketType(eventId, ticketTypeId),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["ticketTypes", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });
};

// Tickets
export const useTickets = (eventId: string) => {
  return useQuery({
    queryKey: ["tickets", eventId],
    queryFn: () => eventAPI.getTickets(eventId),
    staleTime: 1000 * 60 * 5,
    enabled: !!eventId,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      ticketTypeId,
      data,
    }: {
      eventId: string;
      ticketTypeId: string;
      data: any;
    }) => eventAPI.createTicket(eventId, ticketTypeId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["tickets", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });
};

export const useCheckInTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, ticketId }: { eventId: string; ticketId: string }) =>
      eventAPI.checkInTicket(eventId, ticketId),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["tickets", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });
};

// Analytics
export const useEventAnalytics = (eventId: string) => {
  return useQuery({
    queryKey: ["eventAnalytics", eventId],
    queryFn: () => eventAPI.getEventAnalytics(eventId),
    staleTime: 1000 * 60 * 2, // 2 minutes for analytics
    enabled: !!eventId,
  });
};

// Inspectors
export const useInspectors = (eventId: string) => {
  return useQuery({
    queryKey: ["inspectors", eventId],
    queryFn: () => eventAPI.getInspectors(eventId),
    staleTime: 1000 * 60 * 5,
    enabled: !!eventId,
  });
};

export const useCreateInspector = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: { name: string; email: string; phone_number: string } }) =>
      eventAPI.createInspector(eventId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["inspectors", eventId] });
    },
  });
};

export const useDeleteInspector = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, inspectorId }: { eventId: string; inspectorId: string }) =>
      eventAPI.deleteInspector(eventId, inspectorId),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["inspectors", eventId] });
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
