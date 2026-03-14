// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Event Categories
export const EVENT_CATEGORIES = [
  { value: "wedding", label: "Wedding" },
  { value: "reception", label: "Reception" },
  { value: "ceremony", label: "Ceremony" },
  { value: "rehearsal", label: "Rehearsal Dinner" },
  { value: "engagement", label: "Engagement Party" },
  { value: "other", label: "Other Event" },
];

// Event Status
export const EVENT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Ticket Status
export const TICKET_STATUS = {
  AVAILABLE: "available",
  SOLD: "sold",
  RESERVED: "reserved",
  CANCELLED: "cancelled",
};

// API Endpoints
export const API_ENDPOINTS = {
  EVENTS: "/provider/events",
  EVENT_DETAIL: (id: string) => `/provider/events/${id}`,
  EVENT_PUBLISH: (id: string) => `/provider/events/${id}/publish`,
  EVENT_CANCEL: (id: string) => `/provider/events/${id}/cancel`,
  TICKET_TYPES: (eventId: string) => `/provider/events/${eventId}/ticket-types`,
  TICKET_TYPE_DETAIL: (eventId: string, ticketTypeId: string) =>
    `/provider/events/${eventId}/ticket-types/${ticketTypeId}`,
  TICKETS: (eventId: string) => `/provider/events/${eventId}/tickets`,
  TICKET_CHECKIN: (eventId: string, ticketId: string) =>
    `/provider/events/${eventId}/tickets/${ticketId}/check-in`,
  EVENT_ANALYTICS: (eventId: string) => `/provider/events/${eventId}/analytics`,
};
