import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const rawBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:4000').trim();
// Ensure protocol
let baseUrl = rawBaseUrl.startsWith('http') ? rawBaseUrl : `https://${rawBaseUrl}`;
// Clean trailing slashes and redundant /api/v1
const API_BASE_URL = baseUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
const API_VERSION = 'v1';

/** Append preview + wedding privacy access_token for public wedding GET APIs. */
function publicWeddingQs(slug: string, preview?: string, accessToken?: string): string {
  const params = new URLSearchParams();
  if (preview) params.set('preview', preview);
  const token =
    accessToken ||
    (typeof window !== 'undefined'
      ? localStorage.getItem(`wedding-access-${slug}`) || undefined
      : undefined);
  if (token) params.set('access_token', token);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

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
    // Google OAuth
    GOOGLE_LOGIN: `/api/${API_VERSION}/auth/google`,
    // Two-Factor Authentication
    TWO_FA_SETUP: `/api/${API_VERSION}/auth/2fa/setup`,
    TWO_FA_VERIFY: `/api/${API_VERSION}/auth/2fa/verify`,
    TWO_FA_LOGIN: `/api/${API_VERSION}/auth/2fa/login`,
    TWO_FA_DISABLE: `/api/${API_VERSION}/auth/2fa/disable`,
    TWO_FA_REGENERATE_BACKUP: `/api/${API_VERSION}/auth/2fa/regenerate-backup-codes`,
    TWO_FA_STATUS: `/api/${API_VERSION}/auth/2fa/status`,
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
    WORKFORCE: {
      DASHBOARD: `/api/${API_VERSION}/provider/workforce/dashboard`,
      WORKERS: `/api/${API_VERSION}/provider/workforce/workers`,
      TEAMS: `/api/${API_VERSION}/provider/workforce/teams`,
      EVENTS: `/api/${API_VERSION}/provider/workforce/events`,
      PAYROLL: `/api/${API_VERSION}/provider/workforce/payroll`,
      ROLE_RATES: `/api/${API_VERSION}/provider/workforce/role-rates`,
      COMMISSION_PLANS: `/api/${API_VERSION}/provider/workforce/commission-plans`,
      LEAVE: `/api/${API_VERSION}/provider/workforce/leave`,
      DOCUMENTS: `/api/${API_VERSION}/provider/workforce/documents`,
      PERFORMANCE: `/api/${API_VERSION}/provider/workforce/performance`,
      SETTINGS: `/api/${API_VERSION}/provider/workforce/settings`,
      REPORTS: (type: string) => `/api/${API_VERSION}/provider/workforce/reports/${type}`,
    },
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
    WEBSITE: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/website`,
    WEBSITE_PUBLISH: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/website/publish`,
    WEBSITE_UNPUBLISH: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/website/unpublish`,
    WEBSITE_ARCHIVE: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/website/archive`,
    WEBSITE_PREVIEW_URL: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/website/preview-url`,
    SLUG_CHECK: `/api/${API_VERSION}/wedding/slugs/check`,
    WEBSITE_SECTIONS: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/website/sections`,
    WEBSITE_SECTIONS_REORDER: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/website/sections/reorder`,
    WEBSITE_SECTIONS_TRASH: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/website/sections/trash`,
    WEBSITE_SECTION: (weddingId: string, sectionId: string) => `/api/${API_VERSION}/wedding/${weddingId}/website/sections/${sectionId}`,
    WEBSITE_SECTION_RESTORE: (weddingId: string, sectionId: string) => `/api/${API_VERSION}/wedding/${weddingId}/website/sections/${sectionId}/restore`,
    WEBSITE_SECTION_DUPLICATE: (weddingId: string, sectionId: string) => `/api/${API_VERSION}/wedding/${weddingId}/website/sections/${sectionId}/duplicate`,
    GIFTS: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/gifts`,
    GIFTS_SUMMARY: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/gifts/summary`,
    GIFT_APPROVE: (weddingId: string, giftId: string) => `/api/${API_VERSION}/wedding/${weddingId}/gifts/${giftId}/approve`,
    GIFT_REJECT: (weddingId: string, giftId: string) => `/api/${API_VERSION}/wedding/${weddingId}/gifts/${giftId}/reject`,
    GIFT_RECEIVED: (weddingId: string, giftId: string) => `/api/${API_VERSION}/wedding/${weddingId}/gifts/${giftId}/received`,
    GIFT_THANK_YOU: (weddingId: string, giftId: string) => `/api/${API_VERSION}/wedding/${weddingId}/gifts/${giftId}/thank-you`,
    GIFTS_EXPORT: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/gifts/export`,
    MC_PROGRAM: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/mc-program`,
    MC_PROGRAM_ITEM: (weddingId: string, itemId: string) => `/api/${API_VERSION}/wedding/${weddingId}/mc-program/${itemId}`,
    MC_ACCESS: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/mc-access`,
    TEAM: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/team`,
    TEAM_INVITE: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/team/invite`,
    TEAM_MEMBER: (weddingId: string, roleId: string) => `/api/${API_VERSION}/wedding/${weddingId}/team/${roleId}`,
    TEAM_ACCEPT: `/api/${API_VERSION}/wedding/team/accept-invite`,
    GUESTBOOK: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/guestbook`,
    GUESTBOOK_ENTRY: (weddingId: string, entryId: string) => `/api/${API_VERSION}/wedding/${weddingId}/guestbook/${entryId}`,
    WEBSITE_ANALYTICS: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/website/analytics`,
    CUSTOM_DOMAIN: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/website/custom-domain`,
    CUSTOM_DOMAIN_VERIFY: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/website/custom-domain/verify`,
    ANNOUNCEMENTS: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/announcements`,
    ANNOUNCEMENT: (weddingId: string, id: string) => `/api/${API_VERSION}/wedding/${weddingId}/announcements/${id}`,
    GALLERY: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/gallery`,
    GALLERY_ITEM: (weddingId: string, itemId: string) => `/api/${API_VERSION}/wedding/${weddingId}/gallery/${itemId}`,
    EVENTS: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/events`,
    EVENT: (weddingId: string, eventId: string) => `/api/${API_VERSION}/wedding/${weddingId}/events/${eventId}`,
    EVENTS_SEED: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/events/seed`,
    TIMELINE: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/timeline`,
    TIMELINE_ITEM: (weddingId: string, itemId: string) => `/api/${API_VERSION}/wedding/${weddingId}/timeline/${itemId}`,
    TIMELINE_SEED: (weddingId: string) => `/api/${API_VERSION}/wedding/${weddingId}/timeline/seed`,
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
    WEDDING_SITE: (slug: string) => `/api/${API_VERSION}/public/w/${slug}`,
    WEDDING_VERIFY_ACCESS: (slug: string) => `/api/${API_VERSION}/public/w/${slug}/verify-access`,
    WEDDING_RSVP: (slug: string) => `/api/${API_VERSION}/public/w/${slug}/rsvp`,
    WEDDING_GIFTS: (slug: string) => `/api/${API_VERSION}/public/w/${slug}/gifts`,
    WEDDING_GIFTS_PUBLIC: (slug: string) => `/api/${API_VERSION}/public/w/${slug}/gifts/public`,
    WEDDING_GIFTS_PAY: (slug: string) => `/api/${API_VERSION}/public/w/${slug}/gifts/pay`,
    WEDDING_GIFTS_VERIFY: `/api/${API_VERSION}/public/gifts/verify-payment`,
    WEDDING_MC: (slug: string) => `/api/${API_VERSION}/public/w/${slug}/mc`,
    WEDDING_MC_COMPLETE: (slug: string, itemId: string) => `/api/${API_VERSION}/public/w/${slug}/mc/program/${itemId}/complete`,
    WEDDING_MC_NOTES: (slug: string, itemId: string) => `/api/${API_VERSION}/public/w/${slug}/mc/program/${itemId}/notes`,
    WEDDING_GUESTBOOK: (slug: string) => `/api/${API_VERSION}/public/w/${slug}/guestbook`,
    WEDDING_GALLERY: (slug: string) => `/api/${API_VERSION}/public/w/${slug}/gallery`,
    WEDDING_EVENTS: (slug: string) => `/api/${API_VERSION}/public/w/${slug}/events`,
    WEDDING_TIMELINE: (slug: string) => `/api/${API_VERSION}/public/w/${slug}/timeline`,
    CAPTCHA_STATUS: `/api/${API_VERSION}/public/captcha-status`,
    RESOLVE_DOMAIN: `/api/${API_VERSION}/public/resolve-domain`,
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
  // Payment endpoints (DPO Pay hosted page)
  PAYMENTS: {
    CREATE: `/api/${API_VERSION}/payments`,
    VERIFY_DPO: (paymentId: string) => `/api/${API_VERSION}/payments/${paymentId}/verify-dpo`,
    GET: (paymentId: string) => `/api/${API_VERSION}/payments/${paymentId}`,
    LIST: `/api/${API_VERSION}/payments`,
  },
  // Ticket order payments (DPO Pay hosted page; public — anonymous purchases)
  TICKET_ORDERS: {
    INITIATE: `/api/${API_VERSION}/tickets/purchase/initiate`,
    VERIFY: (orderId: string) => `/api/${API_VERSION}/tickets/purchase/${orderId}/verify`,
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
  // 2FA intermediate response fields
  two_factor_required?: boolean;
  pre_auth_token?: string;
}

export interface TwoFAStatus {
  two_factor_enabled: boolean;
  two_factor_enabled_at: string | null;
  last_2fa_verification: string | null;
  backup_codes_remaining: number;
}

export interface TwoFASetupResponse {
  secret: string;
  qr_code: string; // data:image/png;base64,...
  message: string;
}

export interface TwoFAVerifyResponse {
  message: string;
  backup_codes: string[];
}

export interface TwoFALoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
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
  avatar?: string;
  onboarding_completed: boolean;
  business_type?: string;
  years_experience?: number;
  business_description?: string;
  service_categories?: string[];
  address?: string;
  city?: string;
  country?: string;
  location?: string;
  // Auth / security
  provider?: 'local' | 'google';
  email_verified?: boolean;
  two_factor_enabled?: boolean;
  login_method?: 'email' | 'google';
  last_login?: string;
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

export interface WeddingWebsiteSection {
  id: string;
  website_id: string;
  section_type: string;
  title?: string;
  content: Record<string, unknown>;
  sort_order: number;
  is_visible: boolean;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WeddingWebsite {
  id: string;
  wedding_id: string;
  slug: string;
  slug_type: "custom" | "auto";
  status: "draft" | "preview" | "published" | "archived";
  theme_id: string;
  theme_config: Record<string, unknown>;
  couple_profile: Record<string, unknown>;
  privacy_mode: string;
  guest_access_config: Record<string, unknown>;
  seo_config: Record<string, unknown>;
  custom_domain?: string | null;
  custom_domain_verified: boolean;
  has_custom_domain?: boolean;
  published_at?: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at?: string;
  sections?: WeddingWebsiteSection[];
}

export interface PublicWeddingSite {
  slug: string;
  status: string;
  theme_id: string;
  theme_config: Record<string, unknown>;
  couple_profile: Record<string, unknown>;
  seo_config: Record<string, unknown>;
  privacy_mode: string;
  requires_access?: boolean;
  sections: WeddingWebsiteSection[];
  wedding: {
    couple_name: string;
    wedding_date?: string;
    venue?: string;
  };
}

export interface WeddingGift {
  id: string;
  reference_number: string;
  contributor_name: string;
  contributor_phone?: string | null;
  contributor_email?: string | null;
  relationship: string;
  gift_type: string;
  gift_details: Record<string, unknown>;
  privacy: string;
  status: string;
  amount?: string | null;
  currency: string;
  thank_you_sent: boolean;
  received_at?: string | null;
  created_at: string;
}

export interface GiftSummary {
  total_gifts: number;
  total_amount: string;
  received_amount: string;
  pending_count: number;
  received_count: number;
  contributors_count: number;
  popular_gift_type?: string | null;
  by_type: Record<string, number>;
}

export interface MCProgramItem {
  id: string;
  wedding_id: string;
  start_time: string;
  end_time?: string | null;
  title: string;
  description?: string | null;
  responsible_person?: string | null;
  couple_notes?: string | null;
  mc_private_notes?: string | null;
  is_completed: boolean;
  completed_at?: string | null;
  sort_order: number;
}

export interface MCPortalData {
  wedding: { couple_name: string; wedding_date?: string; venue?: string };
  access_mode: string;
  program: MCProgramItem[];
  announcements?: WeddingAnnouncement[];
  live_status: {
    current_activity_id?: string | null;
    completed_count: number;
    total_count: number;
  };
}

export interface WeddingAnnouncement {
  id: string;
  wedding_id: string;
  website_id: string;
  title: string;
  message: string;
  priority: string;
  is_active: boolean;
  notify_mc: boolean;
  created_at: string;
  updated_at?: string;
}

export interface WeddingGalleryItem {
  id: string;
  website_id: string;
  wedding_id: string;
  image_url: string;
  thumbnail_url?: string | null;
  caption?: string | null;
  uploader_name?: string | null;
  source: string;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at?: string | null;
}

export interface WeddingEventItem {
  id: string;
  wedding_id: string;
  title: string;
  event_type: string;
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  gps_lat?: number | null;
  gps_lng?: number | null;
  google_maps_url?: string | null;
  parking_info?: string | null;
  dress_code?: string | null;
  contacts?: { name?: string; phone?: string }[];
  notes?: string | null;
  is_public: boolean;
  sort_order: number;
}

export interface WeddingTimelineItem {
  id: string;
  wedding_id: string;
  title: string;
  description?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  location?: string | null;
  images?: string[];
  videos?: string[];
  is_public: boolean;
  sort_order: number;
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
      // Longer timeout (2 min) for bulk email sending
      return apiClient.post(`/api/v1/wedding/${weddingId}/guests/send-invitations`, { guest_ids: guestIds, invitation }, { timeout: 120000 });
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
      return fetch(`${API_BASE_URL}/api/v1/invitations/upload-template`, {
        method: "POST",
        headers: { Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : ""}` },
        body: form,
      }).then(r => r.json());
    },
    listTemplates(): Promise<any> {
      return apiClient.get(`/api/v1/invitations/templates`);
    },
  },
  website: {
    get<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(API_ENDPOINTS.WEDDING.WEBSITE(weddingId));
    },
    create<T>(weddingId: string, data?: { slug?: string; slug_type?: string; theme_id?: string }): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.WEBSITE(weddingId), data || {});
    },
    update<T>(weddingId: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
      return apiClient.put<T>(API_ENDPOINTS.WEDDING.WEBSITE(weddingId), data);
    },
    publish<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.WEBSITE_PUBLISH(weddingId), {});
    },
    unpublish<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.WEBSITE_UNPUBLISH(weddingId), {});
    },
    archive<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.WEBSITE_ARCHIVE(weddingId), {});
    },
    previewUrl<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(API_ENDPOINTS.WEDDING.WEBSITE_PREVIEW_URL(weddingId));
    },
    checkSlug<T>(slug: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(`${API_ENDPOINTS.WEDDING.SLUG_CHECK}?slug=${encodeURIComponent(slug)}`);
    },
    getPublic<T>(slug: string, preview?: string, accessToken?: string): Promise<ApiResponse<T>> {
      const params = new URLSearchParams();
      if (preview) params.set("preview", preview);
      if (accessToken) params.set("access_token", accessToken);
      const qs = params.toString() ? `?${params.toString()}` : "";
      return apiClient.get<T>(`${API_ENDPOINTS.PUBLIC.WEDDING_SITE(slug)}${qs}`);
    },
    verifyAccess<T>(slug: string, data: { password?: string; invite_code?: string }): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.PUBLIC.WEDDING_VERIFY_ACCESS(slug), data);
    },
    submitRsvp<T>(slug: string, data: Record<string, unknown>, preview?: string): Promise<ApiResponse<T>> {
      const qs = preview ? `?preview=${encodeURIComponent(preview)}` : "";
      return apiClient.post<T>(`${API_ENDPOINTS.PUBLIC.WEDDING_RSVP(slug)}${qs}`, data);
    },
    updateSection<T>(weddingId: string, sectionId: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
      return apiClient.put<T>(API_ENDPOINTS.WEDDING.WEBSITE_SECTION(weddingId, sectionId), data);
    },
    createSection<T>(weddingId: string, data: { section_type: string; title?: string; content?: Record<string, unknown> }): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.WEBSITE_SECTIONS(weddingId), data);
    },
    reorderSections<T>(weddingId: string, sectionIds: string[]): Promise<ApiResponse<T>> {
      return apiClient.put<T>(API_ENDPOINTS.WEDDING.WEBSITE_SECTIONS_REORDER(weddingId), { section_ids: sectionIds });
    },
    deleteSection<T>(weddingId: string, sectionId: string): Promise<ApiResponse<T>> {
      return apiClient.delete<T>(API_ENDPOINTS.WEDDING.WEBSITE_SECTION(weddingId, sectionId));
    },
    restoreSection<T>(weddingId: string, sectionId: string): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.WEBSITE_SECTION_RESTORE(weddingId, sectionId), {});
    },
    duplicateSection<T>(weddingId: string, sectionId: string): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.WEBSITE_SECTION_DUPLICATE(weddingId, sectionId), {});
    },
    listTrash<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(API_ENDPOINTS.WEDDING.WEBSITE_SECTIONS_TRASH(weddingId));
    },
    getCustomDomain<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(API_ENDPOINTS.WEDDING.CUSTOM_DOMAIN(weddingId));
    },
    setCustomDomain<T>(weddingId: string, domain: string): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.CUSTOM_DOMAIN(weddingId), { domain });
    },
    verifyCustomDomain<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.CUSTOM_DOMAIN_VERIFY(weddingId), {});
    },
    removeCustomDomain<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.delete<T>(API_ENDPOINTS.WEDDING.CUSTOM_DOMAIN(weddingId));
    },
  },
  public: {
    getCaptchaStatus<T>(): Promise<ApiResponse<T>> {
      return apiClient.get<T>(API_ENDPOINTS.PUBLIC.CAPTCHA_STATUS);
    },
    resolveDomain<T>(host: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(`${API_ENDPOINTS.PUBLIC.RESOLVE_DOMAIN}?host=${encodeURIComponent(host)}`);
    },
  },
  gifts: {
    list<T>(weddingId: string, status?: string): Promise<ApiResponse<T>> {
      const qs = status ? `?status=${status}` : "";
      return apiClient.get<T>(`${API_ENDPOINTS.WEDDING.GIFTS(weddingId)}${qs}`);
    },
    summary<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(API_ENDPOINTS.WEDDING.GIFTS_SUMMARY(weddingId));
    },
    registerPublic<T>(slug: string, data: Record<string, unknown>, preview?: string): Promise<ApiResponse<T>> {
      const qs = preview ? `?preview=${encodeURIComponent(preview)}` : "";
      return apiClient.post<T>(`${API_ENDPOINTS.PUBLIC.WEDDING_GIFTS(slug)}${qs}`, data);
    },
    payOnline<T>(slug: string, data: { gift_id?: string; reference_number?: string }, preview?: string): Promise<ApiResponse<T>> {
      const qs = preview ? `?preview=${encodeURIComponent(preview)}` : "";
      return apiClient.post<T>(`${API_ENDPOINTS.PUBLIC.WEDDING_GIFTS_PAY(slug)}${qs}`, data);
    },
    verifyPayment<T>(contributionId: string, transactionToken?: string): Promise<ApiResponse<T>> {
      const params = new URLSearchParams({ contribution_id: contributionId });
      if (transactionToken) params.set("TransactionToken", transactionToken);
      return apiClient.get<T>(`${API_ENDPOINTS.PUBLIC.WEDDING_GIFTS_VERIFY}?${params}`);
    },
    listPublic<T>(slug: string, preview?: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(`${API_ENDPOINTS.PUBLIC.WEDDING_GIFTS_PUBLIC(slug)}${publicWeddingQs(slug, preview)}`);
    },
    approve<T>(weddingId: string, giftId: string): Promise<ApiResponse<T>> {
      return apiClient.put<T>(API_ENDPOINTS.WEDDING.GIFT_APPROVE(weddingId, giftId), {});
    },
    reject<T>(weddingId: string, giftId: string): Promise<ApiResponse<T>> {
      return apiClient.put<T>(API_ENDPOINTS.WEDDING.GIFT_REJECT(weddingId, giftId), {});
    },
    markReceived<T>(weddingId: string, giftId: string): Promise<ApiResponse<T>> {
      return apiClient.put<T>(API_ENDPOINTS.WEDDING.GIFT_RECEIVED(weddingId, giftId), {});
    },
    thankYou<T>(weddingId: string, giftId: string, message?: string): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.GIFT_THANK_YOU(weddingId, giftId), { message });
    },
    exportCsvUrl(weddingId: string): string {
      return `${API_BASE_URL}${API_ENDPOINTS.WEDDING.GIFTS_EXPORT(weddingId)}`;
    },
  },
  announcements: {
    list<T>(weddingId: string, activeOnly?: boolean): Promise<ApiResponse<T>> {
      const qs = activeOnly ? "?active_only=true" : "";
      return apiClient.get<T>(`${API_ENDPOINTS.WEDDING.ANNOUNCEMENTS(weddingId)}${qs}`);
    },
    create<T>(weddingId: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.ANNOUNCEMENTS(weddingId), data);
    },
    update<T>(weddingId: string, id: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
      return apiClient.put<T>(API_ENDPOINTS.WEDDING.ANNOUNCEMENT(weddingId, id), data);
    },
    delete<T>(weddingId: string, id: string): Promise<ApiResponse<T>> {
      return apiClient.delete<T>(API_ENDPOINTS.WEDDING.ANNOUNCEMENT(weddingId, id));
    },
  },
  gallery: {
    list<T>(weddingId: string, status?: string): Promise<ApiResponse<T>> {
      const qs = status ? `?status=${status}` : "";
      return apiClient.get<T>(`${API_ENDPOINTS.WEDDING.GALLERY(weddingId)}${qs}`);
    },
    add<T>(weddingId: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.GALLERY(weddingId), data);
    },
    moderate<T>(weddingId: string, itemId: string, status: string): Promise<ApiResponse<T>> {
      return apiClient.put<T>(API_ENDPOINTS.WEDDING.GALLERY_ITEM(weddingId, itemId), { status });
    },
    delete<T>(weddingId: string, itemId: string): Promise<ApiResponse<T>> {
      return apiClient.delete<T>(API_ENDPOINTS.WEDDING.GALLERY_ITEM(weddingId, itemId));
    },
    listPublic<T>(slug: string, preview?: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(`${API_ENDPOINTS.PUBLIC.WEDDING_GALLERY(slug)}${publicWeddingQs(slug, preview)}`);
    },
    submitPublic<T>(slug: string, data: Record<string, unknown>, preview?: string): Promise<ApiResponse<T>> {
      const qs = preview ? `?preview=${encodeURIComponent(preview)}` : "";
      return apiClient.post<T>(`${API_ENDPOINTS.PUBLIC.WEDDING_GALLERY(slug)}${qs}`, data);
    },
  },
  events: {
    list<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(API_ENDPOINTS.WEDDING.EVENTS(weddingId));
    },
    create<T>(weddingId: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.EVENTS(weddingId), data);
    },
    seed<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.EVENTS_SEED(weddingId), {});
    },
    update<T>(weddingId: string, eventId: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
      return apiClient.put<T>(API_ENDPOINTS.WEDDING.EVENT(weddingId, eventId), data);
    },
    delete<T>(weddingId: string, eventId: string): Promise<ApiResponse<T>> {
      return apiClient.delete<T>(API_ENDPOINTS.WEDDING.EVENT(weddingId, eventId));
    },
    listPublic<T>(slug: string, preview?: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(`${API_ENDPOINTS.PUBLIC.WEDDING_EVENTS(slug)}${publicWeddingQs(slug, preview)}`);
    },
  },
  timeline: {
    list<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(API_ENDPOINTS.WEDDING.TIMELINE(weddingId));
    },
    create<T>(weddingId: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.TIMELINE(weddingId), data);
    },
    seed<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.TIMELINE_SEED(weddingId), {});
    },
    update<T>(weddingId: string, itemId: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
      return apiClient.put<T>(API_ENDPOINTS.WEDDING.TIMELINE_ITEM(weddingId, itemId), data);
    },
    delete<T>(weddingId: string, itemId: string): Promise<ApiResponse<T>> {
      return apiClient.delete<T>(API_ENDPOINTS.WEDDING.TIMELINE_ITEM(weddingId, itemId));
    },
    listPublic<T>(slug: string, preview?: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(`${API_ENDPOINTS.PUBLIC.WEDDING_TIMELINE(slug)}${publicWeddingQs(slug, preview)}`);
    },
  },
  mcPortal: {
    listProgram<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(API_ENDPOINTS.WEDDING.MC_PROGRAM(weddingId));
    },
    createItem<T>(weddingId: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.MC_PROGRAM(weddingId), data);
    },
    updateItem<T>(weddingId: string, itemId: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
      return apiClient.put<T>(API_ENDPOINTS.WEDDING.MC_PROGRAM_ITEM(weddingId, itemId), data);
    },
    deleteItem<T>(weddingId: string, itemId: string): Promise<ApiResponse<T>> {
      return apiClient.delete<T>(API_ENDPOINTS.WEDDING.MC_PROGRAM_ITEM(weddingId, itemId));
    },
    generateAccessLink<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.MC_ACCESS(weddingId), {});
    },
    updateAccess<T>(weddingId: string, access_mode: string): Promise<ApiResponse<T>> {
      return apiClient.put<T>(API_ENDPOINTS.WEDDING.MC_ACCESS(weddingId), { access_mode });
    },
    getPublic<T>(slug: string, token?: string, preview?: string): Promise<ApiResponse<T>> {
      const params = new URLSearchParams();
      if (token) params.set("token", token);
      if (preview) params.set("preview", preview);
      const qs = params.toString() ? `?${params}` : "";
      return apiClient.get<T>(`${API_ENDPOINTS.PUBLIC.WEDDING_MC(slug)}${qs}`);
    },
    completeActivity<T>(slug: string, itemId: string, token?: string): Promise<ApiResponse<T>> {
      const qs = token ? `?token=${encodeURIComponent(token)}` : "";
      return apiClient.put<T>(`${API_ENDPOINTS.PUBLIC.WEDDING_MC_COMPLETE(slug, itemId)}${qs}`, {});
    },
    saveNotes<T>(slug: string, itemId: string, notes: string, token?: string): Promise<ApiResponse<T>> {
      const qs = token ? `?token=${encodeURIComponent(token)}` : "";
      return apiClient.put<T>(`${API_ENDPOINTS.PUBLIC.WEDDING_MC_NOTES(slug, itemId)}${qs}`, { notes });
    },
  },
  team: {
    list<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(API_ENDPOINTS.WEDDING.TEAM(weddingId));
    },
    assign<T>(weddingId: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.TEAM(weddingId), data);
    },
    invite<T>(weddingId: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.TEAM_INVITE(weddingId), data);
    },
    remove<T>(weddingId: string, roleId: string): Promise<ApiResponse<T>> {
      return apiClient.delete<T>(API_ENDPOINTS.WEDDING.TEAM_MEMBER(weddingId, roleId));
    },
    acceptInvite<T>(token: string): Promise<ApiResponse<T>> {
      return apiClient.post<T>(API_ENDPOINTS.WEDDING.TEAM_ACCEPT, { token });
    },
  },
  guestbook: {
    listAdmin<T>(weddingId: string, status?: string): Promise<ApiResponse<T>> {
      const qs = status ? `?status=${status}` : "";
      return apiClient.get<T>(`${API_ENDPOINTS.WEDDING.GUESTBOOK(weddingId)}${qs}`);
    },
    moderate<T>(weddingId: string, entryId: string, status: string): Promise<ApiResponse<T>> {
      return apiClient.put<T>(API_ENDPOINTS.WEDDING.GUESTBOOK_ENTRY(weddingId, entryId), { status });
    },
    listPublic<T>(slug: string, preview?: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(`${API_ENDPOINTS.PUBLIC.WEDDING_GUESTBOOK(slug)}${publicWeddingQs(slug, preview)}`);
    },
    submit<T>(slug: string, data: Record<string, unknown>, preview?: string): Promise<ApiResponse<T>> {
      const qs = preview ? `?preview=${encodeURIComponent(preview)}` : "";
      return apiClient.post<T>(`${API_ENDPOINTS.PUBLIC.WEDDING_GUESTBOOK(slug)}${qs}`, data);
    },
    analytics<T>(weddingId: string): Promise<ApiResponse<T>> {
      return apiClient.get<T>(API_ENDPOINTS.WEDDING.WEBSITE_ANALYTICS(weddingId));
    },
  },
};
