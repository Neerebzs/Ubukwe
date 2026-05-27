import { Skeleton } from "@/components/ui/skeleton"

export default function ProviderDashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f9fafc] flex">

      {/* ── Sidebar skeleton (desktop only) ── */}
      <aside className="hidden md:flex flex-col w-72 min-h-screen bg-white border-r border-slate-100 shrink-0">
        {/* Logo / brand area */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-5 w-28 rounded-md" />
        </div>

        {/* User card */}
        <div className="flex items-center gap-3 px-5 py-4 mx-3 mt-4 rounded-2xl bg-slate-50">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
              <Skeleton className="h-5 w-5 rounded-md shrink-0" />
              <Skeleton className={`h-3.5 rounded ${i === 0 ? "w-20 bg-[#668c65]/20" : "w-24"}`} />
            </div>
          ))}
        </nav>

        {/* Bottom logout */}
        <div className="px-3 pb-5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <Skeleton className="h-5 w-5 rounded-md shrink-0" />
            <Skeleton className="h-3.5 w-16 rounded" />
          </div>
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Mobile app bar ── */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-3 w-36 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>

        {/* ── Desktop header ── */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[#f9fafc] border-b border-slate-100/80 sticky top-0 z-30">
          <div className="space-y-1">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-3.5 w-52 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-36 rounded-full" />
          </div>
        </header>

        {/* ── Content area ── */}
        <main className="flex-1 p-3 md:p-6 lg:p-8 pb-24 md:pb-8 space-y-6 overflow-y-auto">

          {/* Page title */}
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-44 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>

          {/* ── Stat cards row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-20 rounded" />
                  <Skeleton className="h-9 w-9 rounded-xl" />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
            ))}
          </div>

          {/* ── Two-column section ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Recent bookings / activity list */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
              {/* List rows */}
              <div className="divide-y divide-slate-50">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-36 rounded" />
                      <Skeleton className="h-3 w-24 rounded" />
                    </div>
                    <div className="text-right space-y-1.5">
                      <Skeleton className="h-3.5 w-16 rounded ml-auto" />
                      <Skeleton className="h-5 w-20 rounded-full ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats / side card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50">
                <Skeleton className="h-5 w-28 rounded-md" />
              </div>
              <div className="p-6 space-y-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-20 rounded" />
                      <Skeleton className="h-3 w-8 rounded" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
                <div className="pt-2 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-24 rounded" />
                        <Skeleton className="h-3 w-16 rounded" />
                      </div>
                      <Skeleton className="h-3.5 w-12 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Services / cards grid ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-100 overflow-hidden">
                  <Skeleton className="h-40 w-full rounded-none" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                    <div className="flex items-center justify-between pt-1">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-8 w-20 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>

      {/* ── Mobile bottom nav skeleton ── */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-100 flex items-center justify-around px-2 py-2 z-40">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 px-3 py-1">
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-2.5 w-10 rounded" />
          </div>
        ))}
      </div>

    </div>
  )
}
