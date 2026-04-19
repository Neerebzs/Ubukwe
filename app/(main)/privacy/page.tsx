import React from "react"
import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#FCFBF9] text-slate-900 pb-20">
            {/* Header Section */}
            <div className="bg-slate-900 text-white border-b border-slate-800 pt-28 pb-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
                
                <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-4xl">
                    <Link href="/">
                        <Button variant="ghost" className="mb-8 rounded-full bg-white/10 hover:bg-white hover:text-slate-900 text-white transition-all gap-2 px-5 h-10 border border-white/20">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="font-bold text-[10px] uppercase tracking-widest">Back to Home</span>
                        </Button>
                    </Link>
                    
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="h-5 w-5 text-[#668c65]" />
                        <span className="text-[#668c65] font-bold tracking-[0.4em] uppercase text-[10px]">Data & Privacy</span>
                    </div>
                    
                    <h1 className="font-serif text-5xl md:text-6xl leading-[1.1] mb-6">
                        Privacy <span className="italic font-light text-[#668c65]">Policy</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-light max-w-2xl">
                        Your privacy matters to us. Learn how VowNest collects, uses, and protects your personal information.
                    </p>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-8">
                        Effective Date: April 2026
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-6 md:px-12 max-w-4xl pt-16">
                <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl shadow-slate-100 border border-slate-50 relative">
                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-8">
                        
                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                Introduction
                            </h2>
                            <p>
                                VowNest is committed to protecting the privacy of your personal data. This Privacy Policy explains our data practices, what information we collect when you use our platform, and how that information is utilized to give you a personalized, safe, and robust experience when organizing your events or providing services.
                            </p>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                1. Information We Collect
                            </h2>
                            <p>
                                We may collect personal and non-personal information when you register, book a service, or interact with our platform:
                            </p>
                            <ul className="list-disc pl-5 mt-4 space-y-2">
                                <li><strong>Personal Identifier Info:</strong> Name, email address, phone number, and physical address provided during account creation or booking processing.</li>
                                <li><strong>Platform Activity:</strong> Search queries, favorites, booking history, reviews, and messages sent between Customers and Providers.</li>
                                <li><strong>Financial Information:</strong> If you perform a transaction, our trusted third-party payment processors handle and store your payment methodology; we only retain metadata (e.g., last 4 digits, receipt info).</li>
                                <li><strong>Provider Data:</strong> For artisans, we collect business names, portfolio media, verification documents, and identification details related to identity verification requirements.</li>
                            </ul>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                2. How We Use Your Information
                            </h2>
                            <p>
                                Your information helps us operate effectively and provide the best experiences. We use the collected data to:
                            </p>
                            <ul className="list-disc pl-5 mt-4 space-y-2">
                                <li>Facilitate interactions and bookings between Customers and Providers.</li>
                                <li>Personalize platform experiences, recommendations, and localized searches.</li>
                                <li>Communicate with you regarding account updates, security alerts, and customer support responses.</li>
                                <li>Ensure provider authenticity through verification processes, fostering trust inside the ecosystem.</li>
                                <li>Improve platform performance through analytics and monitoring.</li>
                            </ul>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                3. Sharing Your Information
                            </h2>
                            <p>
                                We do not sell your personal data. We share information only under the following circumstances:
                            </p>
                            <ul className="list-disc pl-5 mt-4 space-y-2">
                                <li><strong>Between Users:</strong> Customer booking details are shared with the Provider to facilitate the service. Provider details are public to facilitate marketplace discovery.</li>
                                <li><strong>Service Providers:</strong> We employ third parties to facilitate our application (e.g., hosting, payment processing, sending emails) who are obligated not to disclose or use the information for any other purpose.</li>
                                <li><strong>Legal Requirements:</strong> If required by law, subpoena, or other legal processes, we may disclose your information to law enforcement or governmental agencies.</li>
                            </ul>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                4. Data Security and Rights
                            </h2>
                            <p>
                                We implement standard security measures designed to protect your personal information from unauthorized access and disclosure. However, no internet transmission is 100% secure. You govern what information you provide us at your own risk.
                            </p>
                            <p className="mt-4">
                                <strong>Your Rights:</strong> You have the right to access, modify, or delete your personal data. To initiate account deletion or a data disclosure request, please contact our support team. Upon your request, we will remove your personal info except where retention is required for legal and tax compliance.
                            </p>
                        </section>

                    </div>
                </div>
            </div>
            
        </div>
    )
}
