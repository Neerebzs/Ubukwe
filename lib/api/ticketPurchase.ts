import { API_BASE_URL } from "@/lib/constants";

// Types
export interface AvailableEvent {
  id: string;
  title: string;
  description?: string;
  category: string;
  location: string;
  event_date: string;
  event_time?: string;
  capacity: number;
  tickets_sold: number;
  available_tickets: number;
  image_url?: string;
}

export interface TicketTypeForPurchase {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sold: number;
  available: number;
}

export interface AvailabilityCheck {
  event_id: string;
  event_title: string;
  event_date: string;
  event_location: string;
  ticket_type_id: string;
  ticket_type_name: string;
  price: number;
  quantity_requested: number;
  available_tickets: number;
  total_price: number;
}

export interface TicketHolder {
  holder_name: string;
  holder_email: string;
  holder_phone?: string;
}

export interface PurchaseConfirmation {
  purchase_id: string;
  customer_id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_location: string;
  ticket_type: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  payment_reference?: string;
  tickets: Array<{
    ticket_id: string;
    ticket_number: string;
    holder_name: string;
    holder_email: string;
    status: string;
  }>;
  purchase_date: string;
  status: string;
}

export interface CustomerTicket {
  ticket_id: string;
  ticket_number: string;
  event_title: string;
  event_date?: string;
  event_location?: string;
  ticket_type: string;
  holder_name: string;
  holder_email: string;
  status: string;
  is_checked_in: boolean;
  checked_in_at?: string;
  purchased_at: string;
}

export interface TicketValidation {
  ticket_id: string;
  ticket_number: string;
  holder_name: string;
  holder_email: string;
  event_title: string;
  event_date: string;
  ticket_type: string;
  valid: boolean;
}

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Helper function for API calls
const apiCall = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any
) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
};

// Ticket Purchase API Functions
export const ticketPurchaseAPI = {
  // Get available events
  getAvailableEvents: async (): Promise<AvailableEvent[]> => {
    return apiCall("/tickets/events", "GET");
  },

  // Get event details
  getEventDetails: async (eventId: string): Promise<AvailableEvent> => {
    return apiCall(`/tickets/events/${eventId}`, "GET");
  },

  // Get ticket types for event
  getTicketTypes: async (eventId: string): Promise<TicketTypeForPurchase[]> => {
    return apiCall(`/tickets/events/${eventId}/ticket-types`, "GET");
  },

  // Check ticket availability
  checkAvailability: async (
    eventId: string,
    ticketTypeId: string,
    quantity: number = 1
  ): Promise<AvailabilityCheck> => {
    return apiCall(
      `/tickets/check-availability?event_id=${eventId}&ticket_type_id=${ticketTypeId}&quantity=${quantity}`,
      "GET"
    );
  },

  // Purchase tickets
  purchaseTickets: async (
    eventId: string,
    ticketTypeId: string,
    tickets: TicketHolder[],
    paymentReference?: string
  ): Promise<PurchaseConfirmation> => {
    return apiCall("/tickets/purchase", "POST", {
      event_id: eventId,
      ticket_type_id: ticketTypeId,
      tickets,
      payment_reference: paymentReference,
    });
  },

  // Get customer's tickets
  getMyTickets: async (): Promise<CustomerTicket[]> => {
    return apiCall("/tickets/my-tickets", "GET");
  },

  // Validate ticket for check-in
  validateTicket: async (ticketNumber: string): Promise<TicketValidation> => {
    return apiCall(`/tickets/validate/${ticketNumber}`, "GET");
  },
};
