import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const bookings = [
  { id: 'B001', guest: 'John Smith', room: 'Suite 401', checkIn: 'Dec 25', checkOut: 'Dec 28', status: 'confirmed' },
  { id: 'B002', guest: 'Emma Wilson', room: 'Room 205', checkIn: 'Dec 24', checkOut: 'Dec 26', status: 'checked-in' },
  { id: 'B003', guest: 'Michael Brown', room: 'Suite 502', checkIn: 'Dec 23', checkOut: 'Dec 25', status: 'checked-out' },
  { id: 'B004', guest: 'Sarah Davis', room: 'Room 108', checkIn: 'Dec 26', checkOut: 'Dec 30', status: 'confirmed' },
  { id: 'B005', guest: 'James Johnson', room: 'Room 312', checkIn: 'Dec 25', checkOut: 'Dec 27', status: 'confirmed' }
]

const statusStyles = {
  confirmed: 'bg-accent/10 text-accent border-accent/20',
  'checked-in': 'bg-success/10 text-success border-success/20',
  'checked-out': 'bg-muted text-muted-foreground border-muted',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20'
}

export const RecentBookings = () => {
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
                key={booking.id}
                className="border-b border-border/50 hover:bg-muted/20 transition-colors"
              >
                <td className="py-4 px-6">
                  <p className="font-medium text-foreground">{booking.guest}</p>
                  <p className="text-xs text-muted-foreground">{booking.id}</p>
                </td>
                <td className="py-4 px-6 text-sm text-foreground">
                  {booking.room}
                </td>
                <td className="py-4 px-6 text-sm text-muted-foreground">
                  {booking.checkIn}
                </td>
                <td className="py-4 px-6 text-sm text-muted-foreground">
                  {booking.checkOut}
                </td>
                <td className="py-4 px-6">
                  <Badge
                    variant="outline"
                    className={cn(
                      'capitalize text-xs',
                      statusStyles[booking.status]
                    )}
                  >
                    {booking.status.replace('-', ' ')}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
