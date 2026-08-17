export const DISPUTE_CATEGORIES = [
  { value: "service_not_delivered", label: "Service Not Delivered" },
  { value: "poor_service_quality", label: "Poor Service Quality" },
  { value: "payment_issue", label: "Payment Issue" },
  { value: "refund_issue", label: "Refund Issue" },
  { value: "cancellation_issue", label: "Cancellation Issue" },
  { value: "contract_issue", label: "Contract Issue" },
  { value: "misrepresentation", label: "Misrepresentation" },
  { value: "late_delivery", label: "Late Delivery" },
  { value: "no_show", label: "No Show" },
  { value: "property_damage", label: "Property / Damage Issue" },
  { value: "other", label: "Other" },
] as const

export const REQUESTED_RESOLUTIONS = [
  { value: "full_refund", label: "Full refund" },
  { value: "partial_refund", label: "Partial refund" },
  { value: "service_completion", label: "Service completion" },
  { value: "replacement_service", label: "Replacement service" },
  { value: "payment_release", label: "Payment release" },
  { value: "cancellation", label: "Cancellation" },
  { value: "other", label: "Other" },
] as const

export const RESOLUTION_TYPES = [
  { value: "full_refund", label: "Full refund" },
  { value: "partial_refund", label: "Partial refund" },
  { value: "credit", label: "Credit" },
  { value: "service_redelivery", label: "Service redelivery" },
  { value: "service_correction", label: "Service correction" },
  { value: "payment_release", label: "Payment release" },
  { value: "booking_cancellation", label: "Booking cancellation" },
  { value: "mutual_agreement", label: "Mutual agreement" },
  { value: "no_action", label: "No action" },
  { value: "other", label: "Other" },
] as const

export const CLOSED_STATUSES = new Set(["resolved", "rejected", "closed", "withdrawn"])

export const STATUS_LABELS: Record<string, string> = {
  open: "Awaiting Review",
  under_review: "Under Review",
  investigating: "Under Investigation",
  awaiting_respondent: "Awaiting Respondent",
  awaiting_complainant: "Awaiting Your Response",
  evidence_review: "Evidence Review",
  mediation: "Mediation",
  decision_pending: "Decision Pending",
  resolved: "Resolved",
  rejected: "Rejected",
  closed: "Closed",
  escalated: "Escalated",
  withdrawn: "Withdrawn",
}

export const STATUS_CLASSES: Record<string, string> = {
  open: "bg-slate-50 text-slate-600 border-slate-100",
  under_review: "bg-blue-50 text-blue-700 border-blue-100",
  investigating: "bg-amber-50 text-amber-700 border-amber-100",
  awaiting_respondent: "bg-orange-50 text-orange-700 border-orange-100",
  awaiting_complainant: "bg-orange-50 text-orange-700 border-orange-100",
  evidence_review: "bg-indigo-50 text-indigo-700 border-indigo-100",
  mediation: "bg-violet-50 text-violet-700 border-violet-100",
  decision_pending: "bg-cyan-50 text-cyan-700 border-cyan-100",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-rose-50 text-rose-700 border-rose-100",
  closed: "bg-slate-100 text-slate-500 border-slate-200",
  escalated: "bg-red-50 text-red-700 border-red-100",
  withdrawn: "bg-slate-50 text-slate-500 border-slate-100",
}

export const PRIORITY_CLASSES: Record<string, string> = {
  urgent: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  low: "bg-slate-50 text-slate-600 border-slate-100",
}

export const TIMELINE_LABELS: Record<string, string> = {
  created: "Dispute created",
  assigned: "Assigned to moderator",
  status_changed: "Status changed",
  priority_changed: "Priority changed",
  evidence_submitted: "Evidence submitted",
  evidence_reviewed: "Evidence reviewed",
  evidence_rejected: "Evidence rejected",
  message_sent: "Message sent",
  internal_note_added: "Internal note added",
  information_requested: "Information requested",
  mediation_started: "Mediation started",
  decision_created: "Resolution issued",
  decision_modified: "Decision modified",
  appeal_submitted: "Appeal submitted",
  appeal_reviewed: "Appeal reviewed",
  closed: "Dispute closed",
  reopened: "Dispute reopened",
  escalated: "Dispute escalated",
  withdrawn: "Dispute withdrawn",
}

export function categoryLabel(value?: string) {
  return DISPUTE_CATEGORIES.find((item) => item.value === value)?.label || value?.replace(/_/g, " ") || "Issue"
}

export function formatMoney(amount?: number | null, currency = "RWF") {
  if (amount == null) return "—"
  return `${Number(amount).toLocaleString()} ${currency}`
}

export function disputeRef(dispute: { reference_number?: string; id: string }) {
  return dispute.reference_number || `DSP-${dispute.id.slice(0, 8).toUpperCase()}`
}
