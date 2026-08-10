/**
 * Public team-leader portal API (token auth, no provider login).
 */
import axios from "axios"

const rawBaseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:4000").trim()
const baseUrl = rawBaseUrl.startsWith("http") ? rawBaseUrl : `https://${rawBaseUrl}`
const API_BASE = `${baseUrl.replace(/\/+$/, "").replace(/\/api\/v1$/, "")}/api/v1/public/workforce/leader`

const publicClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
})

export const workforceLeaderPublicApi = {
  getEvent: (token: string) =>
    publicClient.get("/event", { params: { token } }),

  listWorkers: (token: string, search?: string) =>
    publicClient.get("/workers", { params: { token, search: search || undefined } }),

  assignWorkers: (token: string, workers: { worker_id: string; role_label?: string }[]) =>
    publicClient.post("/assign-workers", { token, workers }),

  recordAttendance: (
    token: string,
    records: { worker_id: string; status: string; hours_worked?: number; overtime_hours?: number; incident_notes?: string }[]
  ) => publicClient.post("/attendance", { token, records }),

  submitAttendance: (token: string) =>
    publicClient.post("/attendance/submit", { token }),
}
