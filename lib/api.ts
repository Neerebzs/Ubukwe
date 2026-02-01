import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const rawBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:4000').trim();
// Ensure protocol
let baseUrl = rawBaseUrl.startsWith('http') ? rawBaseUrl : `https://${rawBaseUrl}`;
// Clean trailing slashes and redundant /api/v1
const API_BASE_URL = baseUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
const API_VERSION = 'v1';

// Debug logging
console.log('API Configuration:');
console.log('Raw Base URL:', rawBaseUrl);
console.log('Processed Base URL:', API_BASE_URL);
console.log('Full Login URL:', `${API_BASE_URL}/api/${API_VERSION}/auth/login`);

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
  service_name: string;
  service_type: string;
  description?: string;
  is_active: boolean;
}

export interface ProviderService {
  id: string;
  provider_id: string;
  name: string;
  description?: string;
  category: string;
  location?: string;
  price_range_min?: number;
  price_range_max?: number;
  packages?: any;
  gallery?: string[];
  status: 'draft' | 'active';
  rating: number;
  bookings_count: number;
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
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
});

// Single request interceptor to add auth token and logging
axiosInstance.interceptors.request.use(
  (config) => {
    // Add debugging
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    
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

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle the case where the backend returns 203 as a "success" (Axios doesn't throw)
    if (response.status === 203) {
      const errorMessage = response.data?.detail || response.data?.message || 'Authentication failed';
      return Promise.reject(new Error(errorMessage));
    }
    return response;
  },
  async (error) => {
    // Treat 203 or 401 as an auth error
    if (error.response?.status === 203 || error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/signin')) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/auth/signin';
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
      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && ('status' in responseData || 'data' in responseData)) {
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
      // If we already threw an error above, just re-throw it
      if (error.message && !error.response) {
        throw error;
      }

      const responseData = error.response?.data;

      // Handle timeout errors specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      }

      // Handle network errors
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }

      // Try to extract a meaningful error message
      let errorMessage = 'An unexpected error occurred';

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
      } else if (error.message) {
        errorMessage = error.message;
      }

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
};
