/**
 * API Client Structure
 * 
 * This file provides the structure for API integration.
 * Actual API calls will be implemented when backend is ready.
 * 
 * Usage:
 * import { apiClient } from '@/lib/api-client'
 * const data = await apiClient.services.getAll()
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
  throw new Error('NEXT_PUBLIC_BACKEND_URL is not defined in .env file');
}

const rawBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL.trim();
// Ensure protocol
let baseUrl = rawBaseUrl.startsWith('http') ? rawBaseUrl : `https://${rawBaseUrl}`;
// Clean trailing slashes and redundant /api/v1
const API_BASE_URL = baseUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage/sessionStorage when available
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log full error details to console
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      requestData: error.config?.data
    });

    // Handle common errors
    if (error.response?.status === 401 || error.response?.status === 203) {
      // Unauthorized or Non-Authoritative (used as error in backend) - redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/signin')) {
        window.location.href = '/auth/signin';
      }
    }

    const responseData = error.response?.data;

    // Try to extract a meaningful error message
    let errorMessage = 'An unexpected error occurred';

    if (responseData) {
      if (typeof responseData === 'string') {
        errorMessage = responseData;
      } else if (typeof responseData === 'object') {
        if ('detail' in responseData && typeof responseData.detail === 'string') {
          errorMessage = responseData.detail;
        } else if ('message' in responseData && typeof responseData.message === 'string') {
          errorMessage = responseData.message;
        } else if ('detail' in responseData) {
          errorMessage = typeof responseData.detail === 'string'
            ? responseData.detail
            : JSON.stringify(responseData.detail);
        } else if ('error' in responseData && typeof responseData.error === 'string') {
          errorMessage = responseData.error;
        } else if ('errors' in responseData) {
          if (typeof responseData.errors === 'object' && responseData.errors !== null) {
            const firstErrorKey = Object.keys(responseData.errors)[0];
            if (firstErrorKey) {
              const firstErrorVal = (responseData.errors as Record<string, any>)[firstErrorKey];
              errorMessage = Array.isArray(firstErrorVal) ? firstErrorVal[0] : firstErrorVal;
            }
          } else if (typeof responseData.errors === 'string') {
            errorMessage = responseData.errors;
          }
        }
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Extracted Error Message:', errorMessage);

    // Create a new error with the extracted message or modify the existing one
    const enhancedError = new Error(errorMessage);
    // Copy original error properties if needed, e.g., response, request, config
    Object.assign(enhancedError, error);

    return Promise.reject(enhancedError);
  }
);

// Type definitions for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Client Interface
class ApiClient {
  // Authentication API
  auth = {
    register: async (data: any) => {
      return axiosInstance.post<any>('/api/v1/auth/register', data);
    },
    login: async (data: any) => {
      return axiosInstance.post<any>('/api/v1/auth/login', data);
    },
    logout: async () => {
      return axiosInstance.post<any>('/api/v1/auth/logout');
    },
    refreshToken: async (refreshToken: string) => {
      return axiosInstance.post<any>('/api/v1/auth/refresh-token', { refreshToken });
    },
    getProfile: async () => {
      return axiosInstance.get<any>('/api/v1/auth/profile');
    },
    updateProfile: async (data: any) => {
      return axiosInstance.put<any>('/api/v1/auth/profile', data);
    },
    changePassword: async (data: any) => {
      return axiosInstance.put<any>('/api/v1/auth/change-password', data);
    },
    forgotPassword: async (email: string) => {
      return axiosInstance.post<any>('/api/v1/auth/forgot-password', { email });
    },
    resetPassword: async (data: any) => {
      return axiosInstance.post<any>('/api/v1/auth/reset-password', data);
    },
    registerTeam: async (data: any) => {
      return axiosInstance.post<any>('/api/v1/auth/register-team', data);
    },
  };

  // Services API (Public)
  services = {
    getAll: async (params?: { active_only?: boolean }) => {
      return axiosInstance.get<any[]>('/api/v1/services', { params });
    },
    getById: async (id: string) => {
      return axiosInstance.get<any>(`/api/v1/services/${id}`);
    },
    search: async (params?: any) => {
      return axiosInstance.get<any>('/api/v1/services/search', { params });
    },
  };

  // Provider Services API
  providerServices = {
    getAll: async (params?: { status?: string }) => {
      return axiosInstance.get<any[]>('/api/v1/provider/services/', { params });
    },
    getById: async (id: string) => {
      return axiosInstance.get<any>(`/api/v1/provider/services/${id}`);
    },
    create: async (data: any) => {
      return axiosInstance.post<any>('/api/v1/provider/services/', data);
    },
    update: async (id: string, data: any) => {
      return axiosInstance.put<any>(`/api/v1/provider/services/${id}`, data);
    },
    delete: async (id: string) => {
      return axiosInstance.delete(`/api/v1/provider/services/${id}`);
    },
    searchAll: async (params?: { category?: string; location?: string; min_price?: number; max_price?: number }) => {
      return axiosInstance.get<any[]>('/api/v1/provider/services/search/all', { params });
    },
  };

  // Bookings API
  bookings = {
    getAll: async (params?: { role?: string; status?: string }) => {
      return axiosInstance.get<any[]>('/api/v1/bookings', { params });
    },
    getById: async (id: string) => {
      return axiosInstance.get<any>(`/api/v1/bookings/${id}`);
    },
    create: async (data: any) => {
      return axiosInstance.post<any>('/api/v1/bookings', data);
    },
    update: async (id: string, data: any) => {
      return axiosInstance.put<any>(`/api/v1/bookings/${id}`, data);
    },
    cancel: async (id: string) => {
      return axiosInstance.post<any>(`/api/v1/bookings/${id}/cancel`);
    },
    getProviderBookings: async (params?: { status?: string }) => {
      return axiosInstance.get<any[]>('/api/v1/bookings/provider', { params });
    },
    getProviderBookingStats: async () => {
      return axiosInstance.get<any>('/api/v1/bookings/provider/statistics/summary');
    },
  };

  // Disputes API
  disputes = {
    // Customer: get my disputes
    getMyDisputes: async () => {
      return axiosInstance.get<any[]>('/api/v1/disputes/my');
    },
    // Customer: get dispute details + messages
    getDetails: async (disputeId: string) => {
      return axiosInstance.get<any>(`/api/v1/disputes/${disputeId}`);
    },
    // Customer: file a new dispute (multipart with optional proof image)
    create: async (data: {
      booking_id: string;
      respondent_id: string;
      title: string;
      description: string;
      category: string;
      priority?: string;
      proof_image?: File | null;
    }) => {
      const formData = new FormData();
      formData.append('booking_id', data.booking_id);
      formData.append('respondent_id', data.respondent_id);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('priority', data.priority || 'medium');
      if (data.proof_image) {
        formData.append('proof_image', data.proof_image);
      }
      return axiosInstance.post<any>('/api/v1/disputes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    // Customer: send message in dispute thread
    sendMessage: async (disputeId: string, message: string) => {
      const formData = new FormData();
      formData.append('message', message);
      return axiosInstance.post<any>(`/api/v1/disputes/${disputeId}/message`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    // Admin: get all disputes
    adminGetAll: async (params?: { status?: string; priority?: string; page?: number; limit?: number }) => {
      return axiosInstance.get<any>('/api/v1/admin/disputes', { params });
    },
    // Admin: get dispute stats
    adminGetStats: async () => {
      return axiosInstance.get<any>('/api/v1/admin/disputes/stats');
    },
    // Admin: get dispute details
    adminGetDetails: async (disputeId: string) => {
      return axiosInstance.get<any>(`/api/v1/admin/disputes/${disputeId}`);
    },
    // Admin: start investigation
    adminInvestigate: async (disputeId: string, notes?: string) => {
      return axiosInstance.put<any>(`/api/v1/admin/disputes/${disputeId}/investigate`, { notes });
    },
    // Admin: resolve dispute
    adminResolve: async (disputeId: string, resolution_type: string, resolution_notes: string) => {
      return axiosInstance.put<any>(`/api/v1/admin/disputes/${disputeId}/resolve`, { resolution_type, resolution_notes });
    },
    // Admin: reject dispute
    adminReject: async (disputeId: string, reason: string) => {
      return axiosInstance.put<any>(`/api/v1/admin/disputes/${disputeId}/reject`, { reason });
    },
    // Admin: send message
    adminSendMessage: async (disputeId: string, message: string) => {
      return axiosInstance.post<any>(`/api/v1/admin/disputes/${disputeId}/message`, { message });
    },
  };

  // Reviews API
  reviews = {
    // Get reviews written by the current logged-in user
    getMyReviews: async () => {
      return axiosInstance.get<any[]>('/api/v1/reviews/me');
    },
    // Get reviews received by a user (as the reviewed party)
    getByUser: async (userId: string, reviewType?: string) => {
      return axiosInstance.get<any[]>(`/api/v1/reviews/user/${userId}`, { params: { review_type: reviewType } });
    },
    // Get all reviews for a service
    getByService: async (serviceId: string) => {
      return axiosInstance.get<any[]>(`/api/v1/reviews/service/${serviceId}`);
    },
    // Get only featured/published testimonials for a service
    getFeaturedByService: async (serviceId: string) => {
      return axiosInstance.get<any[]>(`/api/v1/reviews/service/${serviceId}/featured`);
    },
    getUserRating: async (userId: string) => {
      return axiosInstance.get<any>(`/api/v1/reviews/user/${userId}/rating`);
    },
    create: async (data: any) => {
      return axiosInstance.post<any>('/api/v1/reviews', data);
    },
    update: async (id: string, data: any) => {
      return axiosInstance.put<any>(`/api/v1/reviews/${id}`, data);
    },
    // Provider toggles a review as featured testimonial
    toggleFeatured: async (reviewId: string, isFeatured: boolean) => {
      return axiosInstance.put<any>(`/api/v1/reviews/${reviewId}/feature?is_featured=${isFeatured}`);
    },
    delete: async (id: string) => {
      return axiosInstance.delete(`/api/v1/reviews/${id}`);
    },
  };

  // Payments API
  payments = {
    getAll: async (params?: { role?: string }) => {
      return axiosInstance.get<any[]>('/api/v1/payments', { params });
    },
    getById: async (id: string) => {
      return axiosInstance.get<any>(`/api/v1/payments/${id}`);
    },
    create: async (data: any) => {
      return axiosInstance.post<any>('/api/v1/payments', data);
    },
    callback: async (id: string, data: any) => {
      return axiosInstance.post<any>(`/api/v1/payments/${id}/callback`, data);
    },
  };

  // Provider API
  provider = {
    getProfile: async () => {
      return axiosInstance.get<any>('/api/v1/provider/profile');
    },
    updateProfile: async (data: any) => {
      return axiosInstance.put<any>('/api/v1/provider/profile', data);
    },
    getOnboardingStatus: async () => {
      return axiosInstance.get<any>('/api/v1/provider/onboarding/status');
    },
    uploadDocuments: async (businessLicense?: File, portfolio?: File[]) => {
      const formData = new FormData();
      if (businessLicense) formData.append('business_license', businessLicense);
      if (portfolio) {
        portfolio.forEach((file) => formData.append('portfolio', file));
      }
      return axiosInstance.post<any>('/api/v1/provider/profile/upload-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    submitDocuments: async (nidFile: File, faceFile: File) => {
      const formData = new FormData();
      formData.append('nid_file', nidFile);
      formData.append('face_file', faceFile);
      return axiosInstance.post<any>('/api/v1/provider/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    submitOnboarding: async (data: any, rdbFile: File) => {
      const formData = new FormData();

      // Map frontend field names to backend field names
      const fieldMapping = {
        businessName: 'business_name',
        businessType: 'business_type',
        yearsExperience: 'years_experience',
        serviceCategories: 'service_categories',
        description: 'business_description',
        phone: 'phone',
        email: 'email',
        address: 'address',
        city: 'city',
        country: 'country'
      };

      // Append fields with correct backend names
      Object.keys(data).forEach(key => {
        const backendKey = fieldMapping[key as keyof typeof fieldMapping] || key;
        if (Array.isArray(data[key])) {
          formData.append(backendKey, JSON.stringify(data[key]));
        } else {
          formData.append(backendKey, data[key]);
        }
      });

      // Append file
      formData.append('rdb_file', rdbFile);

      // Debug logging
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      return axiosInstance.post<any>('/api/v1/provider/onboarding', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    // Quotes
    quotes: {
      getAll: async (params?: { status?: string }) => {
        return axiosInstance.get<any[]>('/api/v1/provider/quotes/', { params });
      },
      getById: async (id: string) => {
        return axiosInstance.get<any>(`/api/v1/provider/quotes/${id}`);
      },
      create: async (data: any) => {
        return axiosInstance.post<any>('/api/v1/provider/quotes/', data);
      },
      update: async (id: string, data: any) => {
        return axiosInstance.put<any>(`/api/v1/provider/quotes/${id}`, data);
      },
      send: async (id: string) => {
        return axiosInstance.post<any>(`/api/v1/provider/quotes/${id}/send`);
      },
      delete: async (id: string) => {
        return axiosInstance.delete(`/api/v1/provider/quotes/${id}`);
      },
    },
    // Contracts
    contracts: {
      getAll: async (params?: { status?: string }) => {
        return axiosInstance.get<any[]>('/api/v1/provider/contracts/', { params });
      },
      getById: async (id: string) => {
        return axiosInstance.get<any>(`/api/v1/provider/contracts/${id}`);
      },
      create: async (data: any) => {
        return axiosInstance.post<any>('/api/v1/provider/contracts/', data);
      },
      update: async (id: string, data: any) => {
        return axiosInstance.put<any>(`/api/v1/provider/contracts/${id}`, data);
      },
      send: async (id: string) => {
        return axiosInstance.post<any>(`/api/v1/provider/contracts/${id}/send`);
      },
    },
    // Inquiries
    inquiries: {
      getAll: async (params?: { status?: string }) => {
        return axiosInstance.get<any[]>('/api/v1/provider/inquiries/', { params });
      },
      getById: async (id: string) => {
        return axiosInstance.get<any>(`/api/v1/provider/inquiries/${id}`);
      },
      update: async (id: string, data: any) => {
        return axiosInstance.put<any>(`/api/v1/provider/inquiries/${id}`, data);
      },
    },
    // Availability
    availability: {
      getAll: async () => {
        return axiosInstance.get<any[]>('/api/v1/provider/availability/');
      },
      addBlock: async (data: any) => {
        return axiosInstance.post<any>('/api/v1/provider/availability/block', data);
      },
      removeBlock: async (id: string) => {
        return axiosInstance.delete(`/api/v1/provider/availability/block/${id}`);
      },
    },
    // Assets
    assets: {
      getAll: async () => {
        return axiosInstance.get<any[]>('/api/v1/provider/assets/');
      },
      upload: async (file: File, fileType: string = 'image') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('file_type', fileType);
        return axiosInstance.post<any>('/api/v1/provider/assets/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      },
      delete: async (id: string) => {
        return axiosInstance.delete(`/api/v1/provider/assets/${id}`);
      },
    },
    // Earnings
    earnings: {
      getSummary: async () => {
        return axiosInstance.get<any>('/api/v1/provider/earnings/summary');
      },
      getDetails: async (params?: { limit?: number; offset?: number }) => {
        return axiosInstance.get<any[]>('/api/v1/provider/earnings/details', { params });
      },
      getPayments: async () => {
        return axiosInstance.get<any[]>('/api/v1/provider/earnings/payments');
      },
      requestWithdrawal: async (amount: number) => {
        return axiosInstance.post<any>('/api/v1/provider/earnings/withdraw', { amount });
      },
    },
    // Messages
    messages: {
      getAll: async () => {
        return axiosInstance.get<any[]>('/api/v1/provider/messages/');
      },
      send: async (data: any) => {
        return axiosInstance.post<any>('/api/v1/provider/messages/', data);
      },
    },
  };

  // Wedding Planning API
  wedding = {
    create: async (data: any) => {
      const payload: any = {
        couple_name: data.couple_name,
        wedding_date: data.wedding_date
      };
      if (data.venue) payload.venue = data.venue;
      if (data.guest_count) payload.guest_count = parseInt(data.guest_count);
      if (data.budget) payload.budget = parseFloat(data.budget);
      if (data.spent) payload.spent = parseFloat(data.spent);
      return axiosInstance.post<any>('/api/v1/wedding', payload);
    },
    getMy: async () => {
      return axiosInstance.get<any>('/api/v1/wedding/me');
    },
    update: async (data: any) => {
      return axiosInstance.put<any>('/api/v1/wedding/me', data);
    },
  };

  // Wedding Tasks API
  tasks = {
    getAll: async () => {
      return axiosInstance.get<any[]>('/api/v1/tasks');
    },
    create: async (data: any) => {
      return axiosInstance.post<any>('/api/v1/tasks', data);
    },
    update: async (id: string, data: any) => {
      return axiosInstance.put<any>(`/api/v1/tasks/${id}`, data);
    },
    delete: async (id: string) => {
      return axiosInstance.delete(`/api/v1/tasks/${id}`);
    },
  };

  // User Verification API
  verification = {
    submit: async (rdbFile: File, nidFile: File, faceFile: File) => {
      const formData = new FormData();
      formData.append('rdbFile', rdbFile);
      formData.append('nidFile', nidFile);
      formData.append('faceFile', faceFile);
      return axiosInstance.post<any>('/api/v1/user/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  };

  // Admin API
  admin = {
    stats: {
      get: async () => {
        return axiosInstance.get<any>('/api/v1/admin/stats');
      },
      getRecentActivity: async (limit?: number) => {
        return axiosInstance.get<any[]>('/api/v1/admin/recent-activity', { params: { limit } });
      },
      getRevenueAnalytics: async (period?: string) => {
        return axiosInstance.get<any[]>('/api/v1/admin/analytics/revenue', { params: { period } });
      },
      getUserAnalytics: async () => {
        return axiosInstance.get<any[]>('/api/v1/admin/analytics/users');
      },
    },
    users: {
      getAll: async (params?: { page?: number; limit?: number; role?: string; verified?: boolean; search?: string }) => {
        return axiosInstance.get<any>('/api/v1/admin/users', { params });
      },
      getById: async (id: string) => {
        return axiosInstance.get<any>(`/api/v1/auth/users/${id}`);
      },
      update: async (id: string, data: any) => {
        return axiosInstance.put<any>(`/api/v1/admin/users/${id}`, data);
      },
      suspend: async (id: string, reason: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/users/${id}/suspend`, { reason });
      },
      activate: async (id: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/users/${id}/activate`);
      },
      delete: async (id: string) => {
        return axiosInstance.delete(`/api/v1/admin/users/${id}`);
      },
      approve: async (id: string, notes?: string) => {
        return axiosInstance.put<any>(`/api/v1/auth/users/${id}/approve`, { admin_notes: notes });
      },
      reject: async (id: string, notes?: string) => {
        return axiosInstance.put<any>(`/api/v1/auth/users/${id}/reject`, { admin_notes: notes });
      },
      getVerification: async (id: string) => {
        return axiosInstance.get<any>(`/api/v1/auth/users/${id}/verification`);
      },
      getPendingVerifications: async () => {
        return axiosInstance.get<any[]>('/api/v1/auth/verifications/pending');
      },
    },
    providers: {
      getAll: async (status?: string) => {
        const params = status ? { status } : {};
        return axiosInstance.get<any[]>('/api/v1/admin/providers', { params });
      },
      getPending: async () => {
        return axiosInstance.get<any[]>('/api/v1/admin/onboarding?status=pending');
      },
      getDetails: async (id: string) => {
        return axiosInstance.get<any>(`/api/v1/admin/onboarding/${id}`);
      },
      approve: async (id: string, notes?: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/onboarding/${id}/approve`, { admin_notes: notes });
      },
      reject: async (id: string, reason: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/onboarding/${id}/reject`, { rejection_reason: reason });
      },
      suspend: async (id: string, reason: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/providers/${id}/suspend`, { reason });
      },
      activate: async (id: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/providers/${id}/activate`);
      },
      requestRevision: async (id: string, notes: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/onboarding/${id}/request-revision`, { admin_notes: notes });
      },
    },
    onboarding: {
      getAll: async (status?: string) => {
        const params = status ? { status } : {};
        return axiosInstance.get<any>('/api/v1/admin/onboarding', { params });
      },
      getStats: async () => {
        return axiosInstance.get<any>('/api/v1/admin/onboarding/stats');
      },
      getDetails: async (id: string) => {
        return axiosInstance.get<any>(`/api/v1/admin/onboarding/${id}`);
      },
      approve: async (id: string, notes?: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/onboarding/${id}/approve`, { admin_notes: notes });
      },
      reject: async (id: string, reason: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/onboarding/${id}/reject`, { rejection_reason: reason });
      },
      requestRevision: async (id: string, notes: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/onboarding/${id}/request-revision`, { admin_notes: notes });
      },
    },
    services: {
      getAll: async (status?: string) => {
        const params = status ? { status } : {};
        return axiosInstance.get<any>('/api/v1/admin/services', { params });
      },
      getStats: async () => {
        return axiosInstance.get<any>('/api/v1/admin/services/stats');
      },
      getDetails: async (id: string) => {
        return axiosInstance.get<any>(`/api/v1/admin/services/${id}`);
      },
      create: async (data: any) => {
        return axiosInstance.post<any>('/api/v1/admin/services', data);
      },
      update: async (id: string, data: any) => {
        return axiosInstance.put<any>(`/api/v1/admin/services/${id}`, data);
      },
      delete: async (id: string) => {
        return axiosInstance.delete<any>(`/api/v1/admin/services/${id}`);
      },
      approve: async (id: string, notes?: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/services/${id}/approve`, { admin_notes: notes });
      },
      reject: async (id: string, reason: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/services/${id}/reject`, { rejection_reason: reason });
      },
      suspend: async (id: string, reason: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/services/${id}/suspend`, { rejection_reason: reason });
      },
      enable: async (id: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/services/${id}/enable`);
      },
      toggleHomepageVisibility: async (id: string, visible: boolean) => {
        return axiosInstance.put<any>(`/api/v1/admin/services/${id}/homepage-visibility?visible=${visible}`);
      },
      toggleFeatured: async (id: string, featured: boolean) => {
        return axiosInstance.put<any>(`/api/v1/admin/services/${id}/featured?featured=${featured}`);
      },
    },
    providerServices: {
      getAll: async (status?: string) => {
        const params = status ? { status } : {};
        return axiosInstance.get<any>('/api/v1/admin/provider-services', { params });
      },
      getStats: async () => {
        return axiosInstance.get<any>('/api/v1/admin/provider-services/stats');
      },
      getDetails: async (id: string) => {
        return axiosInstance.get<any>(`/api/v1/admin/provider-services/${id}`);
      },
      approve: async (id: string, notes?: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/provider-services/${id}/approve`, { admin_notes: notes });
      },
      reject: async (id: string, reason: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/provider-services/${id}/reject`, { rejection_reason: reason });
      },
      suspend: async (id: string, reason: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/provider-services/${id}/suspend`, { rejection_reason: reason });
      },
      enable: async (id: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/provider-services/${id}/enable`);
      },
    },
    bookings: {
      getAll: async (params?: { page?: number; limit?: number; status?: string; date_from?: string; date_to?: string }) => {
        return axiosInstance.get<any>('/api/v1/admin/bookings', { params });
      },
      getStats: async () => {
        return axiosInstance.get<any>('/api/v1/admin/bookings/stats');
      },
      cancel: async (id: string, reason: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/bookings/${id}/cancel`, { reason });
      },
    },
    disputes: {
      getAll: async (params?: { status?: string; priority?: string; page?: number; limit?: number }) => {
        return axiosInstance.get<any>('/api/v1/admin/disputes', { params });
      },
      getStats: async () => {
        return axiosInstance.get<any>('/api/v1/admin/disputes/stats');
      },
      getDetails: async (id: string) => {
        return axiosInstance.get<any>(`/api/v1/admin/disputes/${id}`);
      },
      investigate: async (id: string, notes?: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/disputes/${id}/investigate`, { notes });
      },
      resolve: async (id: string, resolutionType: string, notes?: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/disputes/${id}/resolve`, { resolution_type: resolutionType, resolution_notes: notes });
      },
      reject: async (id: string, reason: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/disputes/${id}/reject`, { reason });
      },
      sendMessage: async (id: string, message: string, attachmentUrls?: string[]) => {
        return axiosInstance.post<any>(`/api/v1/admin/disputes/${id}/message`, { message, attachment_urls: attachmentUrls });
      },
    },
    events: {
      getAll: async (status?: string) => {
        const params = status ? { status } : {};
        return axiosInstance.get<any>('/api/v1/admin/events', { params });
      },
      getPending: async () => {
        return axiosInstance.get<any>('/api/v1/admin/events/pending');
      },
      getDetails: async (id: string) => {
        return axiosInstance.get<any>(`/api/v1/admin/events/${id}`);
      },
      getStats: async () => {
        return axiosInstance.get<any>('/api/v1/admin/events/stats');
      },
      approve: async (id: string, notes?: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/events/${id}/approve`, { admin_notes: notes });
      },
      reject: async (id: string, reason: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/events/${id}/reject`, { rejection_reason: reason });
      },
    },
    payments: {
      getWithdrawals: async (status?: string) => {
        const params = status ? { status } : {};
        return axiosInstance.get<any[]>('/api/v1/admin/payments/withdrawals', { params });
      },
      getStats: async () => {
        return axiosInstance.get<any>('/api/v1/admin/payments/stats');
      },
      // Platform earnings — 10% commission from bookings + ticket sales
      getPlatformEarnings: async (period?: string) => {
        const params = period ? { period } : {};
        return axiosInstance.get<any>('/api/v1/admin/payments/earnings', { params });
      },
      updateWithdrawalStatus: async (id: string, status: string, notes?: string) => {
        return axiosInstance.put<any>(`/api/v1/admin/payments/withdrawals/${id}`, { status, admin_notes: notes });
      },
    },
  };
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export axios instance for custom requests
export { axiosInstance };

