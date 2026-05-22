import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const rawBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:4000').trim();
// Ensure protocol
let baseUrl = rawBaseUrl.startsWith('http') ? rawBaseUrl : `https://${rawBaseUrl}`;
// Clean trailing slashes and redundant /api/v1
const API_BASE_URL = baseUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
const API_VERSION = 'v1';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: `/api/${API_VERSION}/auth/register`,
    LOGIN: `/api/${API_VERSION}/auth/login`,
    LOGOUT: `/api/${API_VERSION}/auth/logout`,
    REFRESH_TOKEN: `/api/${API_VERSION}/auth/refresh-token`,
    FORGOT_PASSWORD: `/api/${API_VERSION}/auth/forgot-password`,
    RESET_PASSWORD: `/api/${API_VERSION}/auth/reset-password`,
    CHANGE_PASSWORD: `/api/${API_VERSION}/auth/change-password`,
    GET_PROFILE: `/api/${API_VERSION}/auth/profile`,
    UPDATE_PROFILE: `/api/${API_VERSION}/auth/update-profile`,
    GET_ME: `/api/${API_VERSION}/auth/me`,
    REGISTER_TEAM: `/api/${API_VERSION}/auth/register-team`,
  },
  // Admin endpoints
  ADMIN: {
    STATS: `/api/${API_VERSION}/admin/stats`,
    USERS: `/api/${API_VERSION}/admin/users`,
    USER_DETAILS: `/api/${API_VERSION}/admin/users`, // USES /auth/users/:id
    SUSPEND_USER: `/api/${API_VERSION}/admin/users`, // + /:id/suspend
    ACTIVATE_USER: `/api/${API_VERSION}/admin/users`, // + /:id/activate
    PROVIDERS: `/api/${API_VERSION}/admin/providers`,
    PROVIDER_DETAILS: `/api/${API_VERSION}/admin/providers`, // + /:id
    APPROVE_PROVIDER: `/api/${API_VERSION}/admin/providers`, // + /:id/approve
    SUSPEND_PROVIDER: `/api/${API_VERSION}/admin/providers`, // + /:id/suspend
    ACTIVATE_PROVIDER: `/api/${API_VERSION}/admin/providers`, // + /:id/activate
  },
  // Provider endpoints
  PROVIDER: {
    GET_PROFILE: `/api/${API_VERSION}/provider/profile`,
    UPDATE_PROFILE: `/api/${API_VERSION}/provider/profile`,
    ONBOARDING_STATUS: `/api/${API_VERSION}/provider/onboarding/status`,
    UPLOAD_DOCUMENTS: `/api/${API_VERSION}/provider/profile/upload-documents`,
    SERVICES: `/api/${API_VERSION}/provider/services/`,
  },
  // File Upload endpoints
  UPLOAD: {
    PROFILE_IMAGE: `/api/${API_VERSION}/upload/profile-image`,
    BUSINESS_LICENSE: `/api/${API_VERSION}/upload/business-license`,
    NID: `/api/${API_VERSION}/upload/nid`,
    GALLERY: `/api/${API_VERSION}/upload/gallery`,
    GENERAL: `/api/${API_VERSION}/upload/general`,
    DELETE_FILE: (public_id: string) => `/api/${API_VERSION}/upload/file/${public_id}`,
  },
  // Customer/Wedding endpoints
  WEDDING: {
    BASE: `/api/${API_VERSION}/wedding`,
    ME: `/api/${API_VERSION}/wedding/me`,
    TASKS: `/api/${API_VERSION}/tasks`,
    TASK_STATS: `/api/${API_VERSION}/tasks/stats`,
    BUDGET_CATEGORIES: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/budget-categories`,
    CREATE_DEFAULT_CATEGORIES: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/budget-categories/create-default`,
    REDISTRIBUTE_BUDGET: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/budget-categories/redistribute`,
    BUDGET_STATISTICS: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/budget-statistics`,
    WEDDING_STATISTICS: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/statistics`,
    DASHBOARD_SUMMARY: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/dashboard-summary`,
    CATEGORY_INSIGHTS: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/category-insights`,
    RECALCULATE_SPENDING: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/recalculate-spending`,
  },
  // Public Service endpoints
  SERVICES: {
    LIST: `/api/${API_VERSION}/provider/services/search/all`,
    DETAILS: (id: string) => `/api/${API_VERSION}/provider/services/${id}`,
    SEARCH: `/api/${API_VERSION}/provider/services/search/all`,
  },
  // Public endpoints
  PUBLIC: {
    CATEGORIES: `/api/${API_VERSION}/public/categories`,
  },
  // Notifications endpoints
  NOTIFICATIONS: {
    LIST: `/api/${API_VERSION}/notifications`,
    UNREAD_COUNT: `/api/${API_VERSION}/notifications/unread-count`,
    MARK_AS_READ: (id: string) => `/api/${API_VERSION}/notifications/${id}/read`,
    MARK_ALL_AS_READ: `/api/${API_VERSION}/notifications/mark-all-read`,
  },
  // Messaging endpoints
  MESSAGES: {
    CONVERSATIONS: `/api/${API_VERSION}/messages/conversations`,
    CONVERSATION: (userId: string) => `/api/${API_VERSION}/messages/conversations/${userId}`,
    SEND: `/api/${API_VERSION}/messages/send`,
    MARK_READ: (userId: string) => `/api/${API_VERSION}/messages/conversations/${userId}/read`,
    UNREAD_COUNT: `/api/${API_VERSION}/messages/unread-count`,
  },
  // Health check
  HEALTH: `/health`,
};

