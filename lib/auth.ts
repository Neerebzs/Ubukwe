import { apiClient, API_ENDPOINTS, LoginRequest, RegisterRequest, AuthResponse, User, ApiResponse } from './api';

// Authentication API functions
export const authApi = {
  // Register a new user
  async register(data: RegisterRequest): Promise<any> {
    const backendData = {
      username: data.email.split('@')[0], // Fallback username
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      role: data.role === 'service_provider' ? 'service_provider' : 'event_owner',
      phone_number: data.phone,
    };

    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      backendData
    );

    return {
      status: 'success',
      message: 'Registration successful',
      data: {
        user: response.data?.user || (response as any).user,
        accessToken: response.data?.access_token || (response as any).access_token,
        refreshToken: response.data?.refresh_token || (response as any).refresh_token || response.data?.access_token || (response as any).access_token,
      },
    };
  },

  // Login user
  async login(data: LoginRequest): Promise<any> {
    console.log('Starting login request to:', API_ENDPOINTS.AUTH.LOGIN);
    
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        data
      );

      return {
        status: 'success',
        message: 'Login successful',
        data: {
          user: response.data?.user || (response as any).user,
          accessToken: response.data?.access_token || (response as any).access_token,
          refreshToken: response.data?.refresh_token || (response as any).refresh_token || response.data?.access_token || (response as any).access_token,
        },
      };
    } catch (error: any) {
      console.error('Login failed:', error.message);
      throw error;
    }
  },

  // Logout user
  async logout(): Promise<ApiResponse> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
  },

  // Refresh access token
  async refreshToken(): Promise<any> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken: refreshToken }
    );

    return {
      status: 'success',
      message: 'Token refreshed',
      data: {
        user: response.data?.user,
        accessToken: response.data?.access_token,
        refreshToken: response.data?.refresh_token,
      },
    };
  },

  // Get current user profile
  async getMe(): Promise<ApiResponse<User>> {
    return apiClient.get<User>(API_ENDPOINTS.AUTH.GET_ME);
  },

  // Get user profile
  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>(API_ENDPOINTS.AUTH.GET_PROFILE);
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put<User>(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data);
  },

  // Change password
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    return apiClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse> {
    return apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  // Reset password
  async resetPassword(data: {
    token: string;
    password: string;
  }): Promise<ApiResponse> {
    return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },
};

// Token management utilities
export const tokenManager = {
  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      // Also set a cookie so Next.js middleware can enforce server-side auth
      document.cookie = `accessToken=${accessToken}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 7}`;
    }
  },

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  },

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Clear the middleware cookie
      document.cookie = 'accessToken=; path=/; max-age=0';
    }
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};

// User management utilities
export const userManager = {
  setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  clearUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },

  updateUser(updates: Partial<User>): void {
    const currentUser = this.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.setUser(updatedUser);
    }
  },
};
