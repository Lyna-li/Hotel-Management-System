import React, { useState, useEffect } from 'react';
import { Search, Plus, BedDouble, Users, Wifi, Wind, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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

const API_BASE_URL =  'http://localhost:5000';

const statusMapping = {
  AVAILABLE: 'available',
  OUT_OF_SERVICE: 'maintenance',
  // Map other statuses as needed
};

const reverseStatusMapping = {
  available: 'AVAILABLE',
  occupied: 'OCCUPIED', // Note: This doesn't exist in your schema
  reserved: 'RESERVED', // Note: This doesn't exist in your schema
  maintenance: 'OUT_OF_SERVICE',
};

const amenityIcons = {
  wifi: <Wifi className="w-4 h-4" />,
  tv: <Tv className="w-4 h-4" />,
  ac: <Wind className="w-4 h-4" />,
};

// Helper function to get room type name
const getRoomTypeName = (id_type, roomTypes) => {
  const roomType = roomTypes.find(type => type.id_type === id_type);
  console.log('Room Types:', roomTypes);
  return roomType ? roomType.nom_type : 'Unknown';
};

// Helper function to get room capacity based on type
const getRoomCapacity = (roomTypeEnum) => {
  switch(roomTypeEnum) {
    case 'SINGLE': return 1;
    case 'DOUBLE': return 2;
    case 'SUITE': return 4;
    default: return 2;
  }
};

const Rooms = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roomForm, setRoomForm] = useState({
    numero: '',
    etage: '',
    prix_par_nuit: '',
    statut: 'available',
    id_type: '',
  });

  // Fetch rooms and room types on component mount
  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Transform API data to match frontend format
      const transformedRooms = data.map(room => ({
        id_room: room.id_room,
        numero: room.numero,
        etage: room.etage,
        prix_par_nuit: room.prix_par_nuit,
        statut: room.statut,
        id_type: room.id_type,
        // Add derived properties for display
        status: statusMapping[room.statut] || room.statut.toLowerCase(),
        type: getRoomTypeName(room.id_type, roomTypes),
        capacity: getRoomCapacity(room.roomType?.nom_type),
        amenities: ['wifi', 'tv', 'ac'], // Default amenities for now
      }));
      
      setRooms(transformedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rooms. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
  try {
    console.log('Fetching room types from:', `${API_BASE_URL}/room-types`);
    const response = await fetch(`${API_BASE_URL}/room-types`);
    console.log('Room Types Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Room Types Data:', data);
      setRoomTypes(data);
    } else {
      console.error('Failed to fetch room types:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching room types:', error);
    toast({
      title: 'Error',
      description: 'Failed to load room types',
      variant: 'destructive',
    });
  }
};
  const handleAddRoom = async () => {
    // Validate fields
    if (!roomForm.numero || !roomForm.etage || !roomForm.prix_par_nuit || !roomForm.statut || !roomForm.id_type) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numero: roomForm.numero,
          etage: parseInt(roomForm.etage, 10),
          prix_par_nuit: parseFloat(roomForm.prix_par_nuit),
          statut: reverseStatusMapping[roomForm.statut] || roomForm.statut.toUpperCase(),
          id_type: parseInt(roomForm.id_type, 10),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create room');
      }

      // Refresh rooms list
      await fetchRooms();
      
      toast({
        title: 'Success',
        description: `Room ${data.numero} created successfully`,
      });

      // Reset form and close dialog
      setRoomForm({ 
        numero: '', 
        etage: '', 
        prix_par_nuit: '', 
        statut: 'available', 
        id_type: '' 
      });
      setIsAddRoomOpen(false);

    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create room. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRoomStatus = async (roomId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statut: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update room status');
      }

      // Update local state
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id_room === roomId 
            ? { 
                ...room, 
                statut: newStatus,
                status: statusMapping[newStatus] || newStatus.toLowerCase()
              }
            : room
        )
      );

      toast({
        title: 'Success',
        description: 'Room status updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update room status',
        variant: 'destructive',
      });
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.numero.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || room.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusStyles = {
    available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    maintenance: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    // Add other status styles as needed
  };

  return (
    <div className="space-y-8">
      {/* Header + Add Room */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Rooms</h1>
          <p className="text-muted-foreground mt-1">
            Manage all hotel rooms and their availability
          </p>
        </div>

        {/* Add Room Dialog */}
        <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
          <DialogTrigger asChild>
            <Button variant="gold">
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Add New Room</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero">Room Number *</Label>
                  <Input
                    id="numero"
                    placeholder="e.g. 501"
                    value={roomForm.numero}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, numero: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="etage">Level Number *</Label>
                  <Input
                    id="etage"
                    type="number"
                    placeholder="e.g. 5"
                    value={roomForm.etage}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, etage: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prix_par_nuit">Price Per Night *</Label>
                <Input
                  id="prix_par_nuit"
                  type="number"
                  placeholder="e.g. 150"
                  value={roomForm.prix_par_nuit}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, prix_par_nuit: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_type">Room Type *</Label>
                <Select
                  value={roomForm.id_type}
                  onValueChange={(value) => setRoomForm({ ...roomForm, id_type: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.id_type} value={type.id_type.toString()}>
                        {type.nom_type} - ${type.base_price || 'N/A'} per night
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statut">Status *</Label>
                <Select
                  value={roomForm.statut}
                  onValueChange={(value) => setRoomForm({ ...roomForm, statut: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="maintenance">Out of Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsAddRoomOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="gold" 
                  className="flex-1" 
                  onClick={handleAddRoom}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Add Room'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search rooms by number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
            disabled={isLoading}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'available', 'maintenance'].map(
            (status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className="capitalize"
                disabled={isLoading}
              >
                {status}
              </Button>
            ),
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && rooms.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading rooms...</p>
          </div>
        </div>
      )}

      {/* Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {!isLoading && filteredRooms.map((room, index) => (
          <div
            key={room.id_room}
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
                  statusStyles[room.status] || 'bg-gray-100 text-gray-800'
                )}
              >
                {room.status}
              </Badge>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Room {room.numero}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">{room.type || 'Unknown Type'}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-bold text-accent">
                    ${room.prix_par_nuit}
                  </p>
                  <p className="text-xs text-muted-foreground">/night</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {getRoomCapacity(room.type)}
                </span>
                <span>Floor {room.etage}</span>
              </div>
              <div className="flex gap-2">
                {room.amenities?.slice(0, 3).map((amenity) => (
                  <div
                    key={amenity}
                    className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"
                    title={amenity}
                  >
                    {amenityIcons[amenity] || amenity.charAt(0).toUpperCase()}
                  </div>
                ))}
                {room.amenities?.length > 3 && (
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">
                    +{room.amenities.length - 3}
                  </div>
                )}
              </div>
              <div className="pt-2">
                <Select
                  value={room.statut}
                  onValueChange={(value) => handleUpdateRoomStatus(room.id_room, value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <BedDouble className="w-16 h-16 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No rooms found</h3>
          <p className="mt-2 text-muted-foreground">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter' 
              : 'Get started by adding your first room'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Rooms;