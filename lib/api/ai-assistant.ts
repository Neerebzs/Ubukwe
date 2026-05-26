/**
 * AI Wedding Assistant API Client
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:4000';

export interface AISuggestion {
  id: string;
  wedding_id: string;
  suggestion_type: 'task_priority' | 'budget_alert' | 'vendor_booking' | 'timeline_risk';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  reasoning?: string;
  impact_if_acted?: string;
  impact_if_ignored?: string;
  related_task_id?: string;
  related_category_id?: string;
  context_data?: any;
  suggested_actions?: Array<{
    label: string;
    action: string;
    category?: string;
  }>;
  status: 'pending' | 'accepted' | 'ignored' | 'postponed' | 'dismissed';
  user_response?: string;
  responded_at?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface AIBriefing {
  id: string;
  wedding_id: string;
  briefing_type: 'daily' | 'weekly';
  briefing_date: string;
  summary: string;
  urgent_tasks?: Array<{
    id: string;
    title: string;
    due_date?: string;
    priority: string;
  }>;
  budget_alerts?: Array<{
    category: string;
    allocated: number;
    spent: number;
    overspend?: number;
    remaining?: number;
    usage_percent?: number;
  }>;
  upcoming_milestones?: Array<{
    id: string;
    title: string;
    due_date?: string;
    priority: string;
    category?: string;
  }>;
  suggested_focus_areas?: Array<{
    area: string;
    description: string;
    priority: string;
  }>;
  completion_rate?: number;
  budget_health_score?: number;
  days_until_wedding?: number;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface AIUserPreferences {
  id: string;
  wedding_id: string;
  enable_daily_briefing: boolean;
  enable_weekly_briefing: boolean;
  enable_urgent_alerts: boolean;
  enable_budget_alerts: boolean;
  preferred_notification_time: string;
  notification_frequency: 'minimal' | 'balanced' | 'detailed';
  suggestion_aggressiveness: 'conservative' | 'moderate' | 'proactive';
  auto_dismiss_old_suggestions: boolean;
  created_at: string;
  updated_at?: string;
}

export interface WeddingAnalysis {
  wedding_id: string;
  days_until_wedding: number;
  wedding_date: string;
  tasks: {
    total: number;
    completed: number;
    completion_rate: number;
    overdue: number;
    high_priority_pending: number;
  };
  budget: {
    total_allocated: number;
    total_spent: number;
    usage_percent: number;
    remaining: number;
    overspending_categories: number;
    at_risk_categories: number;
  };
}

export interface AIDashboard {
  analysis: WeddingAnalysis;
  active_suggestions: AISuggestion[];
  latest_briefing?: AIBriefing;
  preferences?: AIUserPreferences;
}

class AIAssistantAPI {
  private async fetchAPI(endpoint: string, options?: RequestInit) {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || error.message || 'Request failed');
    }

    return response.json();
  }

  async getAnalysis(weddingId: string): Promise<{ success: boolean; data: WeddingAnalysis }> {
    return this.fetchAPI(`/api/v1/ai/analysis/${weddingId}`);
  }

  async getDashboard(weddingId: string): Promise<{ success: boolean; data: AIDashboard }> {
    return this.fetchAPI(`/api/v1/ai/dashboard/${weddingId}`);
  }

  async generateSuggestions(weddingId: string): Promise<{ success: boolean; data: AISuggestion[] }> {
    return this.fetchAPI(`/api/v1/ai/suggestions/${weddingId}`, {
      method: 'POST',
    });
  }

  async getActiveSuggestions(weddingId: string, limit: number = 10): Promise<{ success: boolean; count: number; data: AISuggestion[] }> {
    return this.fetchAPI(`/api/v1/ai/suggestions/${weddingId}?limit=${limit}`);
  }

  async respondToSuggestion(
    suggestionId: string,
    response: 'accepted' | 'ignored' | 'postponed' | 'dismissed',
    feedback?: string
  ): Promise<{ success: boolean; data: AISuggestion }> {
    return this.fetchAPI(`/api/v1/ai/suggestions/${suggestionId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response, feedback }),
    });
  }

  async generateDailyBriefing(weddingId: string): Promise<{ success: boolean; data: AIBriefing }> {
    return this.fetchAPI(`/api/v1/ai/briefing/daily/${weddingId}`, {
      method: 'POST',
    });
  }

  async generateWeeklyBriefing(weddingId: string): Promise<{ success: boolean; data: AIBriefing }> {
    return this.fetchAPI(`/api/v1/ai/briefing/weekly/${weddingId}`, {
      method: 'POST',
    });
  }

  async getBriefings(
    weddingId: string,
    briefingType?: 'daily' | 'weekly',
    limit: number = 5
  ): Promise<{ success: boolean; count: number; data: AIBriefing[] }> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (briefingType) params.append('briefing_type', briefingType);
    
    return this.fetchAPI(`/api/v1/ai/briefings/${weddingId}?${params}`);
  }

  async markBriefingRead(briefingId: string): Promise<{ success: boolean; data: AIBriefing }> {
    return this.fetchAPI(`/api/v1/ai/briefings/${briefingId}/read`, {
      method: 'POST',
    });
  }

  async getPreferences(weddingId: string): Promise<{ success: boolean; data: AIUserPreferences }> {
    return this.fetchAPI(`/api/v1/ai/preferences/${weddingId}`);
  }

  async updatePreferences(
    weddingId: string,
    preferences: Partial<Omit<AIUserPreferences, 'id' | 'wedding_id' | 'created_at' | 'updated_at'>>
  ): Promise<{ success: boolean; data: AIUserPreferences }> {
    return this.fetchAPI(`/api/v1/ai/preferences/${weddingId}`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }
}

export const aiAssistantAPI = new AIAssistantAPI();
