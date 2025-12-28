import React, { useState } from 'react';
import { Search, Plus, BedDouble, Users, Wifi, Wind, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RoomsAPI } from '@/api/rooms.api';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';



const statusStyles = {
  available: 'bg-success/10 text-success border-success/20',
  occupied: 'bg-accent/10 text-accent border-accent/20',
  maintenance: 'bg-destructive/10 text-destructive border-destructive/20',
  reserved: 'bg-primary/10 text-primary border-primary/20',
};

const amenityIcons = {
  wifi: <Wifi className="w-4 h-4" />,
  tv: <Tv className="w-4 h-4" />,
  ac: <Wind className="w-4 h-4" />,
};

const Rooms = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rooms, setRooms] = useState([]);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({
    number: '',
    floor: '',
    price: '',
    status: '',
  });
useEffect(() => {
  const fetchRooms = async () => {
    try {
      const res = await RoomsAPI.getAll();

      // adapt backend → frontend
      const formattedRooms = res.data.map((room) => ({
        id: room.id_room,
        number: room.numero,
        floor: room.etage,
        price: room.prix_par_nuit,
        status: room.statut.toLowerCase(),
        type: room.type?.nom_type ?? 'Standard',
        capacity: room.type?.capacite ?? 2,
        amenities: ['wifi', 'tv', 'ac'],
      }));

      setRooms(formattedRooms);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load rooms',
        variant: 'destructive',
      });
    }
  };

  fetchRooms();
}, []);

const handleAddRoom = async () => {
  try {
    const payload = {
      numero: roomForm.number,
      etage: Number(roomForm.floor),
      prix_par_nuit: Number(roomForm.price),
      statut: roomForm.status.toUpperCase(),
      id_type: 1, // TEMP — later select from UI
    };

    const res = await RoomsAPI.create(payload);

    setRooms((prev) => [
      ...prev,
      {
        id: res.data.id_room,
        number: res.data.numero,
        floor: res.data.etage,
        price: res.data.prix_par_nuit,
        status: res.data.statut.toLowerCase(),
        type: 'Standard',
        capacity: 2,
        amenities: ['wifi', 'tv', 'ac'],
      },
    ]);

    toast({
      title: 'Success',
      description: 'Room created successfully',
    });

    setIsAddRoomOpen(false);
    setRoomForm({ number: '', floor: '', price: '', status: '' });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to create room',
      variant: 'destructive',
    });
  }
};


  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.number.includes(searchQuery) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || room.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Rooms
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all hotel rooms and their availability
          </p>
        </div>
        <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
          <DialogTrigger asChild>
            <Button variant="gold">
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                Add New Room
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number *</Label>
                  <Input
                    id="roomNumber"
                    placeholder="e.g. 501"
                    value={roomForm.number}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, number: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Level Number *</Label>
                  <Input
                    id="floor"
                    type="number"
                    placeholder="e.g. 5"
                    value={roomForm.floor}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, floor: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price Per Night *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g. 150"
                  value={roomForm.price}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, price: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={roomForm.status}
                  onValueChange={(value) =>
                    setRoomForm({ ...roomForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsAddRoomOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="gold"
                  className="flex-1"
                  onClick={handleAddRoom}
                >
                  Add Room
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'available', 'occupied', 'reserved', 'maintenance'].map(
            (status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ),
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map((room, index) => (
          <div
            key={room.id}
            className="bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300 animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="h-32 bg-gradient-navy relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <BedDouble className="w-12 h-12 text-sidebar-foreground/30" />
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'absolute top-3 right-3 capitalize',
                  statusStyles[room.status],
                )}
              >
                {room.status}
              </Badge>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Room {room.number}
                  </h3>
                  <p className="text-sm text-muted-foreground">{room.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-bold text-accent">
                    ${room.price}
                  </p>
                  <p className="text-xs text-muted-foreground">/night</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {room.capacity}
                </span>
                <span>Floor {room.floor}</span>
              </div>
              <div className="flex gap-2">
                {room.amenities.slice(0, 3).map((amenity) => (
                  <div
                    key={amenity}
                    className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"
                    title={amenity}
                  >
                    {amenityIcons[amenity] || amenity.charAt(0).toUpperCase()}
                  </div>
                ))}
                {room.amenities.length > 3 && (
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">
                    +{room.amenities.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rooms;
