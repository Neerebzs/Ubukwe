"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, Ticket, DollarSign, Calendar } from "lucide-react";

interface Event {
  id: string;
  title: string;
  event_date: string;
  status: string;
  total_tickets?: number;
  sold_tickets?: number;
  revenue?: number;
}

export default function EventAnalyticsPage() {
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["provider-events-analytics"],
    queryFn: async () => {
      const res = await axiosInstance.get<any>("/api/v1/provider/events");
      return res.data?.data ?? res.data ?? [];
    },
  });

  const totalRevenue = events.reduce((s, e) => s + (e.revenue ?? 0), 0);
  const totalSold = events.reduce((s, e) => s + (e.sold_tickets ?? 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Event Analytics</h1>
        <p className="text-muted-foreground">Track your event ticket sales and performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} RWF</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => e.status === "approved" || e.status === "active").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        {["all", "upcoming", "past"].map(tab => {
          const filtered = tab === "all" ? events
            : tab === "upcoming" ? events.filter(e => new Date(e.event_date) >= new Date())
            : events.filter(e => new Date(e.event_date) < new Date());
          return (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {filtered.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground">No events found</CardContent></Card>
              ) : (
                filtered.map(event => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{event.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.event_date).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant={event.status === "approved" ? "default" : "secondary"}>
                          {event.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Tickets Sold</p>
                          <p className="text-xl font-bold">{event.sold_tickets ?? 0}/{event.total_tickets ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Revenue</p>
                          <p className="text-xl font-bold">{(event.revenue ?? 0).toLocaleString()} RWF</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
