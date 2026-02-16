import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

// ==================== TYPES ====================

export interface KPIData {
  occupancyRate: number;
  todayRevenue: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  availableRooms: number;
  totalRooms: number;
  occupiedRooms: number;
  pendingCheckIns: number;
}

export interface OccupancyTrend {
  date: string;
  occupancyRate: number;
  occupiedRooms: number;
  availableRooms: number;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  adr: number; // Average Daily Rate
  revpar: number; // Revenue Per Available Room
}

export interface RevenueBySource {
  source: string;
  revenue: number;
  bookings: number;
  percentage: number;
}

export interface GuestDemographics {
  nationality: string;
  count: number;
  percentage: number;
}

export interface StaffPerformance {
  staffName: string;
  checkIns: number;
  avgCheckInTime: number;
  checkOuts: number;
  avgCheckOutTime: number;
  errorCount: number;
}

// ==================== REAL-TIME KPIs ====================

export function useKPIData() {
  return useQuery({
    queryKey: ['analytics-kpi'],
    queryFn: async (): Promise<KPIData> => {
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);

      // Get total rooms count
      const { count: totalRooms } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true });

      // Get occupied rooms
      const { count: occupiedRooms } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'occupied');

      // Get available rooms
      const { count: availableRooms } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');

      // Get today's check-ins (actual check-ins that happened today)
      const { count: todayCheckIns } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .gte('actual_check_in', todayStart.toISOString())
        .lte('actual_check_in', todayEnd.toISOString());

      // Get today's check-outs
      const { count: todayCheckOuts } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .gte('actual_check_out', todayStart.toISOString())
        .lte('actual_check_out', todayEnd.toISOString());

      // Get pending check-ins (expected today but not checked in yet)
      const { count: pendingCheckIns } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed')
        .gte('check_in_date', todayStart.toISOString())
        .lte('check_in_date', todayEnd.toISOString());

      // Calculate today's revenue (from payments made today)
      const { data: todayPayments } = await supabase
        .from('payments')
        .select('amount')
        .gte('payment_date', todayStart.toISOString())
        .lte('payment_date', todayEnd.toISOString());

      const todayRevenue = todayPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Calculate occupancy rate
      const occupancyRate = totalRooms ? (occupiedRooms || 0) / totalRooms * 100 : 0;

      return {
        occupancyRate,
        todayRevenue,
        todayCheckIns: todayCheckIns || 0,
        todayCheckOuts: todayCheckOuts || 0,
        availableRooms: availableRooms || 0,
        totalRooms: totalRooms || 0,
        occupiedRooms: occupiedRooms || 0,
        pendingCheckIns: pendingCheckIns || 0,
      };
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

// ==================== OCCUPANCY ANALYTICS ====================

export function useOccupancyTrends(days: number = 30) {
  return useQuery({
    queryKey: ['analytics-occupancy-trends', days],
    queryFn: async (): Promise<OccupancyTrend[]> => {
      const today = new Date();
      const startDate = subDays(today, days);

      // Get total rooms
      const { count: totalRooms } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true });

      if (!totalRooms) return [];

      // Get all reservations in the date range
      const { data: reservations } = await supabase
        .from('reservations')
        .select('check_in_date, check_out_date, status')
        .gte('check_in_date', startDate.toISOString())
        .in('status', ['confirmed', 'checked_in', 'checked_out']);

      // Calculate occupancy for each day
      const trends: OccupancyTrend[] = [];
      for (let i = 0; i < days; i++) {
        const date = subDays(today, days - i - 1);
        const dateStr = format(date, 'MMM dd');

        // Count rooms occupied on this date
        const occupiedCount = reservations?.filter(res => {
          const checkIn = new Date(res.check_in_date);
          const checkOut = new Date(res.check_out_date);
          return date >= checkIn && date < checkOut;
        }).length || 0;

        const availableCount = totalRooms - occupiedCount;
        const occupancyRate = (occupiedCount / totalRooms) * 100;

        trends.push({
          date: dateStr,
          occupancyRate: Math.round(occupancyRate * 10) / 10,
          occupiedRooms: occupiedCount,
          availableRooms: availableCount,
        });
      }

      return trends;
    },
    staleTime: 300000, // 5 minutes
  });
}

