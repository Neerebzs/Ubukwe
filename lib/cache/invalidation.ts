/**
 * Centralized cache invalidation helpers.
 *
 * WHY: Instead of scattering queryClient.invalidateQueries() calls across
 * every mutation's onSuccess handler, we define invalidation groups here.
 * When the backend data for a domain changes, call the corresponding helper.
 *
 * This means:
 *  - Adding a new cache key only requires updating query-keys.ts + this file
 *  - Mutation handlers stay clean — one helper call, no key guessing
 *
 * USAGE:
 *   import { invalidateBookings } from '@/lib/cache/invalidation'
 *
 *   useMutation({
 *     mutationFn: bookingApi.confirm,
 *     onSuccess: (_, bookingId) => {
 *       invalidateBookings(queryClient, bookingId)
 *     },
 *   })
 */

import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';

// ── Bookings ─────────────────────────────────────────────────────────────────

/**
 * Call after: create, confirm, cancel, complete a booking.
 * Invalidates both the list and the specific booking detail.
 */
export function invalidateBookings(queryClient: QueryClient, bookingId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
  if (bookingId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(bookingId) });
  }
  // Booking changes affect provider stats
  queryClient.invalidateQueries({ queryKey: queryKeys.bookings.providerStats() });
}

// ── Contracts ────────────────────────────────────────────────────────────────

/**
 * Call after: create, update, send, sign a contract.
 */
export function invalidateContracts(queryClient: QueryClient, contractId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all() });
  if (contractId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.contracts.detail(contractId) });
  }
}

// ── Quotes ───────────────────────────────────────────────────────────────────

/**
 * Call after: create, update, send, delete a quote.
 */
export function invalidateQuotes(queryClient: QueryClient, quoteId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all() });
  if (quoteId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.quotes.detail(quoteId) });
  }
}

// ── Disputes ─────────────────────────────────────────────────────────────────

/**
 * Call after: create, update, resolve, reject a dispute.
 */
export function invalidateDisputes(queryClient: QueryClient, disputeId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.disputes.all() });
  if (disputeId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.disputes.detail(disputeId) });
  }
  queryClient.invalidateQueries({ queryKey: queryKeys.disputes.adminStats() });
}

// ── Notifications ────────────────────────────────────────────────────────────

/**
 * Call after: mark as read, mark all as read.
 * Invalidates both the list and the unread count badge.
 */
export function invalidateNotifications(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
}

// ── Provider Services ────────────────────────────────────────────────────────

/**
 * Call after: create, update, delete, approve/reject a provider service.
 * Also invalidates the public-facing service lists so visitors see changes.
 */
export function invalidateProviderServices(queryClient: QueryClient, serviceId?: string) {
  // Provider's own service list
  queryClient.invalidateQueries({ queryKey: queryKeys.provider.services() });
  if (serviceId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.provider.serviceDetail(serviceId) });
  }
  // Public catalog — service changes should be visible immediately
  queryClient.invalidateQueries({ queryKey: queryKeys.public.services() });
  queryClient.invalidateQueries({ queryKey: queryKeys.public.popularServices() });
}

// ── Provider Profile ─────────────────────────────────────────────────────────

/**
 * Call after: onboarding submit, profile update, document upload.
 */
export function invalidateProviderProfile(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.provider.profile() });
  queryClient.invalidateQueries({ queryKey: queryKeys.provider.onboardingStatus() });
  queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
}

// ── Provider Earnings ────────────────────────────────────────────────────────

/**
 * Call after: booking payment confirmed, withdrawal requested.
 */
export function invalidateEarnings(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.provider.earnings.summary() });
  queryClient.invalidateQueries({ queryKey: queryKeys.provider.earnings.details() });
  queryClient.invalidateQueries({ queryKey: queryKeys.provider.earnings.payments() });
}

// ── Wedding / Planning ───────────────────────────────────────────────────────

/**
 * Call after: create/update wedding, change date or budget.
 */
