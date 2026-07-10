"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { ProviderService } from "@/lib/api";
import { queryKeys, slowQueryOptions } from "@/lib/cache";

export interface PopularService extends ProviderService {
  // All fields already on ProviderService; this alias improves readability
}

async function fetchPopularServices(limit = 8, category?: string): Promise<PopularService[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (category) params.set("category", category);

  const response = await apiClient.get<PopularService[]>(
    `/api/v1/provider/services/popular?${params.toString()}`
  );

  // Handle both wrapped { data: [...] } and direct array responses
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response)) return response as unknown as PopularService[];
  return [];
}

export function usePopularServices(limit = 8, category?: string) {
  return useQuery({
    queryKey: queryKeys.public.popularServices(limit, category),
    queryFn: () => fetchPopularServices(limit, category),
    // Popular services change slowly — 5-minute stale window avoids
    // redundant API calls when the user navigates back to the home page.
    ...slowQueryOptions,
  });
}
