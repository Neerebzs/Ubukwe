import Link from "next/link";
import { PublicBottomNav } from "@/components/ui/public-bottom-nav";
import { Button } from "@/components/ui/button";
import { TranslatedText } from "@/components/translated-text";
import { ArrowRight, Sparkles, Heart, Globe, Users, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 pb-16 md:pb-0 pt-24">

      {/* Editorial Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#fdfcf9] -z-10" />
        <div className="container mx-auto px-6">
          <div className="max-w-4xl space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-12 bg-[#608d64]/30" />
              <span className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">
                <TranslatedText text="The Heart of VowNest" />
              </span>
            </div>
            <h1 className="font-serif italic text-6xl md:text-9xl text-slate-900 leading-[0.85] tracking-tight">
              Honoring <br />
              <span className="text-slate-300 not-italic font-light">Heritage.</span><br />
              Crafting <span className="text-[#608d64]">Legacies.</span>
            </h1>
            <p className="font-sans text-slate-500 text-xl md:text-2xl max-w-2xl leading-relaxed font-light mt-12">
              <TranslatedText text="We bridge the gap between timeless Rwandan traditions and modern celebrations, connecting you with artisans who breathe life into every detail of your union." />
            </p>
          </div>
        </div>
      </section>

      {/* Values Grid - Architectural Layout */}
      <section className="py-24 bg-[#fdfcf9]">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[60px] shadow-2xl">
              <img
                src="/beautiful-garden-wedding-venue-rwanda.jpg"
                className="w-full h-full object-cover grayscale-[0.2] hover:scale-110 transition-transform duration-1000"
                alt="Rwandan Wedding Tradition"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            <div className="space-y-16">
              <div className="space-y-6">
                <div className="h-12 w-12 rounded-2xl bg-[#608d64]/10 flex items-center justify-center text-[#608d64]">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="font-serif italic text-4xl text-slate-900">Our Mission</h3>
                <p className="text-slate-500 leading-relaxed text-lg font-light">
                  <TranslatedText text="To empower couples and local artisans through a sanctuary platform that preserves Rwandan culture while simplifying the complexity of modern wedding planning." />
                </p>
              </div>

              <div className="space-y-6">
                <div className="h-12 w-12 rounded-2xl bg-[#608d64]/10 flex items-center justify-center text-[#608d64]">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="font-serif italic text-4xl text-slate-900">Why It Matters</h3>
                <p className="text-slate-500 leading-relaxed text-lg font-light">
                  <TranslatedText text="Weddings are more than events; they are cultural milestones. We protect the artistry of Rwandan artisans, ensuring heritage is celebrated, not lost, in the digital age." />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Glassmorphism & Steps */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <span className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">The Journey</span>
            <h2 className="font-serif italic text-5xl text-slate-900">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Explore",
                desc: "Discover handpicked artisans specializing in traditional and contemporary services.",
                icon: <TranslatedText text="Discover" />
              },
              {
                step: "02",
                title: "Connect",
                desc: "Engage directly with providers through our secure sanctuary for transparent planning.",
                icon: <TranslatedText text="Liaison" />
              },
              {
                step: "03",
                title: "Celebrate",
                desc: "Experience a seamless union where every detail honors your shared Rwandan story.",
                icon: <TranslatedText text="Memory" />
              },
            ].map((item, idx) => (
              <div key={idx} className="group p-12 rounded-[40px] bg-white border border-slate-50 hover:border-[#608d64]/20 hover:shadow-2xl transition-all duration-700 space-y-8">
                <span className="font-serif italic text-6xl text-slate-100 group-hover:text-[#608d64]/10 transition-colors">{item.step}</span>
                <div className="space-y-4">
                  <h4 className="font-serif italic text-2xl text-slate-900">{item.title}</h4>
                  <p className="text-slate-400 font-light leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="bg-slate-900 rounded-[60px] p-12 md:p-24 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#608d64]/10 -skew-x-12 translate-x-1/2" />

            <div className="relative z-10 max-w-2xl space-y-8">
              <h2 className="font-serif italic text-5xl md:text-7xl text-white leading-tight">
                Ready to weave your <br />
                <span className="text-[#608d64]">Rwandan story?</span>
              </h2>

              <div className="flex flex-wrap items-center gap-6 pt-8">
                <Link href="/services">
                  <Button className="h-16 px-10 rounded-full bg-[#608d64] hover:bg-white hover:text-[#608d64] text-white font-bold transition-all duration-500 shadow-xl">
                    <TranslatedText text="Explore Artisans" />
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline" className="h-16 px-10 rounded-full border-white/20 text-[#668c65] hover:bg-white hover:text-slate-900 font-bold transition-all duration-500">
                    <TranslatedText text="Join the Collective" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicBottomNav />
    </div>
  );
}
