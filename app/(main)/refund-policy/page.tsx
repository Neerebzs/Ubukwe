import React from "react"
import Link from "next/link"
import { ArrowLeft, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

const refundTiers = [
    { timing: "30+ days before event", refund: "100% minus 10% platform commission", example: "90,000 RWF" },
    { timing: "15–29 days before event", refund: "50% of booking amount", example: "50,000 RWF" },
    { timing: "7–14 days before event", refund: "25% of booking amount", example: "25,000 RWF" },
    { timing: "Less than 7 days before event", refund: "No refund", example: "0 RWF" },
]

export default function RefundPolicyPage() {
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
                        <RotateCcw className="h-5 w-5 text-[#668c65]" />
                        <span className="text-[#668c65] font-bold tracking-[0.4em] uppercase text-[10px]">Customer Protection</span>
                    </div>

                    <h1 className="font-serif text-5xl md:text-6xl text-slate-900 leading-[1.1] mb-6">
                        Refund <span className="italic font-light text-[#668c65]">Policy</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-light max-w-2xl">
                        This policy explains when and how refunds are issued for bookings and payments made on the VowNest platform.
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
                                VowNest, operated by <strong>Neere Business Group Ltd</strong>, is an online marketplace connecting customers with wedding and event service providers in Rwanda. All payments on the platform are collected by Neere Business Group Ltd and processed securely through our payment partner, <strong>DPO Pay</strong> (cards and mobile money).
                            </p>
                            <p className="mt-4">
                                <strong>Refunds are issued by the platform</strong>, not by individual service providers. When a refund is approved, Neere Business Group Ltd returns the funds to your original payment method via DPO Pay. Where a service provider's portion of a payment has already been disbursed, the platform recovers that amount from the provider — this never affects your refund timeline.
                            </p>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-sm">2</span>
                                When You Can Get a Refund
                            </h2>
                            <p>Refunds may be issued in the following circumstances:</p>
                            <ul className="list-disc pl-5 mt-4 space-y-2">
                                <li><strong>Customer cancellation</strong> made within the eligible timeframes below.</li>
                                <li><strong>Service provider cancellation</strong> or failure to show up — you receive a 100% refund, including the platform commission.</li>
                                <li><strong>Service not delivered as described</strong> — the service significantly differs from the listing, or quality falls substantially below professional standards.</li>
                                <li><strong>Payment processing errors</strong> — duplicate charges, incorrect amounts, or technical errors during payment.</li>
                                <li><strong>Force majeure events</strong> — natural disasters, government restrictions, or other circumstances beyond reasonable control.</li>
                            </ul>
                            <p className="mt-4">The following are <strong>not</strong> eligible for refunds:</p>
                            <ul className="list-disc pl-5 mt-4 space-y-2">
                                <li>The 10% platform commission (except for provider no-shows, force majeure, and platform technical errors, where it is also refunded).</li>
                                <li>Services that have been fully delivered as described.</li>
                                <li>Cancellations made outside the eligible timeframe.</li>
                                <li>Dissatisfaction based on subjective preferences when the service was delivered as described.</li>
                                <li>Bookings where the event has already occurred, or customer no-shows.</li>
                            </ul>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-sm">3</span>
                                Refund Amounts
                            </h2>
                            <p>
                                Refund amounts for customer cancellations depend on how far in advance of the event date you cancel. Days are counted from the date of the cancellation request to the scheduled event date (the event date itself is not included).
                            </p>
                            <div className="mt-6 overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-[#668c65]/20 text-left">
                                            <th className="py-3 pr-4 font-bold text-slate-900">Cancellation Timing</th>
                                            <th className="py-3 pr-4 font-bold text-slate-900">Refund Amount</th>
                                            <th className="py-3 font-bold text-slate-900">Example (100,000 RWF)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {refundTiers.map((tier) => (
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
                                A 100% refund (minus the platform commission) is also issued when a service is not delivered at all or when a payment processing error occurred. For partially delivered services, the refund is assessed based on the undelivered portion.
                            </p>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-sm">4</span>
                                How to Request a Refund
                            </h2>
                            <ul className="list-disc pl-5 mt-4 space-y-2">
                                <li>Log into your VowNest account, open <strong>My Bookings</strong>, select the relevant booking, and choose <strong>Request Cancellation/Refund</strong>, providing your reason.</li>
                                <li>Attach supporting evidence where applicable (photos, communications, documentation for force majeure).</li>
                                <li>Our team reviews standard requests within <strong>3–5 business days</strong> (complex cases up to 10, disputes up to 14). We may contact you or the service provider for more information.</li>
                                <li>You will be notified of the decision by email. Denied requests include an explanation and the option to appeal.</li>
                                <li>You can also email <strong>vownest@zohomail.com</strong> with your booking reference, event date, and reason.</li>
                            </ul>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-sm">5</span>
                                Refund Method & Processing Times
                            </h2>
                            <p>
                                Approved refunds are returned to the <strong>original payment method</strong> used for the booking:
                            </p>
                            <ul className="list-disc pl-5 mt-4 space-y-2">
                                <li><strong>Mobile Money (MTN MoMo / Airtel Money):</strong> processed within 1–3 business days; funds appear immediately after processing.</li>
                                <li><strong>Credit/Debit Card (via DPO Pay):</strong> processed within 5–7 business days; funds appear in your account within 7–14 business days depending on your bank.</li>
                                <li><strong>Bank Transfer:</strong> processed within 3–5 business days; funds appear within 5–10 business days.</li>
                            </ul>
                            <p className="mt-4">
                                Refunds may occasionally be delayed by bank processing times, public holidays, incomplete information, or ongoing disputes. If your original payment method is no longer available, contact support to arrange an alternative after identity verification.
                            </p>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-sm">6</span>
                                Disputes & Special Circumstances
                            </h2>
                            <p>
                                If you believe a refund was incorrectly denied, you may appeal through the platform. Appeals go through internal review, mediation between you and the service provider, and a final binding decision by senior management within 14 business days.
                            </p>
                            <ul className="list-disc pl-5 mt-4 space-y-2">
                                <li><strong>Force majeure:</strong> handled case by case — options include a full refund (commission included), rescheduling without penalty, or platform credit valid for 24 months.</li>
                                <li><strong>Provider closure:</strong> if a service provider goes out of business, customers receive a full refund for undelivered services — the platform absorbs the provider's portion if necessary.</li>
                                <li><strong>Platform technical issues:</strong> if a platform error prevents service delivery, a full refund including commission is issued immediately.</li>
                            </ul>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-sm">7</span>
                                Contact Us
                            </h2>
                            <p>For refund-related inquiries:</p>
                            <ul className="list-none pl-0 mt-4 space-y-2">
                                <li><strong>Company:</strong> Neere Business Group Ltd (operating VowNest)</li>
                                <li><strong>Email:</strong> vownest@zohomail.com</li>
                                <li><strong>Phone:</strong> +250 791 287 640</li>
                                <li><strong>Address:</strong> Muhabura Building, KN 7 Ave, Kigali, Rwanda</li>
                                <li><strong>Hours:</strong> Monday–Friday, 8:00 AM – 6:00 PM (Rwanda Time)</li>
                            </ul>
                            <p className="mt-4">
                                See also our <Link href="/cancellation-policy" className="text-[#668c65] font-semibold hover:underline">Cancellation Policy</Link> and <Link href="/terms" className="text-[#668c65] font-semibold hover:underline">Terms of Service</Link>.
                            </p>
                        </section>

                    </div>
                </div>
            </div>

        </div>
    )
}
