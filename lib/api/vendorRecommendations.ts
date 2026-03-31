import { API_BASE_URL } from "@/lib/constants";

export interface VendorRecommendation {
  id: string;
  name: string;
  category: string;
  location: string | null;
  rating: number;
  bookings_count: number;
  price_range_min: number | null;
  price_range_max: number | null;
  description: string | null;
  specialties: string[];
  allocated_budget: number;
  score: number;
  badge: "Best Match" | "Budget Friendly" | "Premium Option" | "Available";
  business_name: string | null;
  city: string | null;
}

export interface RecommendationResult {
  total_budget: number;
  budget_allocation: Record<string, number>;
  recommendations: Record<string, VendorRecommendation[]>;
  summary: string;
}

export interface RecommendationParams {
  total_budget: number;
  location?: string;
  top_n?: number;
  venue_weight?: number;
  catering_weight?: number;
  decoration_weight?: number;
  photography_weight?: number;
  entertainment_weight?: number;
  other_weight?: number;
}

export async function fetchVendorRecommendations(
  params: RecommendationParams
): Promise<RecommendationResult> {
  const query = new URLSearchParams();
  query.set("total_budget", params.total_budget.toString());
  if (params.location) query.set("location", params.location);
  if (params.top_n) query.set("top_n", params.top_n.toString());
  if (params.venue_weight != null) query.set("venue_weight", params.venue_weight.toString());
  if (params.catering_weight != null) query.set("catering_weight", params.catering_weight.toString());
  if (params.decoration_weight != null) query.set("decoration_weight", params.decoration_weight.toString());
  if (params.photography_weight != null) query.set("photography_weight", params.photography_weight.toString());
  if (params.entertainment_weight != null) query.set("entertainment_weight", params.entertainment_weight.toString());
  if (params.other_weight != null) query.set("other_weight", params.other_weight.toString());

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(
    `${API_BASE_URL}/api/v1/recommendations/vendors?${query.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch recommendations");
  }

  return res.json();
}
