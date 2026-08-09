/**
 * Excel template + parse helpers for workforce bulk import.
 */
import * as XLSX from "xlsx"

export type WorkerDraftRow = {
  _key: string
  full_name: string
  employee_code: string
  gender: string
  phone: string
  email: string
  address: string
  national_id: string
  emergency_contact_name: string
  emergency_contact_phone: string
  employment_type: string
  department: string
  position: string
  skills: string
  hire_date: string
  hourly_rate: string
  event_rate: string
  payment_model: string
  mobile_money: string
  bank_details: string
  notes: string
}

export const WORKER_EXCEL_HEADERS = [
  "full_name",
  "employee_code",
  "gender",
  "phone",
  "email",
  "address",
  "national_id",
  "emergency_contact_name",
  "emergency_contact_phone",
  "employment_type",
  "department",
  "position",
  "skills",
  "hire_date",
  "hourly_rate",
  "event_rate",
  "payment_model",
  "mobile_money",
  "bank_details",
  "notes",
] as const

const HEADER_ALIASES: Record<string, keyof WorkerDraftRow> = {
  full_name: "full_name",
  "full name": "full_name",
  name: "full_name",
  employee_code: "employee_code",
  "employee code": "employee_code",
  "employee id": "employee_code",
  code: "employee_code",
  gender: "gender",
  phone: "phone",
  "phone number": "phone",
  mobile: "phone",
  email: "email",
  "e-mail": "email",
  address: "address",
  national_id: "national_id",
  "national id": "national_id",
  nid: "national_id",
  emergency_contact_name: "emergency_contact_name",
  "emergency contact name": "emergency_contact_name",
  "emergency name": "emergency_contact_name",
  emergency_contact_phone: "emergency_contact_phone",
  "emergency contact phone": "emergency_contact_phone",
  "emergency phone": "emergency_contact_phone",
  employment_type: "employment_type",
  "employment type": "employment_type",
  type: "employment_type",
  department: "department",
  position: "position",
  role: "position",
  skills: "skills",
  hire_date: "hire_date",
  "hire date": "hire_date",
  hourly_rate: "hourly_rate",
  "hourly rate": "hourly_rate",
  event_rate: "event_rate",
  "event rate": "event_rate",
  payment_model: "payment_model",
  "payment model": "payment_model",
  mobile_money: "mobile_money",
  "mobile money": "mobile_money",
  momo: "mobile_money",
  bank_details: "bank_details",
  "bank details": "bank_details",
  bank: "bank_details",
  notes: "notes",
}

function emptyRow(defaults?: Partial<WorkerDraftRow>): WorkerDraftRow {
  return {
    _key: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    full_name: "",
    employee_code: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    national_id: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    employment_type: "",
    department: "",
    position: "",
    skills: "",
    hire_date: "",
    hourly_rate: "",
    event_rate: "",
    payment_model: "fixed_per_event",
    mobile_money: "",
    bank_details: "",
    notes: "",
    ...defaults,
  }
}

function cellToString(value: unknown): string {
  if (value == null || value === "") return ""
  if (value instanceof Date) {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, "0")
    const d = String(value.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }
  return String(value).trim()
}

function normalizeHeader(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
}

export function createEmptyWorkerDraft(defaults?: Partial<WorkerDraftRow>): WorkerDraftRow {
  return emptyRow(defaults)
}

