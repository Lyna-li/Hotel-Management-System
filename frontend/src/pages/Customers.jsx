import React, { useState, useEffect } from 'react'
import { Search, Plus, Mail, Phone, MapPin, MoreVertical, Star, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'

const API_BASE_URL =  'http://localhost:5000';

const statusStyles = {
  vip: 'bg-gradient-gold text-accent-foreground',
  regular: 'bg-primary/10 text-primary',
  new: 'bg-success/10 text-success',
}

// Helper function to determine customer status based on data
const getCustomerStatus = (totalBookings, totalSpent) => {
  if (totalSpent > 5000 || totalBookings > 10) return 'vip';
  if (totalBookings > 1) return 'regular';
  return 'new';
}

// Helper to get initials from name
const getInitials = (nom, prenom) => {
  return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
}

// Format date to readable string
const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    vipCount: 0,
    totalCustomers: 0
  })

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setIsLoading(true)
    try {
      // First, get all users with CLIENT role
      const usersResponse = await fetch(`${API_BASE_URL}/users`)
      if (!usersResponse.ok) {
        throw new Error(`HTTP error! status: ${usersResponse.status}`)
      }
      
      const allUsers = await usersResponse.json()
      
      // Filter only clients
      const clientUsers = allUsers.filter(user => user.role === 'CLIENT')
      
      // For each client user, get their client details and reservations
      const customersData = await Promise.all(
        clientUsers.map(async (user) => {
          try {
            // Get client details
            const clientResponse = await fetch(`${API_BASE_URL}/clients/user/${user.id_user}`)
            const clientData = clientResponse.ok ? await clientResponse.json() : null
            
            // Get reservations for this client
            const reservationsResponse = await fetch(`${API_BASE_URL}/reservations/client/${clientData?.id_client || user.id_user}`)
            const reservations = reservationsResponse.ok ? await reservationsResponse.json() : []
            
            // Calculate stats from reservations
            const totalBookings = reservations.length
            
            // Calculate total spent from reservations (you might need to adjust this based on your data structure)
            const totalSpent = reservations.reduce((sum, reservation) => {
              return sum + (reservation.totalAmount || reservation.montant || 0)
            }, 0)
            
            // Get last visit (most recent reservation date)
            const lastVisit = reservations.length > 0 
              ? new Date(Math.max(...reservations.map(r => new Date(r.date_debut || r.created_at))))
              : null
            
            return {
              id_client: clientData?.id_client || `C${user.id_user.toString().padStart(3, '0')}`,
              id_user: user.id_user,
              nom: user.nom,
              prenom: user.prenom,
              email: user.email,
              telephone: user.telephone || 'N/A',
              location: 'Unknown', // You might want to add location field to your User model
              totalBookings,
              totalSpent,
              lastVisit: lastVisit?.toISOString() || null,
              status: getCustomerStatus(totalBookings, totalSpent),
              date_inscription: clientData?.date_inscription || user.created_at
            }
          } catch (error) {
            console.error(`Error fetching data for user ${user.id_user}:`, error)
            return {
              id_client: `C${user.id_user.toString().padStart(3, '0')}`,
              id_user: user.id_user,
              nom: user.nom,
              prenom: user.prenom,
              email: user.email,
              telephone: user.telephone || 'N/A',
              location: 'Unknown',
              totalBookings: 0,
              totalSpent: 0,
              lastVisit: null,
              status: 'new',
              date_inscription: user.created_at
            }
          }
        })
      )
      
      setCustomers(customersData)
      
      // Calculate stats
      const vipCount = customersData.filter(c => c.status === 'vip').length
      setStats({
        vipCount,
        totalCustomers: customersData.length
      })
      
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast({
        title: 'Error',
        description: 'Failed to load customers. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Alternative: If you have a dedicated customers endpoint that returns all necessary data
  const fetchCustomersDirect = async () => {
    setIsLoading(true)
    try {
      // Try to get clients directly (you might need to create this endpoint)
      const response = await fetch(`${API_BASE_URL}/clients/details`)
      
      if (response.ok) {
        const customersData = await response.json()
        setCustomers(customersData)
        
        const vipCount = customersData.filter(c => c.status === 'vip').length
        setStats({
          vipCount,
          totalCustomers: customersData.length
        })
      } else {
        // Fall back to the method above
        await fetchCustomers()
      }
    } catch (error) {
      console.error('Error fetching customers directly:', error)
      await fetchCustomers() // Fall back
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      `${customer.prenom} ${customer.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.id_client.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Add a new customer (this creates a user with CLIENT role)
  const handleAddCustomer = async () => {
    // You would open a dialog similar to the Add User dialog
    // For now, just show a toast
    toast({
      title: 'Info',
      description: 'To add a customer, use the "Add User" feature in Dashboard with CLIENT role.',
      variant: 'default'
    })
  }

  // View customer details
  const handleViewCustomer = (customerId) => {
    // Navigate to customer details page or open modal
    console.log('View customer:', customerId)
    toast({
      title: 'View Customer',
      description: `Opening details for customer ${customerId}`,
      variant: 'default'
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage guest profiles and history</p>
        </div>
        <Button variant="gold" onClick={handleAddCustomer}>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 animate-slide-up">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
            disabled={isLoading}
          />
        </div>
        <div className="flex gap-4">
          <div className="bg-card rounded-xl px-6 py-3 border border-border/50 flex items-center gap-2">
            <Star className="w-5 h-5 text-accent" />
            <span className="font-display font-semibold text-foreground">{stats.vipCount}</span>
            <span className="text-sm text-muted-foreground">VIP Guests</span>
          </div>
          <div className="bg-card rounded-xl px-6 py-3 border border-border/50 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-display font-semibold text-foreground">{stats.totalCustomers}</span>
            <span className="text-sm text-muted-foreground">Total Customers</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading customers...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Customers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCustomers.map((customer, index) => (
              <div
                key={customer.id_client}
                className="bg-card rounded-xl border border-border/50 p-6 hover:shadow-lg transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-navy flex items-center justify-center">
                      <span className="text-lg font-semibold text-sidebar-foreground">
                        {getInitials(customer.nom, customer.prenom)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">
                        {customer.prenom} {customer.nom}
                      </h3>
                      <p className="text-sm text-muted-foreground">{customer.id_client}</p>
                      <p className="text-xs text-muted-foreground">
                        Member since {formatDate(customer.date_inscription)}
                      </p>
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
                    <span>{customer.telephone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{customer.location}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="font-display text-lg font-bold text-foreground">
                      ${customer.totalSpent.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Bookings</p>
                    <p className="font-display text-lg font-bold text-foreground">
                      {customer.totalBookings}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleViewCustomer(customer.id_client)}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {searchQuery ? 'No customers found' : 'No customers yet'}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery 
                  ? 'Try adjusting your search query' 
                  : 'Start by adding customers through the Users section'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Customers