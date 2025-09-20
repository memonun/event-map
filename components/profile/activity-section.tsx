'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { History, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileEventCard } from "@/components/profile/profile-event-card";

interface ActivityEvent {
  event_id: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  venue_city: string;
  user_status: string;
  artists: string[];
  genre: string;
  image_url: string | null;
  interaction_date: string;
}

interface ActivitySectionProps {
  userId: string;
}

export function ActivitySection({ userId }: ActivitySectionProps) {
  const router = useRouter();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [groupedByStatus, setGroupedByStatus] = useState<{
    attended: ActivityEvent[];
    missed: ActivityEvent[];
    wish_went: ActivityEvent[];
  }>({ attended: [], missed: [], wish_went: [] });
  const [groupedByTime, setGroupedByTime] = useState<{
    thisYear: ActivityEvent[];
    lastYear: ActivityEvent[];
    older: ActivityEvent[];
  }>({ thisYear: [], lastYear: [], older: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('status');
  const [stats, setStats] = useState({ attended: 0, missed: 0, wished: 0 });

  useEffect(() => {
    const fetchEventHistory = async () => {
      try {
        const response = await fetch('/api/profile/events/history');
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
          setGroupedByStatus(data.groupedByStatus || { attended: [], missed: [], wish_went: [] });
          setGroupedByTime(data.groupedByTime || { thisYear: [], lastYear: [], older: [] });
          setStats(data.stats || { attended: 0, missed: 0, wished: 0 });
        }
      } catch (error) {
        console.error('Error fetching event history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventHistory();
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attended': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'wish_went': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const _getStatusLabel = (status: string) => {
    switch (status) {
      case 'attended': return 'Attended';
      case 'missed': return 'Missed';
      case 'wish_went': return 'Wish I Went';
      default: return status;
    }
  };

  const renderEventGrid = (events: ActivityEvent[], showStatus = true) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <ProfileEventCard
          key={event.event_id}
          event={event}
          showStatus={showStatus}
        />
      ))}
    </div>
  );

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Section Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Activity</h2>
            <p className="text-sm text-gray-500">
              Your event history and memories
            </p>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              {stats.attended} events attended
            </span>
          </div>
        </div>
      </div>

      {/* Activity Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-purple-500 rounded-full"></div>
            <span className="ml-3 text-gray-500">Loading activity...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
            <p className="text-gray-500 mb-4">
              Start attending events to build your activity history.
            </p>
            <Button variant="outline" onClick={() => router.push('/')}>
              Explore Events
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="status">By Status</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            {/* By Status Tab */}
            <TabsContent value="status" className="space-y-6">
              {/* Status Summary */}
              <div className="flex gap-2">
                <Badge variant="secondary" className={getStatusColor('attended')}>
                  Attended: {stats.attended}
                </Badge>
                <Badge variant="secondary" className={getStatusColor('missed')}>
                  Missed: {stats.missed}
                </Badge>
                <Badge variant="secondary" className={getStatusColor('wish_went')}>
                  Wish I Went: {stats.wished}
                </Badge>
              </div>

              {/* Attended Events */}
              {groupedByStatus.attended.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Events Attended ({groupedByStatus.attended.length})
                  </h3>
                  {renderEventGrid(groupedByStatus.attended, false)}
                </div>
              )}

              {/* Missed Events */}
              {groupedByStatus.missed.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    Events Missed ({groupedByStatus.missed.length})
                  </h3>
                  {renderEventGrid(groupedByStatus.missed, false)}
                </div>
              )}

              {/* Wish I Went Events */}
              {groupedByStatus.wish_went.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    Wish I Went ({groupedByStatus.wish_went.length})
                  </h3>
                  {renderEventGrid(groupedByStatus.wish_went, false)}
                </div>
              )}
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-8">
              {/* This Year */}
              {groupedByTime.thisYear.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    This Year ({groupedByTime.thisYear.length})
                  </h3>
                  {renderEventGrid(groupedByTime.thisYear)}
                </div>
              )}

              {/* Last Year */}
              {groupedByTime.lastYear.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Last Year ({groupedByTime.lastYear.length})
                  </h3>
                  {renderEventGrid(groupedByTime.lastYear)}
                </div>
              )}

              {/* Older */}
              {groupedByTime.older.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Older ({groupedByTime.older.length})
                  </h3>
                  {renderEventGrid(groupedByTime.older)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </section>
  );
}