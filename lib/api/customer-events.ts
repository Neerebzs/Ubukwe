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
  holder_name: string;
  holder_email: string;
  holder_phone?: string;
  quantity: number;
}

export interface TicketPurchaseResponse {
  id: string;
  event_id: string;
  ticket_type_id: string;
  holder_name: string;
  holder_email: string;
  holder_phone?: string;
  ticket_number: string;
  status: string;
  is_checked_in: boolean;
  created_at: string;
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
    return apiCall(`/public/events/${eventId}`, "GET");
  },

  // Get public events list (only approved events)
  getEvents: async (category?: string, status?: string) => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    // Note: status parameter is ignored for public endpoint - only approved events are returned
    
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiCall(`/public/events${query}`, "GET");
  },

  // Purchase ticket
  purchaseTicket: async (
    eventId: string,
    ticketTypeId: string,
    ticketData: PurchaseTicketRequest
  ): Promise<TicketPurchaseResponse> => {
    return apiCall(
      `/provider/events/${eventId}/tickets?ticket_type_id=${ticketTypeId}`,
      "POST",
      ticketData
    );
  },

  // Get customer's tickets
  getMyTickets: async () => {
    return apiCall("/customer/tickets", "GET");
  },

  // Get single ticket
  getTicket: async (ticketId: string) => {
    return apiCall(`/customer/tickets/${ticketId}`, "GET");
  },
};
