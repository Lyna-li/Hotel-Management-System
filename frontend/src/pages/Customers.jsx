import React, { useState } from 'react'
import { Search, Plus, Mail, Phone, MapPin, MoreVertical, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const customers = [
  { id: 'C001', name: 'John Smith', email: 'john.smith@email.com', phone: '+1 234 567 890', location: 'New York, USA', totalBookings: 12, totalSpent: 8500, lastVisit: '2024-12-20', status: 'vip' },
  { id: 'C002', name: 'Emma Wilson', email: 'emma.wilson@email.com', phone: '+1 234 567 891', location: 'Los Angeles, USA', totalBookings: 5, totalSpent: 3200, lastVisit: '2024-12-24', status: 'regular' },
  { id: 'C003', name: 'Michael Brown', email: 'michael.brown@email.com', phone: '+44 789 123 456', location: 'London, UK', totalBookings: 8, totalSpent: 5600, lastVisit: '2024-12-23', status: 'vip' },
  { id: 'C004', name: 'Sarah Davis', email: 'sarah.davis@email.com', phone: '+1 234 567 892', location: 'Chicago, USA', totalBookings: 1, totalSpent: 396, lastVisit: '2024-12-26', status: 'new' },
  { id: 'C005', name: 'James Johnson', email: 'james.johnson@email.com', phone: '+49 123 456 789', location: 'Berlin, Germany', totalBookings: 3, totalSpent: 1800, lastVisit: '2024-12-25', status: 'regular' },
  { id: 'C006', name: 'Lisa Anderson', email: 'lisa.anderson@email.com', phone: '+1 234 567 893', location: 'Miami, USA', totalBookings: 7, totalSpent: 4900, lastVisit: '2024-12-22', status: 'regular' },
]

const statusStyles = {
  vip: 'bg-gradient-gold text-accent-foreground',
  regular: 'bg-primary/10 text-primary',
  new: 'bg-success/10 text-success',
}

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage guest profiles and history</p>
        </div>
        <Button variant="gold">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 animate-slide-up">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-4">
          <div className="bg-card rounded-xl px-6 py-3 border border-border/50 flex items-center gap-2">
            <Star className="w-5 h-5 text-accent" />
            <span className="font-display font-semibold text-foreground">2</span>
            <span className="text-sm text-muted-foreground">VIP Guests</span>
          </div>
          <div className="bg-card rounded-xl px-6 py-3 border border-border/50 flex items-center gap-2">
            <span className="font-display font-semibold text-foreground">{customers.length}</span>
            <span className="text-sm text-muted-foreground">Total Customers</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer, index) => (
          <div
            key={customer.id}
            className="bg-card rounded-xl border border-border/50 p-6 hover:shadow-lg transition-all duration-300 animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-navy flex items-center justify-center">
                  <span className="text-lg font-semibold text-sidebar-foreground">
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">{customer.name}</h3>
                  <p className="text-sm text-muted-foreground">{customer.id}</p>
                </div>
              </div>
              <Badge className={statusStyles[customer.status]}>
                {customer.status === 'vip' && <Star className="w-3 h-3 mr-1" />}
                {customer.status.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{customer.location}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="font-display text-lg font-bold text-foreground">${customer.totalSpent.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Bookings</p>
                <p className="font-display text-lg font-bold text-foreground">{customer.totalBookings}</p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Customers