export function useOccupancyByRoomType() {
  return useQuery({
    queryKey: ['analytics-occupancy-by-room-type'],
    queryFn: async () => {
      // Get all room types with room count
      const { data: roomTypes } = await supabase
        .from('room_types')
        .select(`
          id,
          name,
          rooms (
            id,
            status
          )
        `);

      if (!roomTypes) return [];

      return roomTypes.map(rt => {
        const rooms = rt.rooms || [];
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter((r: any) => r.status === 'occupied').length;
        const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

        return {
          roomType: rt.name,
          totalRooms,
          occupiedRooms,
          availableRooms: totalRooms - occupiedRooms,
          occupancyRate: Math.round(occupancyRate * 10) / 10,
        };
      });
    },
    staleTime: 60000, // 1 minute
  });
}

// ==================== REVENUE ANALYTICS ====================

export function useRevenueTrends(days: number = 30) {
  return useQuery({
    queryKey: ['analytics-revenue-trends', days],
    queryFn: async (): Promise<RevenueTrend[]> => {
      const today = new Date();
      const startDate = subDays(today, days);

      // Get total rooms for RevPAR calculation
      const { count: totalRooms } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true });

      if (!totalRooms) return [];

      // Get all payments in the date range
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, payment_date')
        .gte('payment_date', startDate.toISOString());

      // Get all reservations for ADR calculation
      const { data: reservations } = await supabase
        .from('reservations')
        .select(`
          id,
          check_in_date,
          check_out_date,
          actual_check_in,
          actual_check_out,
          invoices (
            total_amount
          )
        `)
        .gte('check_in_date', startDate.toISOString())
        .in('status', ['checked_in', 'checked_out']);

      // Calculate metrics for each day
      const trends: RevenueTrend[] = [];
      for (let i = 0; i < days; i++) {
        const date = subDays(today, days - i - 1);
        const dateStart = startOfDay(date);
        const dateEnd = endOfDay(date);
        const dateStr = format(date, 'MMM dd');

        // Sum revenue for this day
        const dayRevenue = payments
          ?.filter(p => {
            const pDate = new Date(p.payment_date);
            return pDate >= dateStart && pDate <= dateEnd;
          })
          .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

        // Count rooms sold (reservations that include this date)
        const roomsSold = reservations?.filter(res => {
          const checkIn = res.actual_check_in ? new Date(res.actual_check_in) : new Date(res.check_in_date);
          const checkOut = res.actual_check_out ? new Date(res.actual_check_out) : new Date(res.check_out_date);
          return date >= checkIn && date < checkOut;
        }).length || 0;

        // Calculate ADR (Average Daily Rate) = Total Revenue / Rooms Sold
        const adr = roomsSold > 0 ? dayRevenue / roomsSold : 0;

        // Calculate RevPAR (Revenue Per Available Room) = Total Revenue / Total Rooms
        const revpar = dayRevenue / totalRooms;

        trends.push({
          date: dateStr,
          revenue: Math.round(dayRevenue * 100) / 100,
          adr: Math.round(adr * 100) / 100,
          revpar: Math.round(revpar * 100) / 100,
        });
      }

      return trends;
    },
    staleTime: 300000, // 5 minutes
  });
}

export function useRevenueBySource() {
  return useQuery({
    queryKey: ['analytics-revenue-by-source'],
    queryFn: async (): Promise<RevenueBySource[]> => {
      // Get reservations with their creation context (walk-in vs advanced booking)
      const { data: reservations } = await supabase
        .from('reservations')
        .select(`
          id,
          check_in_date,
          created_at,
          invoices (
            total_amount
          )
        `)
        .in('status', ['checked_in', 'checked_out'])
        .order('created_at', { ascending: false })
        .limit(1000); // Last 1000 reservations

      if (!reservations) return [];

      // Categorize reservations
      const sources: { [key: string]: { revenue: number; bookings: number } } = {
        'Walk-in': { revenue: 0, bookings: 0 },
        'Advance Booking': { revenue: 0, bookings: 0 },
        'Same Day': { revenue: 0, bookings: 0 },
      };

      let totalRevenue = 0;

      reservations.forEach(res => {
        const revenue = res.invoices?.[0]?.total_amount || 0;
        totalRevenue += revenue;

        const created = new Date(res.created_at);
        const checkIn = new Date(res.check_in_date);
        const hoursDiff = (checkIn.getTime() - created.getTime()) / (1000 * 60 * 60);

        if (hoursDiff < 2) {
          // Walk-in (created within 2 hours of check-in)
          sources['Walk-in']!.revenue += revenue;
          sources['Walk-in']!.bookings += 1;
        } else if (hoursDiff < 24) {
          // Same day (created same day as check-in)
          sources['Same Day']!.revenue += revenue;
          sources['Same Day']!.bookings += 1;
        } else {
          // Advance booking
          sources['Advance Booking']!.revenue += revenue;
          sources['Advance Booking']!.bookings += 1;
        }
      });

      // Convert to array
      return Object.entries(sources).map(([source, data]) => ({
        source,
        revenue: Math.round(data.revenue * 100) / 100,
        bookings: data.bookings,
        percentage: totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 1000) / 10 : 0,
      }));
    },
    staleTime: 300000, // 5 minutes
  });
}

