import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, Star, Wifi, Car, Coffee, Dumbbell, Waves, MapPin, Phone, Mail, ChevronRight, Hotel, Lock, User, Briefcase, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const API_BASE_URL = 'http://localhost:5000';

// Mock amenities (can be fetched from API if you have them)
const amenitiesData = [
  { icon: Wifi, label: 'Free WiFi' },
  { icon: Car, label: 'Free Parking' },
  { icon: Coffee, label: 'Restaurant' },
  { icon: Dumbbell, label: 'Fitness Center' },
  { icon: Waves, label: 'Swimming Pool' },
];

const BookingModal = ({ room, user, children }) => {
  const [checkIn, setCheckIn] = useState();
  const [checkOut, setCheckOut] = useState();
  const [guests, setGuests] = useState('2');
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleBooking = async () => {
    if (!checkIn || !checkOut) {
      toast({
        title: 'Missing Information',
        description: 'Please select check-in and check-out dates.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to make a reservation.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create reservation
      const reservationResponse = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_client: user.client?.id_client || user.id_user,
          roomIds: [room.id_room],
          date_debut: checkIn.toISOString(),
          date_fin: checkOut.toISOString(),
        }),
      });

      if (!reservationResponse.ok) {
        const errorData = await reservationResponse.json();
        throw new Error(errorData.message || 'Failed to create reservation');
      }

      const reservationData = await reservationResponse.json();

      toast({
        title: 'Booking Confirmed! 🎉',
        description: `Your reservation for ${room.numero} from ${format(checkIn, 'PP')} to ${format(checkOut, 'PP')} has been submitted.`,
      });

      // Navigate to user's reservations or show success page
      navigate('/dashboard/reservations');
      setOpen(false);

    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to create reservation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const total = nights * room.prix_par_nuit;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Book Room {room.numero}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !checkIn && 'text-muted-foreground')}>
                    <Calendar className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, 'PP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Check-out Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !checkOut && 'text-muted-foreground')}>
                    <Calendar className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, 'PP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={(date) => date < (checkIn || new Date())}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Number of Guests</Label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map(num => (
                  <SelectItem key={num} value={String(num)}>
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {user ? (
            <div className="bg-success/10 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-success">
                <User className="w-4 h-4" />
                <span className="font-medium">Logged in as: {user.prenom} {user.nom}</span>
                
               
              </div>
              <p className="text-sm text-success/70">You can proceed with your booking.</p>
            </div>
          ) : (
            <div className="bg-warning/10 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-warning">
                <Lock className="w-4 h-4" />
                <span className="font-medium">Login Required</span>
              </div>
              <p className="text-sm text-warning/70">
                Please{' '}
                <Link to="/login" className="text-accent hover:underline" onClick={() => setOpen(false)}>
                  login
                </Link>{' '}
                to make a reservation.
              </p>
            </div>
          )}

          {nights > 0 && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>${room.prix_par_nuit} x {nights} nights</span>
                <span>${total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Taxes & fees</span>
                <span>${Math.round(total * 0.12)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-accent">${total + Math.round(total * 0.12)}</span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleBooking} 
            className="w-full" 
            size="lg"
            disabled={!user || isLoading || !checkIn || !checkOut}
          >
            {isLoading ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Landing = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
    checkAuthStatus();
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/available`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Transform API data to match frontend format
      const transformedRooms = data.map(room => ({
        id_room: room.id_room,
        numero: room.numero,
        name: `${room.roomType?.nom_type || 'Room'} ${room.numero}`,
        type: room.roomType?.nom_type || 'Standard',
        price: room.prix_par_nuit,
        capacity: getRoomCapacity(room.roomType?.nom_type),
        size: getRoomSize(room.roomType?.nom_type),
        image: getRoomImage(room.roomType?.nom_type),
        amenities: getRoomAmenities(room.roomType?.nom_type),
        rating: 4.7, // You can calculate this from reviews if you have them
        available: true,
        roomData: room
      }));
      
      setRooms(transformedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rooms. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  const handleBookClick = (e, room) => {
    if (!user) {
      e.preventDefault();
      setShowLoginAlert(true);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  const handleEmployeeLoginRedirect = () => {
    navigate('/login?role=employee');
  };

  const handleAdminLoginRedirect = () => {
    navigate('/login?role=admin');
  };

  // Helper functions
  const getRoomCapacity = (roomType) => {
    switch(roomType) {
      case 'SINGLE': return 1;
      case 'DOUBLE': return 2;
      case 'SUITE': return 4;
      default: return 2;
    }
  };

  const getRoomSize = (roomType) => {
    switch(roomType) {
      case 'SINGLE': return '25 sqm';
      case 'DOUBLE': return '35 sqm';
      case 'SUITE': return '55 sqm';
      default: return '30 sqm';
    }
  };

  const getRoomImage = (roomType) => {
    const images = {
      'SINGLE': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
      'DOUBLE': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop',
      'SUITE': 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop',
    };
    return images[roomType] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=400&fit=crop';
  };

  const getRoomAmenities = (roomType) => {
    const baseAmenities = ['Free WiFi', 'Air Conditioning', 'TV'];
    
    switch(roomType) {
      case 'SUITE':
        return [...baseAmenities, 'Mini Bar', 'Room Service', 'Ocean View'];
      case 'DOUBLE':
        return [...baseAmenities, 'City View', 'Work Desk'];
      case 'SINGLE':
        return [...baseAmenities, 'City View'];
      default:
        return baseAmenities;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Login Alert Dialog */}
      <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to login to make a reservation. Please login with your account or register if you don't have one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/register')}>
              Register as Client
            </AlertDialogAction>
            <AlertDialogAction onClick={() => navigate('/login')}>
              Client Login
            </AlertDialogAction>
            
           
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center">
                 <Hotel className="w-8 h-8 text-accent-foreground" />
              </div>
              <span className="font-display text-xl font-semibold text-foreground">HotelDesk</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#rooms" className="text-muted-foreground hover:text-foreground transition-colors">Rooms</a>
              <a href="#amenities" className="text-muted-foreground hover:text-foreground transition-colors">Amenities</a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
              {user ? (
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {user.prenom}
                    {user.role === 'ADMIN' && (
                      <Shield className="w-3 h-3 ml-1 text-destructive" />
                    )}
                    {user.role === 'EMPLOYEE' && (
                      <Briefcase className="w-3 h-3 ml-1 text-accent" />
                    )}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                  <Link to="/dashboard">
                    <Button variant="gold" size="sm">Dashboard</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={handleRegisterRedirect}>
                    Register as Client
                  </Button>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      
                    
                    </div>
                    <Button variant="gold" size="sm" onClick={handleLoginRedirect}>
                      Login
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="md:hidden">
              {user ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {user.prenom}
                  </Badge>
                  <Link to="/dashboard">
                    <Button variant="gold" size="sm">Dashboard</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleRegisterRedirect}>
                    Register
                  </Button>
                  <Button variant="gold" size="sm" onClick={handleLoginRedirect}>
                    Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&h=1080&fit=crop"
            alt="Luxury Hotel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-primary/90 via-primary/70 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl space-y-6 animate-fade-in">
            <Badge className="bg-accent/20 text-accent border-accent/30 px-4 py-1">
              ★★★★★ Luxury Experience
            </Badge>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight">
              Experience <br />
              <span className="text-accent">Unforgettable</span> <br />
              Luxury
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-lg">
              Discover world-class hospitality. Browse our available rooms and book your perfect stay.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#rooms">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  View Rooms <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              {user ? (
                <Link to="/dashboard/reservations">
                  <Button size="lg" variant="outline" className="border-primary-foreground/30 text-accent hover:bg-primary-foreground/10">
                    My Reservations
                  </Button>
                </Link>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-primary-foreground/30 text-accent hover:bg-primary-foreground/10" 
                    onClick={handleRegisterRedirect}
                  >
                    Register as Client
                  </Button>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="lg" 
                      className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" 
                      onClick={handleLoginRedirect}
                    >
                    Login
                    </Button>
                   
                   
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: `${rooms.filter(room => room.available).length}+`, label: 'Available Rooms' },
              { value: '15+', label: 'Years Experience' },
              { value: '50K+', label: 'Happy Guests' },
              { value: '4.8', label: 'Guest Rating' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-3xl md:text-4xl font-display font-bold text-accent">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4">Available Rooms</Badge>
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              Choose Your Perfect Room
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our currently available rooms. {!user && 'Login or register to make a reservation.'}
            </p>
            {!user && (
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRegisterRedirect}
                  className="flex items-center gap-1"
                >
                  Register as Client
                </Button>
                <Button 
                  variant="gold" 
                  size="sm"
                  onClick={handleLoginRedirect}
                  className="flex items-center gap-1"
                >
                  Client Login
                </Button>
                
                
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading available rooms...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map((room, index) => (
                  <Card
                    key={room.id_room}
                    className={cn(
                      'overflow-hidden group hover:shadow-lg transition-all duration-300 animate-slide-up',
                      !room.available && 'opacity-60'
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                          {room.type}
                        </Badge>
                        {!room.available && (
                          <Badge variant="destructive">Fully Booked</Badge>
                        )}
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-accent text-accent-foreground flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> {room.rating}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        {room.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" /> {room.capacity} Guests
                        </span>
                        <span>{room.size}</span>
                        <span>Floor {room.roomData?.etage || 'N/A'}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {room.amenities.slice(0, 3).map((amenity) => (
                          <Badge key={amenity} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {room.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{room.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div>
                          <span className="text-2xl font-display font-bold text-foreground">${room.price}</span>
                          <span className="text-muted-foreground text-sm"> / night</span>
                        </div>
                        {room.available ? (
                          <BookingModal room={room.roomData} user={user}>
                            <Button 
                              onClick={(e) => handleBookClick(e, room)}
                              disabled={!user}
                            >
                              {user ? 'Book Now' : 'Login to Book'}
                            </Button>
                          </BookingModal>
                        ) : (
                          <Button disabled>Unavailable</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {rooms.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Hotel className="w-16 h-16 mx-auto text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">No rooms available</h3>
                  <p className="mt-2 text-muted-foreground">
                    All our rooms are currently booked. Please check back later.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4">Hotel Features</Badge>
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              World-Class Amenities
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enjoy our premium facilities designed for your comfort and convenience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {amenitiesData.map((amenity, index) => (
              <div
                key={amenity.label}
                className="bg-card rounded-xl p-6 text-center shadow-sm border border-border/50 hover:shadow-md hover:border-accent/30 transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <amenity.icon className="w-7 h-7 text-accent" />
                </div>
                <p className="font-medium text-foreground">{amenity.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">Get in Touch</Badge>
              <h2 className="font-display text-4xl font-bold mb-6">
                We're Here to Help
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                Have questions about your reservation or need special arrangements? Our dedicated team is available to assist you.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-primary-foreground/70">123 Luxury Street, Hotel District</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-primary-foreground/70">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-primary-foreground/70">info@grandstay.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-primary-foreground/10 rounded-2xl p-8">
              <h3 className="font-display text-2xl font-semibold mb-6">Send us a Message</h3>
              <form className="space-y-4">
                <Input placeholder="Your Name" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50" />
                <Input type="email" placeholder="Your Email" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50" />
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full rounded-lg px-4 py-3 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
                <Hotel className="w-6 h-6 text-accent-foreground" />
              </div>
              <span className="font-display font-semibold text-foreground">HotelDesk</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 HotelDesk. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              {!user ? (
                <>
                  <Link to="/register" className="hover:text-foreground transition-colors">
                    Register as Client
                  </Link>
                  <Link to="/login" className="hover:text-foreground transition-colors">
                    Login
                  </Link>
                  
                </>
              ) : (
                <Link to="/dashboard" className="hover:text-foreground transition-colors">
                  My Dashboard
                </Link>
              )}
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