// API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  error?: string;
  statusCode?: number;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  role?: 'event_owner' | 'service_provider';
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  user?: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'event_owner' | 'service_provider';
  is_verified: boolean;
  phone_number?: string;
  profile_image_url?: string;
  onboarding_completed: boolean;
  business_type?: string;
  years_experience?: number;
  business_description?: string;
  service_categories?: string[];
  address?: string;
  city?: string;
  country?: string;
  location?: string;
}

// Wedding & Planning Types
export interface Wedding {
  id: string;
  customer_id: string;
  couple_name: string;
  wedding_date: string;
  venue?: string;
  guest_count: number;
  budget: string; // Decimal from backend
  spent: string;  // Decimal from backend
  created_at: string;
  updated_at?: string;
}

export interface WeddingTask {
  id: string;
  wedding_id: string;
  budget_category_id?: string;
  title: string;
  description?: string;
  category?: string;
  assigned_to?: 'groom' | 'bride' | 'other';
  is_completed: boolean;
  status: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  amount?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface BudgetCategory {
  id: string;
  wedding_id: string;
  category_id: string;
  category_name: string;
  allocated_amount: number;
  spent_amount: number;
  estimated_amount: number;
  default_percentage: number;
  variance: number;
  usage_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface WeddingStatistics {
  wedding_info: {
    id: string;
    couple_name: string;
    wedding_date?: string;
    guest_count: number;
    venue?: string;
    days_until_wedding?: number;
    created_at: string;
  };
  task_statistics: {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    in_progress_tasks: number;
    overall_progress: number;
    priority_breakdown: {
      high_priority: {
        total: number;
        completed: number;
        pending: number;
      };
      medium_priority: number;
      low_priority: number;
    };
    assignment_breakdown: {
      bride: {
        total: number;
        completed: number;
        completion_rate: number;
      };
      groom: {
        total: number;
        completed: number;
        completion_rate: number;
      };
      shared: {
        total: number;
        completed: number;
        completion_rate: number;
      };
      unassigned: number;
    };
  };
  timeline_statistics: {
    overdue_tasks: number;
    due_this_week: number;
    due_next_week: number;
    overdue_details: Array<{
      id: string;
      title: string;
      end_date?: string;
      days_overdue: number;
      priority?: string;
      assigned_to?: string;
    }>;
    upcoming_tasks: Array<{
      id: string;
      title: string;
      end_date?: string;
      days_until_due: number;
      priority?: string;
      assigned_to?: string;
    }>;
  };
  budget_statistics: {
    total_budget: number;
    total_spent: number;
    remaining_budget: number;
    budget_usage_percentage: number;
    is_over_budget: boolean;
    task_budget: {
      total_allocated: number;
      total_spent: number;
      remaining: number;
      usage_percentage: number;
    };
    category_statistics: {
      total_allocated: number;
      total_spent: number;
      total_remaining: number;
      usage_percentage: number;
      categories_over_budget: number;
      categories_completed: number;
      highest_variance_category?: {
        category_name: string;
        variance: number;
        allocated: number;
        spent: number;
      };
      categories: BudgetCategory[];
    };
  };
  category_progress: Array<{
    category_id: string;
    category_name: string;
    total_tasks: number;
    completed_tasks: number;
    progress_percentage: number;
    allocated_amount: number;
    spent_amount: number;
    budget_usage: number;
  }>;
  alerts: {
    overdue_tasks: boolean;
    budget_warning: boolean;
    budget_exceeded: boolean;
    high_priority_pending: boolean;
    upcoming_deadlines: boolean;
  };
}

export interface DashboardSummary {
  wedding_date?: string;
  days_until_wedding?: number;
  couple_name: string;
  guest_count: number;
  progress_percentage: number;
  budget_usage_percentage: number;
  total_tasks: number;
  completed_tasks: number;
  high_priority_pending: number;
  overdue_tasks: number;
  due_this_week: number;
  is_over_budget: boolean;
  alerts: {
    overdue_tasks: boolean;
    budget_warning: boolean;
    budget_exceeded: boolean;
    high_priority_pending: boolean;
    upcoming_deadlines: boolean;
  };
}

// Service Types
export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  display_order: number;
  is_active: boolean;
}

export interface GalleryItem {
  id: string;
  url: string;
  type: 'image' | 'video' | 'reel';
  thumbnail?: string;
  title?: string;
  description?: string;
}

export interface ProviderService {
  id: string;
  provider_id: string;
  name: string;
  description?: string;
  category: string;
  category_id?: string;
  location?: string;
  specialties?: string[];
  phone?: string;
  email?: string;
  price_range_min?: number;
  price_range_max?: number;
  packages?: any;
  gallery?: (GalleryItem | string)[];
  status: 'draft' | 'pending' | 'approved' | 'active' | 'rejected' | 'on_hold' | 'suspended';
  is_active?: boolean;
  rating: number;
  bookings_count: number;
  business_name?: string;
  address?: string;
  city?: string;
  country?: string;
  // Provider profile fields
  provider_logo?: string;
  provider_full_name?: string;
  provider_business_type?: string;
  provider_years_experience?: number;
  provider_team_size?: number;
  provider_bio?: string;
  created_at?: string;
  updated_at?: string;
}

// Create Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Add these to prevent connection issues
  maxRedirects: 5,
});

