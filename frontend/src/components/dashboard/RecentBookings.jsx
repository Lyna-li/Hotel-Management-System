import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const API_BASE_URL = 'http://localhost:5000';

const statusStyles = {
  confirmed: 'bg-accent/10 text-accent border-accent/20',
  'checked-in': 'bg-success/10 text-success border-success/20',
  'checked-out': 'bg-muted text-muted-foreground border-muted',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20'
}

export const RecentBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/reservations`)
      .then(res => res.json())
      .then(data => {
        // Sort by check-in date descending and take the latest 5
        const sorted = data
          .sort((a, b) => new Date(b.date_debut) - new Date(a.date_debut))
          .slice(0, 5);
        setBookings(sorted);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden animate-slide-up"
      style={{ animationDelay: '300ms' }}
    >
      <div className="p-6 border-b border-border">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Recent Bookings
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Latest reservations and check-ins
        </p>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">Loading...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Guest
                </th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Room
                </th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Check-in
                </th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Check-out
                </th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id_reservation}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="py-4 px-6">
                    <p className="font-medium text-foreground">
                      {booking.client?.nom || booking.guest || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.id_reservation || booking.id}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-sm text-foreground">
                    {booking.room?.numero || booking.room || 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">
                    {booking.date_debut
                      ? new Date(booking.date_debut).toLocaleDateString()
                      : booking.checkIn || 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">
                    {booking.date_fin
                      ? new Date(booking.date_fin).toLocaleDateString()
                      : booking.checkOut || 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    <Badge
                      variant="outline"
                      className={cn(
                        'capitalize text-xs',
                        statusStyles[booking.status] || statusStyles.confirmed
                      )}
                    >
                      {(booking.status || 'confirmed').replace('-', ' ')}
                    </Badge>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted-foreground">
                    No recent bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