// ==================== GUEST ANALYTICS ====================

export function useGuestDemographics() {
  return useQuery({
    queryKey: ['analytics-guest-demographics'],
    queryFn: async (): Promise<GuestDemographics[]> => {
      const { data: guests } = await supabase
        .from('guests')
        .select('nationality')
        .not('nationality', 'is', null);

      if (!guests) return [];

      // Count by nationality
      const counts: { [key: string]: number } = {};
      guests.forEach(g => {
        const nationality = g.nationality || 'Unknown';
        counts[nationality] = (counts[nationality] || 0) + 1;
      });

      const total = guests.length;

      // Convert to array and sort by count
      return Object.entries(counts)
        .map(([nationality, count]) => ({
          nationality,
          count,
          percentage: Math.round((count / total) * 1000) / 10,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 nationalities
    },
    staleTime: 600000, // 10 minutes
  });
}

export function useGuestStats() {
  return useQuery({
    queryKey: ['analytics-guest-stats'],
    queryFn: async () => {
      // Get total guests
      const { count: totalGuests } = await supabase
        .from('guests')
        .select('*', { count: 'exact', head: true });

      // Get all reservations with guest info
      const { data: reservations } = await supabase
        .from('reservations')
        .select('guest_id, check_in_date, check_out_date, status')
        .in('status', ['checked_out', 'checked_in']);

      if (!reservations) {
        return {
          totalGuests: totalGuests || 0,
          avgStayDuration: 0,
          repeatGuestRate: 0,
          topGuests: [],
        };
      }

      // Calculate average stay duration
      const durations = reservations.map(res => {
        const checkIn = new Date(res.check_in_date);
        const checkOut = new Date(res.check_out_date);
        return (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);
      });
      const avgStayDuration = durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : 0;

      // Calculate repeat guest rate
      const guestBookings: { [key: string]: number } = {};
      reservations.forEach(res => {
        guestBookings[res.guest_id] = (guestBookings[res.guest_id] || 0) + 1;
      });

      const repeatGuests = Object.values(guestBookings).filter(count => count > 1).length;
      const repeatGuestRate = totalGuests ? (repeatGuests / totalGuests) * 100 : 0;

      // Get top guests by booking count
      const topGuestIds = Object.entries(guestBookings)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => id);

      const { data: topGuestsData } = await supabase
        .from('guests')
        .select('id, first_name, last_name, email')
        .in('id', topGuestIds);

      const topGuests = topGuestsData?.map(guest => ({
        ...guest,
        bookingCount: guestBookings[guest.id],
      })) || [];

      return {
        totalGuests: totalGuests || 0,
        avgStayDuration: Math.round(avgStayDuration * 10) / 10,
        repeatGuestRate: Math.round(repeatGuestRate * 10) / 10,
        topGuests,
      };
    },
    staleTime: 300000, // 5 minutes
  });
}

// ==================== STAFF PERFORMANCE ====================

export function useStaffPerformance() {
  return useQuery({
    queryKey: ['analytics-staff-performance'],
    queryFn: async (): Promise<StaffPerformance[]> => {
      // Note: This assumes we have a 'checked_in_by' and 'checked_out_by' field
      // If not available, this is a placeholder for future implementation
      
      // For now, return mock data structure
      // In production, you'd query: reservations.select('checked_in_by, actual_check_in, ...')
      
      return [
        {
          staffName: 'System (Automated)',
          checkIns: 0,
          avgCheckInTime: 0,
          checkOuts: 0,
          avgCheckOutTime: 0,
          errorCount: 0,
        },
      ];
    },
    staleTime: 300000, // 5 minutes
    enabled: false, // Disable until we have staff tracking
  });
}
