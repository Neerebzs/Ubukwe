import React from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Scale, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsAndConditionsPage() {
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
                        <Scale className="h-5 w-5 text-[#668c65]" />
                        <span className="text-[#668c65] font-bold tracking-[0.4em] uppercase text-[10px]">Legal Governance</span>
                    </div>
                    
                    <h1 className="font-serif text-5xl md:text-6xl text-slate-900 leading-[1.1] mb-6">
                        Terms of Service <span className="italic font-light text-[#668c65]">& Conditions</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-light max-w-2xl">
                        These Terms govern your use of the VowNest platform. Please read them carefully before utilizing our services.
                    </p>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-8">
                        Last Updated: April 2026
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
                                Introduction & Acceptance
                            </h2>
                            <p>
                                Welcome to VowNest ("Platform", "we", "us", or "our"). These Terms & Conditions constitute a legally binding agreement made between you (whether personally or on behalf of an entity) and VowNest concerning your access to and use of our web application.
                            </p>
                            <p className="mt-4">
                                By accessing the Platform, you agree that you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these Terms, then you are expressly prohibited from using the Platform and you must discontinue use immediately.
                            </p>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-sm">2</span>
                                Use of the Platform
                            </h2>
                            <p>
                                VowNest is an online marketplace designed to connect consumers (engaged couples, event hosts) with professional event service providers and artisans. 
                            </p>
                            <ul className="list-disc pl-5 mt-4 space-y-2">
                                <li><strong>For Customers:</strong> You may use the Platform to discover, contact, and book service providers for your events. All bookings are subject to the individual provider's availability and specific contracting terms.</li>
                                <li><strong>For Providers:</strong> You may use the Platform to showcase your portfolio, detail your services, and receive bookings. You are solely responsible for fulfilling the services agreed upon with the customer.</li>
                            </ul>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-sm">3</span>
                                Booking, Payments & Fees
                            </h2>
                            <p>
                                VowNest facilitates the initial connection and booking request phase. Depending on the tier and agreement:
                            </p>
                            <ul className="list-disc pl-5 mt-4 space-y-2">
                                <li>Any deposits or upfront payments managed through the platform are non-refundable unless specified otherwise by the Provider.</li>
                                <li>VowNest may charge a platform service fee applied at checkout, which helps us maintain and run the platform safely.</li>
                                <li>Disputes regarding service delivery, quality, or refund requests must be resolved directly between the Customer and the Provider, although VowNest will aid in dispute mediation when possible.</li>
                            </ul>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-sm">4</span>
                                User Content & Intellectual Property
                            </h2>
                            <p>
                                As a Provider or Customer, you may upload photos, videos, descriptions, and reviews ("User Content").
                            </p>
                            <p className="mt-4">
                                By submitting User Content, you grant VowNest a worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content in connection with providing and promoting the Platform. You represent and warrant that you hold the copyrights or necessary permissions for any content you upload. VowNest reserves the right to remove any content that violates intellectual property rights or our community standards.
                            </p>
                        </section>

                        <div className="h-px bg-slate-100" />

                        <section>
                            <h2 className="text-2xl font-serif text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-sm">5</span>
                                Liability & Disclaimer
                            </h2>
                            <p>
                                VowNest is not a party to the actual contract established between Customers and Providers. As such, VowNest assumes no liability for the quality, safety, or legality of the services provided, nor the ability of Providers to deliver on their promises or the ability of Customers to pay for services.
                            </p>
                            <p className="mt-4 font-semibold">
                                The platform is provided on an "AS-IS" and "AS-AVAILABLE" basis. We disclaim all warranties, express or implied, including the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                            </p>
                        </section>

                    </div>
                </div>
            </div>
            
        </div>
    )
}
