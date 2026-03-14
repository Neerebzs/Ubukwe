import { API_BASE_URL } from "@/lib/constants";

// Types
export interface EventCategory {
  value: string;
  label: string;
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sold: number;
  created_at: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  provider_id: string;
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
  ticket_types?: TicketType[];
  created_at: string;
  updated_at?: string;
}

export interface EventAnalytics {
  event_id: string;
  total_tickets_sold: number;
  total_revenue: number;
  occupancy_percentage: number;
  occupancy_count: number;
  available_tickets: number;
  average_ticket_price?: number;
  ticket_types_breakdown: Array<{
    name: string;
    price: number;
    quantity: number;
    sold: number;
    revenue: number;
  }>;
  checked_in_count: number;
  check_in_percentage: number;
}

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

// Helper function for API calls
const apiCall = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any,
  isFormData: boolean = false
) => {
  const token = getAuthToken();
  const headers: HeadersInit = {};

  // Only set Content-Type for JSON, let browser set it for FormData
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    if (isFormData) {
      options.body = body; // FormData object
    } else if (method === "POST" || method === "PUT") {
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
};

// Event API Functions
export const eventAPI = {
  // Create event with FormData support
  createEvent: async (eventData: {
    title: string;
    description?: string;
    category: string;
    location: string;
    event_date: string;
    event_time?: string;
    capacity: number;
    image?: File | Blob;
    image_url?: string;
    ticket_types?: Array<{
      name: string;
      description?: string;
      price: number;
      quantity: number;
    }>;
  }) => {
    // Check if we have a file to upload
    const hasFile = eventData.image instanceof File || eventData.image instanceof Blob;
    
    if (hasFile) {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append('title', eventData.title);
      if (eventData.description) formData.append('description', eventData.description);
      formData.append('category', eventData.category);
      formData.append('location', eventData.location);
      formData.append('event_date', eventData.event_date);
      if (eventData.event_time) formData.append('event_time', eventData.event_time);
      formData.append('capacity', eventData.capacity.toString());
      if (eventData.image) formData.append('image', eventData.image);
      
      // Add ticket types as JSON string
      if (eventData.ticket_types && eventData.ticket_types.length > 0) {
        formData.append('ticket_types', JSON.stringify(eventData.ticket_types));
      }
      
      return apiCall("/api/v1/provider/events/", "POST", formData, true);
    } else {
      // Use JSON for URL-based image
      const jsonData = {
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        location: eventData.location,
        event_date: eventData.event_date,
        event_time: eventData.event_time,
        capacity: eventData.capacity,
        image_url: eventData.image_url,
        ticket_types: eventData.ticket_types,
      };
      return apiCall("/api/v1/provider/events/", "POST", jsonData, false);
    }
  },

  // Get all events
  getEvents: async (status?: string) => {
    const query = status ? `?status=${status}` : "";
    return apiCall(`/api/v1/provider/events/${query}`, "GET");
  },

  // Get single event
  getEvent: async (eventId: string) => {
    return apiCall(`/api/v1/provider/events/${eventId}`, "GET");
  },

  // Update event
  updateEvent: async (
    eventId: string,
    eventData: {
      title?: string;
      description?: string;
      category?: string;
      location?: string;
      event_date?: string;
      event_time?: string;
      capacity?: number;
      image_url?: string;
      status?: string;
    }
  ) => {
    return apiCall(`/api/v1/provider/events/${eventId}`, "PUT", eventData);
  },

  // Delete event
  deleteEvent: async (eventId: string) => {
    return apiCall(`/api/v1/provider/events/${eventId}`, "DELETE");
  },

  // Publish event
  publishEvent: async (eventId: string) => {
    return apiCall(`/api/v1/provider/events/${eventId}/publish`, "POST");
  },

  // Cancel event
  cancelEvent: async (eventId: string) => {
    return apiCall(`/api/v1/provider/events/${eventId}/cancel`, "POST");
  },

  // Ticket Types
  createTicketType: async (
    eventId: string,
    ticketData: {
      name: string;
      description?: string;
      price: number;
      quantity: number;
    }
  ) => {
    return apiCall(`/api/v1/provider/events/${eventId}/ticket-types`, "POST", ticketData);
  },

  getTicketTypes: async (eventId: string) => {
    return apiCall(`/api/v1/provider/events/${eventId}/ticket-types`, "GET");
  },

  updateTicketType: async (
    eventId: string,
    ticketTypeId: string,
    ticketData: {
      name?: string;
      description?: string;
      price?: number;
      quantity?: number;
    }
  ) => {
    return apiCall(
      `/api/v1/provider/events/${eventId}/ticket-types/${ticketTypeId}`,
      "PUT",
      ticketData
    );
  },

  deleteTicketType: async (eventId: string, ticketTypeId: string) => {
    return apiCall(
      `/api/v1/provider/events/${eventId}/ticket-types/${ticketTypeId}`,
      "DELETE"
    );
  },

  // Tickets
  createTicket: async (
    eventId: string,
    ticketTypeId: string,
    ticketData: {
      holder_name: string;
      holder_email: string;
      holder_phone?: string;
    }
  ) => {
    return apiCall(
      `/api/v1/provider/events/${eventId}/tickets?ticket_type_id=${ticketTypeId}`,
      "POST",
      ticketData
    );
  },

  getTickets: async (eventId: string) => {
    return apiCall(`/api/v1/provider/events/${eventId}/tickets`, "GET");
  },

  checkInTicket: async (eventId: string, ticketId: string) => {
    return apiCall(
      `/api/v1/provider/events/${eventId}/tickets/${ticketId}/check-in`,
      "POST"
    );
  },

  // Analytics
  getEventAnalytics: async (eventId: string): Promise<EventAnalytics> => {
    return apiCall(`/api/v1/provider/events/${eventId}/analytics`, "GET");
  },
};