export function downloadWorkerTemplate(mode: "employees" | "freelancers") {
  const defaultType = mode === "employees" ? "permanent" : "freelancer"
  const sampleRows = [
    {
      full_name: "Jane Uwase",
      employee_code: "W-001",
      gender: "female",
      phone: "0780000001",
      email: "jane@example.com",
      address: "Kigali",
      national_id: "",
      emergency_contact_name: "John Doe",
      emergency_contact_phone: "0780000002",
      employment_type: defaultType,
      department: "Operations",
      position: "Lead Dancer",
      skills: "dance, choreography",
      hire_date: "2025-01-15",
      hourly_rate: 5000,
      event_rate: 35000,
      payment_model: "fixed_per_event",
      mobile_money: "0780000001",
      bank_details: "",
      notes: "Sample row — replace with real data",
    },
    {
      full_name: "Eric Mugisha",
      employee_code: "W-002",
      gender: "male",
      phone: "0780000003",
      email: "eric@example.com",
      address: "Musanze",
      national_id: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      employment_type: defaultType === "permanent" ? "seasonal" : "contractor",
      department: "Operations",
      position: "Drummer",
      skills: "drums",
      hire_date: "",
      hourly_rate: 4000,
      event_rate: 30000,
      payment_model: "fixed_per_event",
      mobile_money: "0780000003",
      bank_details: "",
      notes: "",
    },
  ]

  const ws = XLSX.utils.json_to_sheet(sampleRows, { header: [...WORKER_EXCEL_HEADERS] })
  ws["!cols"] = WORKER_EXCEL_HEADERS.map((h) => ({ wch: Math.max(14, h.length + 2) }))

  const guide = XLSX.utils.aoa_to_sheet([
    ["Column", "Required", "Notes"],
    ["full_name", "Yes", "Worker full name"],
    ["employee_code", "No", "Unique code per provider; auto-generated if empty"],
    ["employment_type", "No", mode === "employees"
      ? "permanent | intern | seasonal"
      : "freelancer | contractor | volunteer"],
    ["skills", "No", "Comma-separated list"],
    ["hire_date", "No", "YYYY-MM-DD"],
    ["hourly_rate / event_rate", "No", "Numbers in RWF"],
    ["payment_model", "No", "fixed_per_event | hourly | daily | weekly | monthly | per_booking | commission_only | hybrid | custom"],
  ])

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Workers")
  XLSX.utils.book_append_sheet(wb, guide, "Instructions")
  XLSX.writeFile(wb, `workforce-${mode}-template.xlsx`)
}

export async function parseWorkerExcel(
  file: File,
  defaultEmploymentType: string
): Promise<WorkerDraftRow[]> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: "array", cellDates: true })
  const sheetName = wb.SheetNames.find((n) => n.toLowerCase() !== "instructions") || wb.SheetNames[0]
  if (!sheetName) throw new Error("Excel file has no sheets")

  const sheet = wb.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })
  if (!rows.length) throw new Error("No data rows found in the Excel file")

  const drafts: WorkerDraftRow[] = []
  for (const raw of rows) {
    const mapped = emptyRow({ employment_type: defaultEmploymentType })
    for (const [key, value] of Object.entries(raw)) {
      const field = HEADER_ALIASES[normalizeHeader(key)]
      if (!field || field === "_key") continue
      mapped[field] = cellToString(value)
    }
    if (!mapped.full_name.trim()) continue
    if (!mapped.employment_type) mapped.employment_type = defaultEmploymentType
    else mapped.employment_type = mapped.employment_type.toLowerCase()
    drafts.push(mapped)
  }

  if (!drafts.length) {
    throw new Error("No valid workers found. Ensure full_name is filled for each row.")
  }
  return drafts
}

export function draftToWorkerPayload(row: WorkerDraftRow): Record<string, unknown> {
  const skills = row.skills
    ? row.skills.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
    : []

  const payload: Record<string, unknown> = {
    full_name: row.full_name.trim(),
    employment_type: (row.employment_type || "freelancer").trim().toLowerCase(),
    payment_model: (row.payment_model || "fixed_per_event").trim().toLowerCase(),
    currency: "RWF",
  }

  const optionalStrings: (keyof WorkerDraftRow)[] = [
    "employee_code", "gender", "phone", "email", "address", "national_id",
    "emergency_contact_name", "emergency_contact_phone", "department", "position",
    "hire_date", "mobile_money", "bank_details", "notes",
  ]
  for (const key of optionalStrings) {
    const v = String(row[key] || "").trim()
    if (v) payload[key] = v
  }
  if (skills.length) payload.skills = skills
  if (row.hourly_rate !== "" && !Number.isNaN(Number(row.hourly_rate))) {
    payload.hourly_rate = Number(row.hourly_rate)
  }
  if (row.event_rate !== "" && !Number.isNaN(Number(row.event_rate))) {
    payload.event_rate = Number(row.event_rate)
  }
  return payload
}
