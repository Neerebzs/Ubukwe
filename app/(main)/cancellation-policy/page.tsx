"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, CalendarX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSystemSettings } from "@/contexts/system-settings-context"

const cancellationTiers = [
    { timing: "30+ days before event", refund: "100% minus 10% platform commission", example: "90,000 RWF" },
    { timing: "15–29 days before event", refund: "50% of booking amount", example: "50,000 RWF" },
    { timing: "7–14 days before event", refund: "25% of booking amount", example: "25,000 RWF" },
    { timing: "Less than 7 days before event", refund: "No refund", example: "0 RWF" },
    { timing: "After event date", refund: "No refund", example: "0 RWF" },
]

export default function CancellationPolicyPage() {
    const { settings } = useSystemSettings()
    const address = [settings.contactLocationLine1, settings.contactLocationLine2].filter(Boolean).join(", ")
    return (
        <div className="min-h-screen bg-[#FCFBF9] text-slate-900 pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-100 pt-28 pb-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

                <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-4xl">
                    <Link href="/">
                        <Button variant="ghost" className="mb-8 rounded-full bg-slate-50 hover:bg-slate-900 hover:text-white transition-all gap-2 px-5 h-10">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="font-bold text-[10px] uppercase tracking-widest">Back to Home</span>
                        </Button>
                    </Link>

                    <div className="flex items-center gap-3 mb-6">
                        <CalendarX className="h-5 w-5 text-[#668c65]" />
                        <span className="text-[#668c65] font-bold tracking-[0.4em] uppercase text-[10px]">Booking Terms</span>
                    </div>

                    <h1 className="font-serif text-5xl md:text-6xl text-slate-900 leading-[1.1] mb-6">
                        Cancellation <span className="italic font-light text-[#668c65]">Policy</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-light max-w-2xl">
                        This policy governs how bookings made through the VowNest platform may be cancelled or rescheduled, by customers and by service providers.
                    </p>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-8">
                        Last Updated: June 2026
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-6 md:px-12 max-w-4xl pt-16">
                <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl shadow-slate-100 border border-slate-50 relative">
                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-8">

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-sm">1</span>
                                Overview
                            </h2>
                            <p>
                                VowNest, operated by <strong>Neere Business Group Ltd</strong>, balances the interests of customers (event organizers) and service providers (vendors) when a booking is cancelled. Customers may cancel a booking at any time before the scheduled event date; the refund amount depends on the timing of the cancellation, as described below and in our <Link href="/refund-policy" className="text-[#668c65] font-semibold hover:underline">Refund Policy</Link>.
                            </p>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-sm">2</span>
                                Customer Cancellations
                            </h2>
                            <div className="mt-2 overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-[#668c65]/20 text-left">
                                            <th className="py-3 pr-4 font-bold text-slate-900">Cancellation Timing</th>
                                            <th className="py-3 pr-4 font-bold text-slate-900">Refund Amount</th>
                                            <th className="py-3 font-bold text-slate-900">Example (100,000 RWF)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cancellationTiers.map((tier) => (
                                            <tr key={tier.timing} className="border-b border-slate-100">
                                                <td className="py-3 pr-4">{tier.timing}</td>
                                                <td className="py-3 pr-4">{tier.refund}</td>
                                                <td className="py-3">{tier.example}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-4">
                                <strong>To cancel:</strong> log into your account, open <strong>My Bookings</strong>, select the booking, choose <strong>Cancel Booking</strong>, review the refund amount shown for your cancellation date, and confirm. The service provider is notified immediately and your refund is processed according to the Refund Policy.
                            </p>
                            <ul className="list-disc pl-5 mt-4 space-y-2">
                                <li>Cancellations must be submitted before 11:59 PM (Rwanda Time) to count as that day.</li>
                                <li>Days are counted to the scheduled event date; the event date itself is not included. Weekends and public holidays count as regular days.</li>
                                <li>For bookings with multiple services, you may cancel individual services — each refund is calculated per service based on its cancellation timing.</li>
                            </ul>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-sm">3</span>
                                Service Provider Cancellations
                            </h2>
                            <p>
                                Service providers are expected to honor all confirmed bookings. A provider may cancel only for force majeure (serious illness, natural disaster, government restrictions), customer breach (false information, harassment, safety concerns), or documented technical/operational emergencies — and must contact platform support with evidence.
                            </p>
                            <p className="mt-4">
                                <strong>If a provider cancels or fails to show up, the customer receives a 100% refund, including the platform commission</strong>, and the platform assists in finding an alternative provider. Providers face escalating penalties for cancellations — from a formal warning, to account suspension and reduced search visibility, up to permanent termination for repeated cancellations within 12 months.
                            </p>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-sm">4</span>
                                Rescheduling
                            </h2>
                            <ul className="list-disc pl-5 mt-4 space-y-2">
                                <li><strong>Free rescheduling:</strong> once per booking, when requested 30+ days before the original event date, for a new date within 12 months — subject to provider availability.</li>
                                <li><strong>Paid rescheduling:</strong> second or subsequent requests incur a fee of 10% of the booking amount and must be made 14+ days before the event date.</li>
                                <li><strong>Less than 14 days before the event:</strong> rescheduling is not available — the cancellation policy applies instead.</li>
                                <li><strong>Mutual agreement:</strong> if both parties agree to a new date, no fees or penalties apply and the original payment remains valid.</li>
                                <li><strong>Wedding postponements:</strong> free rescheduling with 60+ days notice; if the provider is unavailable for the new date, a full refund is issued.</li>
                            </ul>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-sm">5</span>
                                No-Shows
                            </h2>
                            <ul className="list-disc pl-5 mt-4 space-y-2">
                                <li><strong>Customer no-show:</strong> no refund is issued and the provider receives their payment — except for documented medical emergencies, force majeure, or where the provider failed to communicate essential details.</li>
                                <li><strong>Provider no-show:</strong> the customer receives a 100% refund including commission, and the provider's account is immediately suspended and may be permanently banned.</li>
                            </ul>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-sm">6</span>
                                Force Majeure
                            </h2>
                            <p>
                                When events beyond reasonable control (natural disasters, pandemics, government restrictions, civil unrest) prevent a booking from going ahead, the affected party must notify the other immediately and provide documentation. Resolution options include rescheduling with no fees, a full refund including commission, platform credit valid for 24 months, or a partial refund combined with rescheduling. The platform makes the final, binding decision considering both parties' interests.
                            </p>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-sm">7</span>
                                Disputes & Contact
                            </h2>
                            <p>
                                Disputed cancellations go through internal review (3–5 business days), mediation between the parties, and a final binding decision within 10 business days. Appeals may be submitted within 7 days of a decision.
                            </p>
                            <ul className="list-none pl-0 mt-4 space-y-2">
                                <li><strong>Company:</strong> Neere Business Group Ltd (operating VowNest)</li>
                                {settings.contactEmail && <li><strong>Email:</strong> {settings.contactEmail}</li>}
                                {settings.contactPhone && <li><strong>Phone:</strong> {settings.contactPhone}</li>}
                                {address && <li><strong>Address:</strong> {address}</li>}
                                <li><strong>Hours:</strong> Monday–Friday 8:00 AM – 6:00 PM, Saturday 9:00 AM – 3:00 PM (Rwanda Time)</li>
                            </ul>
                            <p className="mt-4">
                                See also our <Link href="/refund-policy" className="text-[#668c65] font-semibold hover:underline">Refund Policy</Link> and <Link href="/terms" className="text-[#668c65] font-semibold hover:underline">Terms of Service</Link>.
                            </p>
                        </section>

                    </div>
                </div>
            </div>

        </div>
    )
}
