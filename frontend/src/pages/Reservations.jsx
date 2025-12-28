import React, { useState } from 'react'
import { Search, Plus, Calendar, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const reservationsData = [
  { id: 'RES001', guest: 'John Smith', email: 'john@email.com', room: '401', roomType: 'Suite', checkIn: '2024-12-25', checkOut: '2024-12-28', nights: 3, total: 897, status: 'confirmed' },
  { id: 'RES002', guest: 'Emma Wilson', email: 'emma@email.com', room: '205', roomType: 'Deluxe', checkIn: '2024-12-24', checkOut: '2024-12-26', nights: 2, total: 298, status: 'checked-in' },
  { id: 'RES003', guest: 'Michael Brown', email: 'michael@email.com', room: '502', roomType: 'Suite', checkIn: '2024-12-23', checkOut: '2024-12-25', nights: 2, total: 598, status: 'checked-out' },
  { id: 'RES004', guest: 'Sarah Davis', email: 'sarah@email.com', room: '108', roomType: 'Standard', checkIn: '2024-12-26', checkOut: '2024-12-30', nights: 4, total: 396, status: 'pending' },
  { id: 'RES005', guest: 'James Johnson', email: 'james@email.com', room: '312', roomType: 'Deluxe', checkIn: '2024-12-25', checkOut: '2024-12-27', nights: 2, total: 298, status: 'confirmed' },
  { id: 'RES006', guest: 'Lisa Anderson', email: 'lisa@email.com', room: '201', roomType: 'Deluxe', checkIn: '2024-12-27', checkOut: '2024-12-29', nights: 2, total: 298, status: 'confirmed' },
  { id: 'RES007', guest: 'Robert Taylor', email: 'robert@email.com', room: '101', roomType: 'Standard', checkIn: '2024-12-22', checkOut: '2024-12-24', nights: 2, total: 198, status: 'cancelled' },
]

const statusStyles = {
  confirmed: 'bg-accent/10 text-accent border-accent/20',
  'checked-in': 'bg-success/10 text-success border-success/20',
  'checked-out': 'bg-muted text-muted-foreground border-muted',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
}

const Reservations = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredReservations = reservationsData.filter((res) =>
    res.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.room.includes(searchQuery)
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground mt-1">Manage guest bookings and reservations</p>
        </div>
        <Button variant="gold">
          <Plus className="w-4 h-4 mr-2" />
          New Reservation
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-slide-up">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/4 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by guest name, ID, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">24</p>
            <p className="text-xs text-muted-foreground">Today's Check-ins</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">18</p>
            <p className="text-xs text-muted-foreground">Today's Check-outs</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/50 overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reservation</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Guest</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Room</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check-in</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check-out</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((res) => (
                <tr key={res.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-4 px-6 font-medium text-foreground">{res.id}</td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-foreground">{res.guest}</p>
                    <p className="text-xs text-muted-foreground">{res.email}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-foreground">Room {res.room}</p>
                    <p className="text-xs text-muted-foreground">{res.roomType}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">{res.checkIn}</td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">{res.checkOut}</td>
                  <td className="py-4 px-6">
                    <p className="font-display font-semibold text-foreground">${res.total}</p>
                    <p className="text-xs text-muted-foreground">{res.nights} nights</p>
                  </td>
                  <td className="py-4 px-6">
                    <Badge className={cn('capitalize', statusStyles[res.status])}>
                      {res.status.replace('-', ' ')}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reservations