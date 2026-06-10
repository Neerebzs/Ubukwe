import React from "react"
import Link from "next/link"
import { ArrowLeft, Mail, MapPin, MessageCircle, Phone, Clock, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
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
                        <MessageCircle className="h-5 w-5 text-[#668c65]" />
                        <span className="text-[#668c65] font-bold tracking-[0.4em] uppercase text-[10px]">We're Here to Help</span>
                    </div>

                    <h1 className="font-serif text-5xl md:text-6xl text-slate-900 leading-[1.1] mb-6">
                        Contact <span className="italic font-light text-[#668c65]">Us</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-light max-w-2xl">
                        Questions about a booking, payment, refund, or cancellation? Reach out and our support team will get back to you.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-6 md:px-12 max-w-4xl pt-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-100 border border-slate-50">
                        <div className="p-3 rounded-2xl bg-[#668c65]/10 text-[#668c65] w-fit mb-5">
                            <Mail className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-serif text-slate-900 mb-2">Email</h2>
                        <a href="mailto:vownest@zohomail.com" className="text-[#668c65] font-semibold hover:underline">
                            vownest@zohomail.com
                        </a>
                        <p className="text-sm text-slate-500 mt-2 font-light">
                            For general support, refund requests, cancellations, and partnership inquiries. We aim to respond within one business day.
                        </p>
                    </div>

                    <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-100 border border-slate-50">
                        <div className="p-3 rounded-2xl bg-[#668c65]/10 text-[#668c65] w-fit mb-5">
                            <Phone className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-serif text-slate-900 mb-2">Phone</h2>
                        <a href="tel:+250791287640" className="text-[#668c65] font-semibold hover:underline">
                            +250 791 287 640
                        </a>
                        <p className="text-sm text-slate-500 mt-2 font-light">
                            Call or WhatsApp us during support hours for urgent booking issues.
                        </p>
                    </div>

                    <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-100 border border-slate-50">
                        <div className="p-3 rounded-2xl bg-[#668c65]/10 text-[#668c65] w-fit mb-5">
                            <MapPin className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-serif text-slate-900 mb-2">Office</h2>
                        <p className="text-slate-700 font-medium">Muhabura Building, KN 7 Ave</p>
                        <p className="text-slate-700 font-medium">Kigali, Rwanda</p>
                        <p className="text-sm text-slate-500 mt-2 font-light">
                            Visits by appointment — please email or call ahead.
                        </p>
                    </div>

                    <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-100 border border-slate-50">
                        <div className="p-3 rounded-2xl bg-[#668c65]/10 text-[#668c65] w-fit mb-5">
                            <Clock className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-serif text-slate-900 mb-2">Support Hours</h2>
                        <ul className="text-slate-700 font-medium space-y-1">
                            <li>Monday – Friday: 8:00 AM – 6:00 PM</li>
                            <li>Saturday: 9:00 AM – 3:00 PM</li>
                        </ul>
                        <p className="text-sm text-slate-500 mt-2 font-light">
                            Rwanda Time (CAT). Sundays: urgent booking issues only.
                        </p>
                    </div>

                </div>

                {/* Legal entity */}
                <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-100 border border-slate-50 mt-6">
                    <div className="flex items-start gap-5">
                        <div className="p-3 rounded-2xl bg-[#668c65]/10 text-[#668c65]">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif text-slate-900 mb-2">Company Information</h2>
                            <p className="text-slate-600 font-light leading-relaxed">
                                VowNest is owned and operated by <strong className="font-semibold text-slate-900">Neere Business Group Ltd</strong>, a company registered in Rwanda, with its offices at Muhabura Building, KN 7 Ave, Kigali, Rwanda. Payments on the platform are processed securely by our payment partner, IremboPay.
                            </p>
                            <p className="text-sm text-slate-500 mt-4 font-light">
                                Helpful links:{" "}
                                <Link href="/terms" className="text-[#668c65] font-semibold hover:underline">Terms of Service</Link>{" · "}
                                <Link href="/privacy" className="text-[#668c65] font-semibold hover:underline">Privacy Policy</Link>{" · "}
                                <Link href="/refund-policy" className="text-[#668c65] font-semibold hover:underline">Refund Policy</Link>{" · "}
                                <Link href="/cancellation-policy" className="text-[#668c65] font-semibold hover:underline">Cancellation Policy</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