export function invalidateWedding(queryClient: QueryClient, weddingId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.wedding.mine() });
  if (weddingId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.statistics(weddingId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.dashboardSummary(weddingId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.budgetCategories(weddingId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.budgetStatistics(weddingId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.categoryInsights(weddingId) });
  }
}

/**
 * Call after: create, update, complete, delete a wedding task.
 */
export function invalidateTasks(queryClient: QueryClient, weddingId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.wedding.tasks() });
  queryClient.invalidateQueries({ queryKey: queryKeys.wedding.taskStats() });
  if (weddingId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.statistics(weddingId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.dashboardSummary(weddingId) });
  }
}

/**
 * Call after: create/update/delete a budget category or redistribute budget.
 */
export function invalidateBudget(queryClient: QueryClient, weddingId: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.wedding.budgetCategories(weddingId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.wedding.budgetStatistics(weddingId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.wedding.categoryInsights(weddingId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.wedding.dashboardSummary(weddingId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.wedding.statistics(weddingId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.wedding.mine() });
}

// ── Events (provider-owned) ──────────────────────────────────────────────────

/**
 * Call after: create, update, publish, cancel, delete an event.
 */
export function invalidateEvents(queryClient: QueryClient, eventId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.events.all() });
  if (eventId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.events.analytics(eventId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.events.ticketTypes(eventId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.events.tickets(eventId) });
  }
  // Approved events appear in the public events list
  queryClient.invalidateQueries({ queryKey: queryKeys.public.events() });
}

// ── Admin ────────────────────────────────────────────────────────────────────

/**
 * Call after: approve/reject/suspend a provider.
 */
export function invalidateAdminProviders(queryClient: QueryClient, providerId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers() });
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.onboarding() });
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.onboardingStats() });
  if (providerId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.providerDetail(providerId) });
  }
  // Provider approval changes the public service catalog
  queryClient.invalidateQueries({ queryKey: queryKeys.public.services() });
  queryClient.invalidateQueries({ queryKey: queryKeys.public.popularServices() });
}

/**
 * Call after: suspend/activate/delete a user.
 */
export function invalidateAdminUsers(queryClient: QueryClient, userId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
  if (userId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.userDetail(userId) });
  }
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
}

/**
 * Call after: update system settings (logo, hero image, contact info).
 * Busts both the admin view and the public-facing system settings cache.
 */
export function invalidateSystemSettings(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.systemSettings() });
  queryClient.invalidateQueries({ queryKey: queryKeys.public.systemSettings() });
}

/**
 * Call after: create, update, delete, reorder a service category.
 * Busts both the admin categories list and the public categories used in filters.
 */
export function invalidateCategories(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories() });
  queryClient.invalidateQueries({ queryKey: queryKeys.public.categories() });
}

// ── Payments ─────────────────────────────────────────────────────────────────

/**
 * Call after: payment verified/failed.
 */
export function invalidatePayments(queryClient: QueryClient, paymentId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.payments.all() });
  if (paymentId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.payments.detail(paymentId) });
  }
  // Payment confirmation affects booking status
  queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
  invalidateEarnings(queryClient);
}

// ── Messages ─────────────────────────────────────────────────────────────────

/**
 * Call after: send a message (supplements the WebSocket append).
 */
export function invalidateMessages(queryClient: QueryClient, userId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversations() });
  if (userId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.messages.history(userId) });
  }
  queryClient.invalidateQueries({ queryKey: queryKeys.messages.unreadCount() });
}

// ── Reviews ──────────────────────────────────────────────────────────────────

/**
 * Call after: create, update, delete, feature a review.
 */
export function invalidateReviews(queryClient: QueryClient, serviceId?: string, userId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.reviews.mine() });
  if (serviceId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byService(serviceId) });
  }
  if (userId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byUser(userId) });
  }
}

// ── Tickets ──────────────────────────────────────────────────────────────────

/**
 * Call after: purchase tickets, check in.
 */
export function invalidateTickets(queryClient: QueryClient, ticketId?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.tickets.mine() });
  if (ticketId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(ticketId) });
  }
}
