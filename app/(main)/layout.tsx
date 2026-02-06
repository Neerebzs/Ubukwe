import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#ffffff] pt-16">
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}
