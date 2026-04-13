import { apiClient, API_ENDPOINTS } from "@/lib/api";

export interface ProfileUpdateData {
  full_name?: string;
  email?: string;
  phone_number?: string;
  location?: string;
  username?: string;
  profile_image_url?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Update user profile information
 */
export async function updateProfile(data: ProfileUpdateData) {
  try {
    const response = await apiClient.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.message || "Failed to update profile");
  }
}

/**
 * Change user password
 */
export async function changePassword(data: ChangePasswordData) {
  try {
    const response = await apiClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.message || "Failed to change password");
  }
}

/**
 * Get current user profile
 */
export async function getCurrentProfile() {
  try {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.GET_ME);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.message || "Failed to fetch profile");
  }
}
