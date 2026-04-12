import { apiClient } from "@/lib/api-client";

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
    const response = await apiClient.put("/auth/update-profile", data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || "Failed to update profile"
    );
  }
}

/**
 * Change user password
 */
export async function changePassword(data: ChangePasswordData) {
  try {
    const response = await apiClient.put("/auth/change-password", data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || "Failed to change password"
    );
  }
}

/**
 * Get current user profile
 */
export async function getCurrentProfile() {
  try {
    const response = await apiClient.get("/auth/me");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || "Failed to fetch profile"
    );
  }
}
