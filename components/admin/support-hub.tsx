"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminSupportTickets } from "@/components/admin/support-tickets"
import { AdminTestimonials } from "@/components/admin/testimonials"
import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "@/lib/api-client"

export function AdminSupportHub() {
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["admin-testimonials", "pending-count"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/v1/admin/testimonials`, { params: { status: "pending" } })
      const data = res.data as any
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      return list.length
    },
    refetchInterval: 30_000,
  })

  return (
    <Tabs defaultValue="tickets" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="tickets">Support</TabsTrigger>
        <TabsTrigger value="testimonials" className="gap-2">
          Testimonials
          {pendingCount > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
              {pendingCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tickets">
        <AdminSupportTickets />
      </TabsContent>
      <TabsContent value="testimonials">
        <AdminTestimonials />
      </TabsContent>
    </Tabs>
  )
}
