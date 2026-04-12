import { API_BASE_URL } from "@/lib/constants";

// Types
export interface PublicEvent {
  id: string;
  title: string;
  description?: string;
  category: string;
  location: string;
  event_date: string;
  event_time?: string;
  capacity: number;
  image_url?: string;
  status: string;
  tickets_sold: number;
  total_revenue: number;
  ticket_types: PublicTicketType[];
  created_at: string;
}

export interface PublicTicketType {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sold: number;
}

export interface PurchaseTicketRequest {
  holder_email: string;
  holder_name?: string;
  holder_phone?: string;
}

export interface TicketPurchaseResponse {
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

// Customer Event API Functions
export const customerEventAPI = {
  // Get public event details
  getEvent: async (eventId: string): Promise<PublicEvent> => {
    return apiCall(`/api/v1/public/events/${eventId}`, "GET");
  },

  // Get public events list (only approved events)
  getEvents: async (category?: string) => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiCall(`/api/v1/public/events${query}`, "GET");
  },

  // Purchase ticket (public endpoint - no auth required)
  purchaseTicket: async (
    eventId: string,
    ticketTypeId: string,
    tickets: PurchaseTicketRequest[],
    paymentReference?: string
  ): Promise<TicketPurchaseResponse> => {
    return apiCall(
      `/api/v1/tickets/purchase`,
      "POST",
      {
        event_id: eventId,
        ticket_type_id: ticketTypeId,
        tickets: tickets,
        payment_reference: paymentReference,
      }
    );
  },

  // Get customer's tickets
  getMyTickets: async () => {
    return apiCall("/api/v1/customer/tickets", "GET");
  },

  // Get single ticket
  getTicket: async (ticketId: string) => {
    return apiCall(`/api/v1/customer/tickets/${ticketId}`, "GET");
  },
};
