import React, { useState, useEffect } from 'react'
import { 
  Search, Plus, Calendar, MoreVertical, Filter, RefreshCw, 
  User, Bed, X, ChevronDown, Check, Users, Clock 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const API_BASE_URL = 'http://localhost:5000'

// Map Prisma status to frontend status
const statusMapping = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'checked-out',
}

// Reverse mapping for API calls
const reverseStatusMapping = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  cancelled: 'CANCELLED',
  'checked-out': 'COMPLETED',
  'checked-in': 'CONFIRMED',
}

const statusStyles = {
  confirmed: 'bg-accent/10 text-accent border-accent/20',
  'checked-in': 'bg-success/10 text-success border-success/20',
  'checked-out': 'bg-muted text-muted-foreground border-muted',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
}

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Calculate number of nights
const calculateNights = (date_debut, date_fin) => {
  if (!date_debut || !date_fin) return 0
  const start = new Date(date_debut)
  const end = new Date(date_fin)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Calculate total price
const calculateTotalPrice = (selectedRooms, date_debut, date_fin) => {
  if (!selectedRooms.length || !date_debut || !date_fin) return 0
  const nights = calculateNights(date_debut, date_fin)
  return selectedRooms.reduce((total, room) => total + (room.prix_par_nuit * nights), 0)
}

const Reservations = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [reservations, setReservations] = useState([])
  const [clients, setClients] = useState([])
  const [availableRooms, setAvailableRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingReservation, setIsAddingReservation] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [stats, setStats] = useState({
    todaysCheckins: 0,
    todaysCheckouts: 0,
    totalReservations: 0
  })

  // New reservation form state
  const [newReservation, setNewReservation] = useState({
    id_client: '',
    roomIds: [],
    date_debut: '',
    date_fin: '',
    notes: '',
  })

  // Date picker states
  const [checkInDate, setCheckInDate] = useState()
  const [checkOutDate, setCheckOutDate] = useState()

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchReservations(),
        fetchClients(),
        fetchAvailableRooms()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load data. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReservations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Transform API data to match frontend format
      const transformedReservations = data.map(reservation => {
        const guestName = reservation.client?.user 
          ? `${reservation.client.user.prenom} ${reservation.client.user.nom}`
          : 'Unknown Guest'
        
        const guestEmail = reservation.client?.user?.email || 'N/A'
        
        const firstRoom = reservation.rooms?.[0]?.room
        const roomNumber = firstRoom?.numero || 'N/A'
        const roomType = firstRoom?.roomType?.nom_type || 'Unknown'
        
        let total = 0
        if (reservation.payments && reservation.payments.length > 0) {
          total = reservation.payments.reduce((sum, payment) => sum + payment.montant, 0)
        } else if (firstRoom && reservation.date_debut && reservation.date_fin) {
          const nights = calculateNights(reservation.date_debut, reservation.date_fin)
          total = (firstRoom.prix_par_nuit || 0) * nights
        }
        
        let frontendStatus = statusMapping[reservation.statut] || reservation.statut.toLowerCase()
        
        if (frontendStatus === 'confirmed') {
          const today = new Date()
          const checkIn = new Date(reservation.date_debut)
          const checkOut = new Date(reservation.date_fin)
          
          if (today >= checkIn && today <= checkOut) {
            frontendStatus = 'checked-in'
          }
        }
        
        return {
          id_reservation: reservation.id_reservation,
          id: `RES${reservation.id_reservation.toString().padStart(3, '0')}`,
          guest: guestName,
          email: guestEmail,
          room: roomNumber,
          roomType: roomType,
          checkIn: reservation.date_debut,
          checkOut: reservation.date_fin,
          nights: calculateNights(reservation.date_debut, reservation.date_fin),
          total: total,
          status: frontendStatus,
          backendStatus: reservation.statut,
          clientId: reservation.id_client,
          rooms: reservation.rooms || [],
          payments: reservation.payments || [],
          created_at: reservation.created_at
        }
      })
      
      setReservations(transformedReservations)
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0]
      const todaysCheckins = transformedReservations.filter(res => 
        res.checkIn && res.checkIn.split('T')[0] === today
      ).length
      
      const todaysCheckouts = transformedReservations.filter(res => 
        res.checkOut && res.checkOut.split('T')[0] === today
      ).length
      
      setStats({
        todaysCheckins,
        todaysCheckouts,
        totalReservations: transformedReservations.length
      })
      
    } catch (error) {
      console.error('Error fetching reservations:', error)
      throw error
    }
  }

  const fetchClients = async () => {
    try {
      // First get all users
      const usersResponse = await fetch(`${API_BASE_URL}/users`)
      if (!usersResponse.ok) throw new Error('Failed to fetch users')
      const allUsers = await usersResponse.json()
      console.log('All Users:', allUsers) 
      // Filter only CLIENT role users
      const clientUsers = allUsers.filter(user => user.role === 'CLIENT')
      console.log('Client Users:', clientUsers)
      // Get client details for each user
      const clientsWithDetails = await Promise.all(
        clientUsers.map(async (user) => {
          try {
            const clientResponse = await fetch(`${API_BASE_URL}/users/${user.id_user}`)
            if (clientResponse.ok) {
              const clientData = await clientResponse.json()
              return {
                id_client: clientData.id_client,
                id_user: user.id_user,
                name: `${user.prenom} ${user.nom}`,
                email: user.email,
                phone: user.telephone || 'N/A',
                totalBookings: 0 // You can calculate this from reservations
              }
            }
            return null
          } catch (error) {
            console.error(`Error fetching client ${user.id_user}:`, error)
            return null
          }
        })
      )
      
      setClients(clientsWithDetails.filter(client => client !== null))
      console.log('Clients with Details:', clientsWithDetails)
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast({
        title: 'Warning',
        description: 'Could not load client list',
        variant: 'default'
      })
    }
  }

  const fetchAvailableRooms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/available`)
      if (response.ok) {
        const data = await response.json()
        setAvailableRooms(data)
      }
    } catch (error) {
      console.error('Error fetching available rooms:', error)
    }
  }

  const handleCheckAvailability = async () => {
    if (!newReservation.date_debut || !newReservation.date_fin || !newReservation.roomIds.length) {
      toast({
        title: 'Error',
        description: 'Please select dates and at least one room',
        variant: 'destructive'
      })
      return
    }

    setIsCheckingAvailability(true)
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomIds: newReservation.roomIds,
          date_debut: newReservation.date_debut,
          date_fin: newReservation.date_fin,
        })
      })
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Selected rooms are available for these dates!',
          variant: 'default'
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Rooms are not available')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  const handleAddReservation = async () => {
    // Validate form
    if (!newReservation.id_client) {
      toast({
        title: 'Error',
        description: 'Please select a client',
        variant: 'destructive'
      })
      return
    }

    if (!newReservation.roomIds.length) {
      toast({
        title: 'Error',
        description: 'Please select at least one room',
        variant: 'destructive'
      })
      return
    }

    if (!newReservation.date_debut || !newReservation.date_fin) {
      toast({
        title: 'Error',
        description: 'Please select check-in and check-out dates',
        variant: 'destructive'
      })
      return
    }

    if (new Date(newReservation.date_fin) <= new Date(newReservation.date_debut)) {
      toast({
        title: 'Error',
        description: 'Check-out date must be after check-in date',
        variant: 'destructive'
      })
      return
    }
    console.log('Adding Reservation:', newReservation)
    setIsAddingReservation(true)
    try {
      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_client: parseInt(newReservation.id_client, 10),
          roomIds: newReservation.roomIds.map(id => parseInt(id, 10)),
          date_debut: newReservation.date_debut,
          date_fin: newReservation.date_fin,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create reservation')
      }

      toast({
        title: 'Success',
        description: `Reservation ${data.id_reservation ? 'RES' + data.id_reservation.toString().padStart(3, '0') : ''} created successfully`,
      })

      // Reset form and close dialog
      setNewReservation({
        id_client: '',
        roomIds: [],
        date_debut: '',
        date_fin: '',
        notes: '',
      })
      setCheckInDate()
      setCheckOutDate()

      // Refresh all data
      await fetchAllData()
      
    } catch (error) {
      console.error('Error creating reservation:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create reservation. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsAddingReservation(false)
    }
  }

  const handleUpdateStatus = async (reservationId, newStatus) => {
    try {
      let endpoint = ''
      let method = 'PUT'
      
      switch(newStatus) {
        case 'CONFIRMED':
          endpoint = `${API_BASE_URL}/reservations/${reservationId}/confirm`
          break
        case 'COMPLETED':
          endpoint = `${API_BASE_URL}/reservations/${reservationId}/finish`
          break
        case 'CANCELLED':
          endpoint = `${API_BASE_URL}/reservations/${reservationId}`
          method = 'DELETE'
          break
        default:
          throw new Error('Invalid status update')
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method === 'DELETE' ? undefined : JSON.stringify({
          employeeId: 1 // You should get this from user session
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update reservation status')
      }
      
      // Refresh reservations
      await fetchReservations()
      
      toast({
        title: 'Success',
        description: 'Reservation status updated successfully',
      })
      
    } catch (error) {
      console.error('Error updating reservation status:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update reservation status',
        variant: 'destructive'
      })
    }
  }

  const handleDateSelect = (type, date) => {
    if (type === 'checkIn') {
      setCheckInDate(date)
      const formattedDate = date ? format(date, 'yyyy-MM-dd') : ''
      setNewReservation(prev => ({ ...prev, date_debut: formattedDate }))
      
      // If check-out is before new check-in, reset check-out
      if (checkOutDate && date && date > checkOutDate) {
        setCheckOutDate()
        setNewReservation(prev => ({ ...prev, date_fin: '' }))
      }
    } else {
      setCheckOutDate(date)
      const formattedDate = date ? format(date, 'yyyy-MM-dd') : ''
      setNewReservation(prev => ({ ...prev, date_fin: formattedDate }))
    }
  }

  const toggleRoomSelection = (roomId) => {
    setNewReservation(prev => {
      if (prev.roomIds.includes(roomId)) {
        return { ...prev, roomIds: prev.roomIds.filter(id => id !== roomId) }
      } else {
        return { ...prev, roomIds: [...prev.roomIds, roomId] }
      }
    })
  }

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch = 
      res.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.room.toString().includes(searchQuery) ||
      res.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = 
      filterStatus === 'all' || 
      res.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  // Calculate total price for new reservation
  const totalPrice = calculateTotalPrice(
    availableRooms.filter(room => newReservation.roomIds.includes(room.id_room)),
    newReservation.date_debut,
    newReservation.date_fin
  )
  const nights = calculateNights(newReservation.date_debut, newReservation.date_fin)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground mt-1">Manage guest bookings and reservations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAllData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {/* Add Reservation Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="gold">
                <Plus className="w-4 h-4 mr-2" />
                New Reservation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Create New Reservation</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Client Selection */}
                <div className="space-y-2">
                  <Label htmlFor="client">Select Client *</Label>
                  <Select
                    value={newReservation.id_client}
                    onValueChange={(value) => setNewReservation(prev => ({ ...prev, id_client: value }))}
                    disabled={isAddingReservation}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id_user} value={client.id_user.toString()}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{client.name}</span>
                            <span className="text-xs text-muted-foreground">({client.email})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Check-in Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={isAddingReservation}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {checkInDate ? format(checkInDate, 'PPP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={checkInDate}
                          onSelect={(date) => handleDateSelect('checkIn', date)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Check-out Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={isAddingReservation || !checkInDate}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {checkOutDate ? format(checkOutDate, 'PPP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={checkOutDate}
                          onSelect={(date) => handleDateSelect('checkOut', date)}
                          disabled={(date) => date <= checkInDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Room Selection */}
                <div className="space-y-2">
                  <Label>Select Rooms *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
                    {availableRooms.map((room) => (
                      <div
                        key={room.id_room}
                        className={cn(
                          'border rounded-lg p-3 cursor-pointer transition-all',
                          newReservation.roomIds.includes(room.id_room)
                            ? 'border-accent bg-accent/5'
                            : 'border-border hover:border-accent/50'
                        )}
                        onClick={() => toggleRoomSelection(room.id_room)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bed className="w-4 h-4" />
                            <div>
                              <p className="font-medium">Room {room.numero}</p>
                              <p className="text-sm text-muted-foreground">
                                {room.roomType?.nom_type || 'Unknown'} • Floor {room.etage}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${room.prix_par_nuit}/night</p>
                            {newReservation.roomIds.includes(room.id_room) && (
                              <Check className="w-4 h-4 text-accent ml-auto" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {newReservation.roomIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newReservation.roomIds.map(roomId => {
                        const room = availableRooms.find(r => r.id_room === roomId)
                        return room ? (
                          <Badge key={roomId} variant="secondary" className="gap-1">
                            Room {room.numero}
                            <X 
                              className="w-3 h-3 cursor-pointer" 
                              onClick={() => toggleRoomSelection(roomId)}
                            />
                          </Badge>
                        ) : null
                      })}
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                {(newReservation.date_debut && newReservation.date_fin && newReservation.roomIds.length > 0) && (
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold">Reservation Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Selected Rooms</p>
                        <p className="font-medium">{newReservation.roomIds.length} rooms</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{nights} night{nights !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="col-span-2 pt-2 border-t">
                        <p className="text-sm text-muted-foreground">Estimated Total</p>
                        <p className="font-display text-2xl font-bold text-accent">
                          ${totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or notes..."
                    value={newReservation.notes}
                    onChange={(e) => setNewReservation(prev => ({ ...prev, notes: e.target.value }))}
                    disabled={isAddingReservation}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewReservation({
                      id_client: '',
                      roomIds: [],
                      date_debut: '',
                      date_fin: '',
                      notes: '',
                    })
                    setCheckInDate()
                    setCheckOutDate()
                  }}
                  disabled={isAddingReservation}
                >
                  Clear
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCheckAvailability}
                  disabled={isAddingReservation || isCheckingAvailability}
                >
                  {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
                </Button>
                <Button
                  variant="gold"
                  onClick={handleAddReservation}
                  disabled={isAddingReservation || !newReservation.id_client || !newReservation.roomIds.length || !newReservation.date_debut || !newReservation.date_fin}
                >
                  {isAddingReservation ? 'Creating...' : 'Create Reservation'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-slide-up">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/4 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by guest name, ID, room, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
            disabled={isLoading}
          />
        </div>
        
        <div className="lg:col-span-1">
          <Select value={filterStatus} onValueChange={setFilterStatus} disabled={isLoading}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="checked-in">Checked-in</SelectItem>
              <SelectItem value="checked-out">Checked-out</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Stats Cards */}
        <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">{stats.todaysCheckins}</p>
            <p className="text-xs text-muted-foreground">Today's Check-ins</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">{stats.todaysCheckouts}</p>
            <p className="text-xs text-muted-foreground">Today's Check-outs</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading reservations...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Reservations Table */}
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
                    <tr key={res.id_reservation} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="py-4 px-6 font-medium text-foreground">{res.id}</td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-foreground">{res.guest}</p>
                        <p className="text-xs text-muted-foreground">{res.email}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-foreground">Room {res.room}</p>
                        <p className="text-xs text-muted-foreground capitalize">{res.roomType.toLowerCase()}</p>
                        {res.rooms.length > 1 && (
                          <p className="text-xs text-muted-foreground">+{res.rooms.length - 1} more</p>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {formatDate(res.checkIn)}
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {formatDate(res.checkOut)}
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-display font-semibold text-foreground">
                          ${res.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">{res.nights} nights</p>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={cn('capitalize', statusStyles[res.status])}>
                          {res.status.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Select
                          value=""
                          onValueChange={(value) => handleUpdateStatus(res.id_reservation, value)}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="w-32">
                            <MoreVertical className="w-4 h-4" />
                          </SelectTrigger>
                          <SelectContent>
                            {res.backendStatus === 'PENDING' && (
                              <SelectItem value="CONFIRMED">Confirm</SelectItem>
                            )}
                            {res.backendStatus === 'CONFIRMED' && (
                              <>
                                <SelectItem value="COMPLETED">Check-out</SelectItem>
                                <SelectItem value="CANCELLED">Cancel</SelectItem>
                              </>
                            )}
                            <SelectItem value="VIEW_DETAILS">View Details</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {filteredReservations.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {searchQuery || filterStatus !== 'all' 
                  ? 'No reservations found' 
                  : 'No reservations yet'}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search query or filter'
                  : 'Create your first reservation to get started'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Reservations