// Refresh token state
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// Single request interceptor to add auth token and logging
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and silent refresh
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle the case where the backend returns 203 as a "success" (Axios doesn't throw)
    if (response.status === 203) {
      return Promise.reject(response);
    }
    return response;
  },
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    console.log('=== Response Interceptor Error ===');
    console.log('Error:', error);
    console.log('Response status:', response?.status);
    console.log('Response data:', response?.data);
    console.log('Current path:', typeof window !== 'undefined' ? window.location.pathname : 'N/A');
    console.log('==================================');

    // Treat 203 or 401 as an auth error
    if ((response?.status === 203 || response?.status === 401) && !originalRequest._retry) {
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');

        // If no refresh token, or already on signin page, just pass through the error
        if (!refreshToken || window.location.pathname.includes('/auth/signin')) {
          // Don't clear tokens or redirect during login - just pass the error through
          if (window.location.pathname.includes('/auth/signin')) {
            return Promise.reject(error);
          }
          
          // For other pages without refresh token, clear and redirect
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/auth/signin';
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log('Attempting to refresh token...');
          const refreshRes = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
            refresh_token: refreshToken
          });

          if (refreshRes.status === 200 || refreshRes.status === 201) {
            const { access_token, refresh_token: newRefreshToken } = refreshRes.data.data || refreshRes.data;

            localStorage.setItem('accessToken', access_token);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            console.log('Token refreshed successfully');
            onTokenRefreshed(access_token);
            isRefreshing = false;

            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          isRefreshing = false;
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/auth/signin';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

// API Client Configuration
export const apiClient = {
  async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.request<any>(config);

      // Check for error status codes that didn't throw due to validateStatus
      if (response.status >= 400) {
        const responseData = response.data;
        let errorMessage = 'An error occurred';

        if (responseData) {
          if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (responseData.detail) {
            errorMessage = typeof responseData.detail === 'string'
              ? responseData.detail
              : JSON.stringify(responseData.detail);
          } else if (responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData.error) {
            errorMessage = responseData.error;
          } else if (responseData.errors) {
            if (typeof responseData.errors === 'object') {
              const firstErrorKey = Object.keys(responseData.errors)[0];
              const firstErrorVal = responseData.errors[firstErrorKey];
              errorMessage = Array.isArray(firstErrorVal) ? firstErrorVal[0] : firstErrorVal;
            } else {
              errorMessage = responseData.errors;
            }
          }
        }

        throw new Error(errorMessage);
      }

      // Handle flat responses vs wrapped responses
      // Only treat as a wrapped ApiResponse if it has BOTH 'status' (string 'success'/'error')
      // AND a 'data' key — not just any object that happens to have a 'status' field
      // (e.g. a service object with status: "active" would otherwise be misidentified).
      const responseData = response.data;
      if (
        responseData &&
        typeof responseData === 'object' &&
        'data' in responseData &&
        'status' in responseData &&
        (responseData.status === 'success' || responseData.status === 'error')
      ) {
        return responseData as ApiResponse<T>;
      }

      // Fallback for flat responses
      return {
        status: 'success',
        message: 'Request successful',
        data: responseData as T,
        statusCode: response.status
      };
    } catch (error: any) {
      // Debug logging
      console.log('=== API Error Debug ===');
      console.log('Error object:', error);
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);
      console.log('Error response status:', error.response?.status);
      console.log('Error request:', error.request);
      
      // Check if error is actually a response object (status 203 case)
      if (error.status && error.data && !error.response) {
        console.log('Error is a response object, not an error object');
        console.log('Response status:', error.status);
        console.log('Response data:', error.data);
      }
      console.log('======================');

      // Check if the error is actually a response object (happens with 203 status)
      // This must be checked BEFORE network error checks
      let responseData;
      if (error.status && error.data && !error.response) {
        // Error is actually a response object - extract data from it
        responseData = error.data;
      } else {
        // Normal error object with response property
        responseData = error.response?.data;
      }

      // Handle timeout errors specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      }

      // Handle network errors (no response from server)
      // Only treat as network error if we don't have response data
      if (!responseData && (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK' || (!error.response && error.request))) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }

      // If error has no response and no request, it's likely an error we already threw
      if (!error.response && !error.request && error.message) {
        throw error;
      }

      let errorMessage = 'An unexpected error occurred';

      if (responseData) {
        console.log('Extracting error from responseData:', responseData);
        if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData.detail) {
          errorMessage = typeof responseData.detail === 'string'
            ? responseData.detail
            : JSON.stringify(responseData.detail);
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData.errors) {
          if (typeof responseData.errors === 'object') {
            const firstErrorKey = Object.keys(responseData.errors)[0];
            const firstErrorVal = responseData.errors[firstErrorKey];
            errorMessage = Array.isArray(firstErrorVal) ? firstErrorVal[0] : firstErrorVal;
          } else {
            errorMessage = responseData.errors;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.log('Final error message:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return apiClient.request<T>({ ...config, method: 'GET', url });
  },

  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return apiClient.request<T>({ ...config, method: 'POST', url, data });
  },

  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return apiClient.request<T>({ ...config, method: 'PUT', url, data });
  },

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return apiClient.request<T>({ ...config, method: 'DELETE', url });
  },

  // Services API methods
  services: {
    create<T>(data: any): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.PROVIDER.SERVICES, data);
    },

    update<T>(id: string, data: any): Promise<ApiResponse<T>> {
      return apiClient.put<T>(`${API_ENDPOINTS.PROVIDER.SERVICES}${id}/`, data);
    },

    delete<T>(id: string): Promise<ApiResponse<T>> {
      return apiClient.delete<T>(`${API_ENDPOINTS.PROVIDER.SERVICES}${id}/`);
    },

    getAll<T>(): Promise<ApiResponse<T>> {
      return apiClient.get<T>(API_ENDPOINTS.PROVIDER.SERVICES);
    },

    getById<T>(id: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(`${API_ENDPOINTS.PROVIDER.SERVICES}${id}/`);
    }
  },

  // File Upload API methods
  upload: {
    profileImage<T>(file: File, userId: string): Promise<ApiResponse<T>> {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);
      return apiClient.post<T>(API_ENDPOINTS.UPLOAD.PROFILE_IMAGE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },

    businessLicense<T>(file: File, providerId: string): Promise<ApiResponse<T>> {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('provider_id', providerId);
      return apiClient.post<T>(API_ENDPOINTS.UPLOAD.BUSINESS_LICENSE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },

    nid<T>(file: File, userId: string): Promise<ApiResponse<T>> {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);
      return apiClient.post<T>(API_ENDPOINTS.UPLOAD.NID, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },

    gallery<T>(files: File[], serviceId: string): Promise<ApiResponse<T>> {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('service_id', serviceId);
      return apiClient.post<T>(API_ENDPOINTS.UPLOAD.GALLERY, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },

    general<T>(file: File, folder?: string, resourceType?: string): Promise<ApiResponse<T>> {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) formData.append('folder', folder);
      if (resourceType) formData.append('resource_type', resourceType);
      return apiClient.post<T>(API_ENDPOINTS.UPLOAD.GENERAL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },

    deleteFile<T>(publicId: string, resourceType?: string): Promise<ApiResponse<T>> {
      const url = API_ENDPOINTS.UPLOAD.DELETE_FILE(publicId);
      const params = resourceType ? { resource_type: resourceType } : {};
      return apiClient.delete<T>(url, { params });
    }
  },

  // Public Categories API methods
  categories: {
    getAll<T>(): Promise<ApiResponse<T>> {
      return apiClient.get<T>(API_ENDPOINTS.PUBLIC.CATEGORIES);
    }
  },

  // Guest API methods
  guests: {
    list<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(`/api/v1/wedding/${weddingId}/guests`);
    },
    create<T>(weddingId: string, data: any): Promise<ApiResponse<T>> {
      return apiClient.post<T>(`/api/v1/wedding/${weddingId}/guests`, data);
    },
    update<T>(weddingId: string, guestId: string, data: any): Promise<ApiResponse<T>> {
      return apiClient.put<T>(`/api/v1/wedding/${weddingId}/guests/${guestId}`, data);
    },
    delete<T>(weddingId: string, guestId: string): Promise<ApiResponse<T>> {
      return apiClient.delete<T>(`/api/v1/wedding/${weddingId}/guests/${guestId}`);
    },
    importFile(weddingId: string, file: File): Promise<any> {
      const form = new FormData();
      form.append("file", file);
      return fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1/wedding/${weddingId}/guests/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""}` },
        body: form,
      }).then(r => r.json());
    },
    sendInvitations(weddingId: string, guestIds: string[], invitation: any): Promise<any> {
      return apiClient.post(`/api/v1/wedding/${weddingId}/guests/send-invitations`, { guest_ids: guestIds, invitation });
    },
  },

  // Invitation API methods
  invitations: {
    list<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(`/api/v1/wedding/${weddingId}/invitations`);
    },
    create<T>(weddingId: string, data: any): Promise<ApiResponse<T>> {
      return apiClient.post<T>(`/api/v1/wedding/${weddingId}/invitations`, data);
    },
    update<T>(weddingId: string, invId: string, data: any): Promise<ApiResponse<T>> {
      return apiClient.put<T>(`/api/v1/wedding/${weddingId}/invitations/${invId}`, data);
    },
    delete<T>(weddingId: string, invId: string): Promise<ApiResponse<T>> {
      return apiClient.delete<T>(`/api/v1/wedding/${weddingId}/invitations/${invId}`);
    },
    aiGenerate<T>(weddingId: string, data: any): Promise<ApiResponse<T>> {
      return apiClient.post<T>(`/api/v1/wedding/${weddingId}/invitations/ai-generate`, data);
    },
    uploadTemplate(file: File): Promise<any> {
      const form = new FormData();
      form.append("file", file);
      return fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1/invitations/upload-template`, {
        method: "POST",
        headers: { Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""}` },
        body: form,
      }).then(r => r.json());
    },
    listTemplates(): Promise<any> {
      return apiClient.get(`/api/v1/invitations/templates`);
    },
  },
};
