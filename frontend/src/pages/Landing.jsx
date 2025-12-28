import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Star, Wifi, Car, Coffee, Dumbbell, Waves, MapPin, Phone, Mail, ChevronRight ,Hotel } from 'lucide-react';
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

const rooms = [
  {
    id: 1,
    name: 'Deluxe King Suite',
    type: 'Suite',
    price: 299,
    capacity: 2,
    size: '45 sqm',
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop',
    amenities: ['Free WiFi', 'Ocean View', 'Mini Bar', 'Room Service'],
    rating: 4.9,
    available: true,
  },
  {
    id: 2,
    name: 'Premium Ocean View',
    type: 'Deluxe',
    price: 199,
    capacity: 2,
    size: '35 sqm',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop',
    amenities: ['Free WiFi', 'Ocean View', 'Balcony'],
    rating: 4.7,
    available: true,
  },
  {
    id: 3,
    name: 'Family Suite',
    type: 'Suite',
    price: 399,
    capacity: 4,
    size: '60 sqm',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=400&fit=crop',
    amenities: ['Free WiFi', 'Kitchen', '2 Bedrooms', 'Living Area'],
    rating: 4.8,
    available: true,
  },
  {
    id: 4,
    name: 'Executive Room',
    type: 'Standard',
    price: 149,
    capacity: 2,
    size: '28 sqm',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop',
    amenities: ['Free WiFi', 'Work Desk', 'City View'],
    rating: 4.5,
    available: true,
  },
  {
    id: 5,
    name: 'Honeymoon Suite',
    type: 'Suite',
    price: 449,
    capacity: 2,
    size: '55 sqm',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
    amenities: ['Free WiFi', 'Private Jacuzzi', 'Champagne', 'Rose Petals'],
    rating: 5.0,
    available: true,
  },
  {
    id: 6,
    name: 'Standard Double',
    type: 'Standard',
    price: 99,
    capacity: 2,
    size: '22 sqm',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
    amenities: ['Free WiFi', 'TV', 'Air Conditioning'],
    rating: 4.3,
    available: false,
  },
];

const amenitiesData = [
  { icon: Wifi, label: 'Free WiFi' },
  { icon: Car, label: 'Free Parking' },
  { icon: Coffee, label: 'Restaurant' },
  { icon: Dumbbell, label: 'Fitness Center' },
  { icon: Waves, label: 'Swimming Pool' },
];

const BookingModal = ({ room, children }) => {
  const [checkIn, setCheckIn] = useState();
  const [checkOut, setCheckOut] = useState();
  const [guests, setGuests] = useState('2');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [open, setOpen] = useState(false);

  const handleBooking = () => {
    if (!checkIn || !checkOut || !name || !email || !phone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Booking Confirmed! 🎉',
      description: `Your reservation for ${room.name} from ${format(checkIn, 'PP')} to ${format(checkOut, 'PP')} has been submitted.`,
    });
    setOpen(false);
  };

  const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const total = nights * room.price;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Book {room.name}</DialogTitle>
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
                {[...Array(room.capacity)].map((_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" />
            </div>
          </div>

          {nights > 0 && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>${room.price} x {nights} nights</span>
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

          <Button onClick={handleBooking} className="w-full" size="lg">
            Confirm Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
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
            </div>
            <Link to="/login">
              <Button variant="outline" size="sm" className="text-primary-foreground bg-accent">Staff Login</Button>
            </Link>
          </div>
        </div>
      </nav>

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
              Discover world-class hospitality in the heart of paradise. Our elegant rooms and exceptional service create memories that last a lifetime.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#rooms">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Explore Rooms <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <a href="#contact">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-accent hover:bg-primary-foreground/10">
                  Contact Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-card border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '120+', label: 'Luxury Rooms' },
              { value: '15+', label: 'Years Experience' },
              { value: '50K+', label: 'Happy Guests' },
              { value: '4.9', label: 'Guest Rating' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-3xl md:text-4xl font-display font-bold text-accent">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="rooms" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4">Our Accommodations</Badge>
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              Choose Your Perfect Room
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From cozy standard rooms to lavish suites, find the perfect space for your stay.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room, index) => (
              <Card
                key={room.id}
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
                      <BookingModal room={room}>
                        <Button>Book Now</Button>
                      </BookingModal>
                    ) : (
                      <Button disabled>Unavailable</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

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

      <section id="contact" className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">Get in Touch</Badge>
              <h2 className="font-display text-4xl font-bold mb-6">
                We're Here to Help
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                Have questions about your reservation or need special arrangements? Our dedicated team is available 24/7 to assist you.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-primary-foreground/70">123 Ocean Drive, Paradise City</p>
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