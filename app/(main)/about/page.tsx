import Link from "next/link";
import { PublicBottomNav } from "@/components/ui/public-bottom-nav";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#eff4fa] text-foreground pb-16 md:pb-0">

      <main className="container mx-auto px-4 py-16 max-w-6xl">
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">About Ubukwe</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            We connect couples with trusted wedding service providers who honor Rwandan culture and
            traditions—making it easy to plan a beautiful, authentic celebration.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="border rounded-xl p-6 bg-card">
            <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
            <p className="text-muted-foreground">
              Empower couples and providers through a seamless platform that celebrates culture,
              simplifies planning, and delivers exceptional experiences.
            </p>
          </div>
          <div className="border rounded-xl p-6 bg-card">
            <h3 className="text-xl font-semibold mb-2">What We Do</h3>
            <p className="text-muted-foreground">
              From traditional dancers and MCs to catering and decoration, Ubukwe makes it easy to
              discover, compare, and book trusted services in minutes.
            </p>
          </div>
          <div className="border rounded-xl p-6 bg-card">
            <h3 className="text-xl font-semibold mb-2">Why It Matters</h3>
            <p className="text-muted-foreground">
              Weddings are milestones. We help preserve cultural heritage while supporting local
              creatives, vendors, and the broader events ecosystem.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">How Ubukwe Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border rounded-xl p-6 bg-card">
              <h4 className="font-semibold mb-1">1. Explore</h4>
              <p className="text-muted-foreground">Browse verified providers with transparent pricing and reviews.</p>
            </div>
            <div className="border rounded-xl p-6 bg-card">
              <h4 className="font-semibold mb-1">2. Book</h4>
              <p className="text-muted-foreground">Send requests, confirm availability, and secure your date.</p>
            </div>
            <div className="border rounded-xl p-6 bg-card">
              <h4 className="font-semibold mb-1">3. Celebrate</h4>
              <p className="text-muted-foreground">Enjoy a seamless, culturally-rich wedding experience.</p>
            </div>
          </div>
        </section>

        <section className="mb-20 text-center">
          <div className="inline-flex items-center gap-4">
            <Link href="/services">
              <Button size="lg" className="px-8">Find Services</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="px-8">Join as Provider</Button>
            </Link>
          </div>
        </section>
      </main>
      
      {/* Mobile Bottom Navigation - Only on mobile */}
      <PublicBottomNav />
    </div>
  );
}
