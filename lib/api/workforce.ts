/**
 * Workforce & Event-Based Payroll API client
 */
import { axiosInstance } from "@/lib/api-client"

const BASE = "/api/v1/provider/workforce"

export const workforceApi = {
  dashboard: () => axiosInstance.get(`${BASE}/dashboard`),

  listWorkers: (params?: Record<string, string | number | boolean | undefined>) =>
    axiosInstance.get(`${BASE}/workers`, { params }),
  createWorker: (data: Record<string, unknown>) => axiosInstance.post(`${BASE}/workers`, data),
  getWorker: (id: string) => axiosInstance.get(`${BASE}/workers/${id}`),
  updateWorker: (id: string, data: Record<string, unknown>) => axiosInstance.put(`${BASE}/workers/${id}`, data),
  deleteWorker: (id: string) => axiosInstance.delete(`${BASE}/workers/${id}`),

  listTeams: () => axiosInstance.get(`${BASE}/teams`),
  createTeam: (data: Record<string, unknown>) => axiosInstance.post(`${BASE}/teams`, data),
  updateTeam: (id: string, data: Record<string, unknown>) => axiosInstance.put(`${BASE}/teams/${id}`, data),
  deleteTeam: (id: string) => axiosInstance.delete(`${BASE}/teams/${id}`),

  listEvents: (params?: Record<string, string | number | undefined>) =>
    axiosInstance.get(`${BASE}/events`, { params }),
  getEvent: (id: string) => axiosInstance.get(`${BASE}/events/${id}`),
  assignLeader: (eventId: string, data: Record<string, unknown>) =>
    axiosInstance.post(`${BASE}/events/${eventId}/assign-leader`, data),
  assignWorkers: (eventId: string, data: Record<string, unknown>) =>
    axiosInstance.post(`${BASE}/events/${eventId}/assign-workers`, data),
  removeAssignment: (eventId: string, workerId: string, reason?: string) =>
    axiosInstance.post(`${BASE}/events/${eventId}/assignments/${workerId}/remove`, { reason }),
  updateEventCosts: (eventId: string, data: Record<string, unknown>) =>
    axiosInstance.patch(`${BASE}/events/${eventId}/costs`, data),

  recordAttendance: (eventId: string, records: unknown[]) =>
    axiosInstance.post(`${BASE}/events/${eventId}/attendance`, { records }),
  submitAttendance: (eventId: string) =>
    axiosInstance.post(`${BASE}/events/${eventId}/attendance/submit`, {}),

  listPayroll: (params?: Record<string, string | number | undefined>) =>
    axiosInstance.get(`${BASE}/payroll`, { params }),
  getPayroll: (id: string) => axiosInstance.get(`${BASE}/payroll/${id}`),
  generatePayroll: (eventId: string) =>
    axiosInstance.post(`${BASE}/events/${eventId}/payroll/generate`, {}),
  recommendPayroll: (id: string) => axiosInstance.post(`${BASE}/payroll/${id}/recommend`, {}),
  approvePayroll: (id: string) => axiosInstance.post(`${BASE}/payroll/${id}/approve`, {}),
  markPayrollPaid: (id: string, payment_refs?: Record<string, string>) =>
    axiosInstance.post(`${BASE}/payroll/${id}/mark-paid`, { payment_refs }),

  listRoleRates: () => axiosInstance.get(`${BASE}/role-rates`),
  upsertRoleRate: (data: Record<string, unknown>) => axiosInstance.post(`${BASE}/role-rates`, data),
  listCommissionPlans: () => axiosInstance.get(`${BASE}/commission-plans`),
  createCommissionPlan: (data: Record<string, unknown>) =>
    axiosInstance.post(`${BASE}/commission-plans`, data),

  listLeave: (status?: string) =>
    axiosInstance.get(`${BASE}/leave`, { params: status ? { status } : undefined }),
  createLeave: (data: Record<string, unknown>) => axiosInstance.post(`${BASE}/leave`, data),
  reviewLeave: (id: string, approve: boolean, notes?: string) =>
    axiosInstance.post(`${BASE}/leave/${id}/review`, { approve, notes }),

  listDocuments: (workerId?: string) =>
    axiosInstance.get(`${BASE}/documents`, { params: workerId ? { worker_id: workerId } : undefined }),
  createDocument: (data: Record<string, unknown>) => axiosInstance.post(`${BASE}/documents`, data),

  listPerformance: (workerId?: string) =>
    axiosInstance.get(`${BASE}/performance`, { params: workerId ? { worker_id: workerId } : undefined }),
  createPerformance: (data: Record<string, unknown>) =>
    axiosInstance.post(`${BASE}/performance`, data),

  getSettings: () => axiosInstance.get(`${BASE}/settings`),
  updateSettings: (data: Record<string, unknown>) => axiosInstance.put(`${BASE}/settings`, data),

  getReport: (reportType: string, format = "json") =>
    axiosInstance.get(`${BASE}/reports/${reportType}`, { params: { format } }),
}
